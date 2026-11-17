# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy"]
# ///
"""Give a Tour screen recording its music and synthesized UI sounds.

    uv run --offline --with numpy python -I scripts/tour_audio.py RECORDING_DIR MUSIC.wav OUT.mp4 [options]

RECORDING_DIR holds video-1080p.mp4 and events.json from the capture tool (phasyn-capture-events v1; `t` is seconds from
the first video frame). The output copies the video stream untouched (pass --video to take it from a re-encoded web copy
with the same timing instead) and adds AAC 160k stereo 48 kHz audio:

- music from 0 s, faded out over the last 1.5-2 s (the fade starts at the quietest point of that window), never longer
  than the video;
- a soft click (press + release 85 ms later) per click/select, at the start and end of each drag; a soft key tick per
  key press (repeats spaced as the recorder pressed them) and per typed character; a soft whoosh when a dialog opens or
  closes with a big on-screen change (detected from events.json `target.inDialog` plus the video's frame differences;
  override with --whoosh-at or --no-whoosh). All sounds are synthesized here, no samples;
- loudnorm two-pass to -16 LUFS integrated, true peak <= -1.5 dBTP, +faststart.

ffmpeg runs under `systemd-run --user --scope -p MemoryMax=6G` with -threads 4 when systemd-run exists.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import shutil
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np

SR = 48000
FPS_PROBE = 30
# Levels against the music's loudest 400 ms RMS, applied to each sound's own body RMS (dB).
L_CLICK, L_KEY, L_WHOOSH = -9.0, -15.0, -17.0
# Recorder timings (tools/capture/lib/recorder.mjs): mouse down->up 85 ms, key press 70 ms, default key repeat gap 260 ms.
CLICK_RELEASE_S, KEY_PRESS_S, KEY_GAP_DEFAULT_S = 0.085, 0.070, 0.260
# A "big" transition: mean absolute frame difference (0-255 grey, 192x108) at or above this within 0.9 s of the event.
BIG_CHANGE = 10.0
CLOSE_LABEL = re.compile(r"^(cancel|close|done|ok|apply|save)\b", re.IGNORECASE)

rng = np.random.default_rng(7)


# ---------------------------------------------------------------- ffmpeg helpers


def wrapped(cmd: list[str]) -> list[str]:
    if shutil.which("systemd-run"):
        return ["systemd-run", "--user", "--scope", "-q", "-p", "MemoryMax=6G", *cmd]
    return cmd


def ffprobe_duration(path: Path) -> float:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=duration", "-of", "csv=p=0", str(path)],
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    return float(out)


def frame_diffs(video: Path) -> tuple[np.ndarray, np.ndarray]:
    """Mean absolute grey difference between consecutive frames (small scale) and the time of each later frame."""
    w, h = 192, 108
    raw = subprocess.run(
        wrapped(
            [
                "ffmpeg",
                "-v",
                "error",
                "-threads",
                "4",
                "-i",
                str(video),
                "-vf",
                f"fps={FPS_PROBE},scale={w}:{h},format=gray",
                "-f",
                "rawvideo",
                "-",
            ]
        ),
        check=True,
        capture_output=True,
    ).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
    d = np.abs(np.diff(frames, axis=0)).mean(axis=(1, 2))
    return d, (np.arange(len(d)) + 1) / FPS_PROBE


# ---------------------------------------------------------------- synthesis


def shaped_noise(n: int, lo: float, hi: float, tilt: float = 0.0) -> np.ndarray:
    """White noise band-limited in the FFT domain with raised-cosine band edges, unit RMS."""
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    g = ((f >= lo) & (f <= hi)).astype(float)
    edge = 0.35
    lo_ramp = (f > lo * (1 - edge)) & (f < lo)
    hi_ramp = (f > hi) & (f < hi * (1 + edge))
    g[lo_ramp] = 0.5 - 0.5 * np.cos(np.pi * (f[lo_ramp] - lo * (1 - edge)) / (lo * edge))
    g[hi_ramp] = 0.5 + 0.5 * np.cos(np.pi * (f[hi_ramp] - hi) / (hi * edge))
    if tilt:
        g *= np.where(f > 0, (np.maximum(f, 1) / 1000.0) ** tilt, 0)
    y = np.fft.irfft(spec * g, n)
    return y / (np.sqrt(np.mean(y**2)) + 1e-12)


def env(n: int, attack: float, decay: float) -> np.ndarray:
    t = np.arange(n) / SR
    a = np.sin(np.clip(t / max(attack, 1e-4), 0, 1) * np.pi / 2) ** 2
    return a * np.exp(-t / decay)


def click() -> np.ndarray:
    """Soft, rounded mouse click: muted noise transient, a low body and a quiet tonal tick."""
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    p = rng.uniform(0.94, 1.06)
    trans = shaped_noise(n, 1800 * p, 5200 * p, tilt=-0.5) * env(n, 0.0008, 0.006) * 0.55
    body = np.sin(2 * np.pi * 210 * p * t) * env(n, 0.0015, 0.014) * 0.9
    tone = np.sin(2 * np.pi * 1350 * p * t) * env(n, 0.001, 0.010) * 0.35
    return trans + body + tone


def release() -> np.ndarray:
    n = int(0.04 * SR)
    return shaped_noise(n, 2200, 5500, tilt=-0.5) * env(n, 0.0006, 0.004) * 0.4


def key_tick() -> np.ndarray:
    n = int(0.045 * SR)
    t = np.arange(n) / SR
    p = rng.uniform(0.9, 1.1)
    trans = shaped_noise(n, 2500 * p, 6500 * p, tilt=-0.6) * env(n, 0.0006, 0.0045) * 0.6
    body = np.sin(2 * np.pi * 380 * p * t) * env(n, 0.001, 0.008) * 0.5
    return (trans + body) * rng.uniform(0.8, 1.0)


WHOOSH_S, WHOOSH_PEAK = 0.6, 0.6  # length, and where its swell peaks (fraction of the length)


def whoosh() -> np.ndarray:
    """Airy whoosh: band-passed noise sweeping 350 Hz -> 2.6 kHz under a raised-cosine swell."""
    n = int(WHOOSH_S * SR)
    chunks, hop = 12, n // 12
    win = np.hanning(2 * hop)
    out = np.zeros(n)
    for k in range(chunks + 1):
        centre = 350 * (2600 / 350) ** (k / chunks)
        seg = shaped_noise(len(win), centre / 1.8, centre * 1.8, tilt=-0.3) * win
        s = k * hop - hop // 2
        a, b = max(s, 0), min(s + len(win), n)
        out[a:b] += seg[a - s : b - s]
    x = np.linspace(0, 1, n)
    swell = np.where(
        x < WHOOSH_PEAK, np.sin(x / WHOOSH_PEAK * np.pi / 2) ** 2, np.cos((x - WHOOSH_PEAK) / (1 - WHOOSH_PEAK) * np.pi / 2) ** 2
    )
    out *= swell
    return out / (np.sqrt(np.mean(out**2)) + 1e-12)


# ---------------------------------------------------------------- events -> sounds


def movavg(x: np.ndarray, w: int) -> np.ndarray:
    c = np.concatenate([[0.0], np.cumsum(x)])
    return (c[w:] - c[:-w]) / w


def read_wav(path: Path) -> np.ndarray:
    with wave.open(str(path)) as w:
        if w.getframerate() != SR or w.getsampwidth() != 2:
            sys.exit(f"{path}: expected 16-bit PCM at {SR} Hz")
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float64) / 32768
        x = x.reshape(-1, w.getnchannels())
    return np.repeat(x, 2, axis=1) if x.shape[1] == 1 else x[:, :2]


def write_wav(path: Path, x: np.ndarray) -> None:
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())


def find_whooshes(events: list[dict], diffs: np.ndarray, times: np.ndarray) -> list[tuple[float, str]]:
    """Dialog open/close moments with a big on-screen change, as (whoosh start, reason)."""
    acts = [e for e in events if e["type"] in ("click", "select", "key")]
    found: list[tuple[float, str]] = []
    dialog_open = False
    last_act: dict | None = None
    for e in events:
        target = e.get("target") or {}
        if not dialog_open and target.get("inDialog") and last_act is not None:
            found.append((last_act["t"], f"opens: {last_act.get('label') or last_act.get('key')}"))
            dialog_open = True
        elif dialog_open and e in acts:
            label = str(e.get("label") or "")
            if (e["type"] == "key" and e.get("key") == "Escape") or (e["type"] == "click" and CLOSE_LABEL.match(label)):
                found.append((e["t"], f"closes: {label or e.get('key')}"))
                dialog_open = False
        if e in acts and not target.get("inDialog"):
            last_act = e
    out = []
    for t, why in found:
        window = (times >= t - 0.05) & (times <= t + 0.9)
        if not window.any():
            continue
        i = int(np.argmax(np.where(window, diffs, 0)))
        if diffs[i] >= BIG_CHANGE:
            out.append((max(0.0, times[i] - WHOOSH_S * WHOOSH_PEAK), f"{why} (change {diffs[i]:.0f} at {times[i]:.2f} s)"))
    return out


def build_mix(events: list[dict], music: np.ndarray, dur: float, whooshes: list[float]) -> tuple[np.ndarray, dict]:
    n = round(dur * SR)
    if len(music) < n:
        sys.exit(f"music is {len(music) / SR:.2f} s, shorter than the video ({dur:.2f} s)")
    music = music[:n].copy()
    mono = music.mean(axis=1)

    # Fade 1.5-2 s ending at the video end, starting at the quietest 50 ms point of that window.
    hop = int(0.05 * SR)
    rms = np.sqrt(np.maximum(np.pad(movavg(mono**2, hop), (hop // 2, hop - 1 - hop // 2), mode="edge"), 0))
    lo, hi = n - int(2.0 * SR), n - int(1.5 * SR)
    step = hop // 5
    fade_start = lo + int(np.argmin(rms[lo:hi:step])) * step
    music[fade_start:] *= (np.cos(np.linspace(0, 1, n - fade_start) * np.pi / 2) ** 2)[:, None]
    ramp = int(0.02 * SR)  # no click when the loop restarts
    music[:ramp] *= np.linspace(0, 1, ramp)[:, None]

    w400 = int(0.4 * SR)
    ref_db = 20 * math.log10(max(float(np.sqrt(np.maximum(movavg(mono**2, w400), 0)).max()), 1e-9))

    sfx = np.zeros((n, 2))
    counts = {"click": 0, "release": 0, "key": 0, "whoosh": 0}

    def at(sig: np.ndarray, rel_db: float, body_s: float) -> np.ndarray:
        body = sig[: int(body_s * SR)]
        return sig / (np.sqrt(np.mean(body**2)) + 1e-12) * 10 ** ((ref_db + rel_db) / 20)

    def place(sig: np.ndarray, t: float, pan: float, kind: str) -> None:
        s = round(t * SR)
        if not 0 <= s < n:
            return
        e = min(s + len(sig), n)
        th = (pan * 0.35 + 1) * np.pi / 4  # constant-power, kept narrow
        sfx[s:e, 0] += sig[: e - s] * np.cos(th)
        sfx[s:e, 1] += sig[: e - s] * np.sin(th)
        counts[kind] += 1

    def pan_of(x: float | None) -> float:
        return float(np.clip(x / 960.0 - 1, -1, 1)) if x is not None else 0.0

    for i, x in enumerate(events):
        t, ty = x["t"], x["type"]
        if ty in ("click", "select"):
            p = pan_of(x.get("x"))
            place(at(click(), L_CLICK, 0.012), t, p, "click")
            place(at(release(), L_CLICK - 9, 0.006), t + CLICK_RELEASE_S, p, "release")
        elif ty == "drag":
            place(at(click(), L_CLICK - 2, 0.012), t, pan_of(x["from"]["x"]), "click")
            place(at(release(), L_CLICK - 6, 0.006), x.get("t1", t), pan_of(x["to"]["x"]), "release")
        elif ty == "key":
            times = int(x.get("times") or 1)
            period = 0.0
            if times > 1:
                # The recorder logs no repeat gap; the next event starts once the last key is released.
                nxt = next((e["t"] for e in events[i + 1 :] if e["t"] > t), t + times * (KEY_PRESS_S + KEY_GAP_DEFAULT_S))
                period = min(KEY_PRESS_S + KEY_GAP_DEFAULT_S + 0.02, max(0.03, (nxt - t - KEY_PRESS_S) / (times - 1)))
            quiet = -4.0 if times > 6 else 0.0
            for k in range(times):
                place(at(key_tick(), L_KEY + quiet, 0.012), t + k * period, 0.0, "key")
        elif ty == "type":
            text = x.get("text") or ""
            if not text:
                continue
            span = (x.get("t1", t + len(text) / (x.get("cps") or 14)) - t) / len(text)
            for k, ch in enumerate(text):
                jit = rng.uniform(-0.25, 0.25) * span if k else 0.0
                place(at(key_tick(), L_KEY - (3 if ch == " " else 0), 0.012), t + k * span + jit, 0.1, "key")
    for t in whooshes:
        place(at(whoosh(), L_WHOOSH, WHOOSH_S), t, 0.0, "whoosh")

    mix = music + sfx
    peak = float(np.abs(mix).max())
    if peak > 0.98:  # headroom only; loudnorm sets the final level
        mix *= 0.98 / peak
    return mix, {"counts": counts, "fade_start_s": round(fade_start / SR, 3), "fade_s": round((n - fade_start) / SR, 3)}


# ---------------------------------------------------------------- main


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0], formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("recording", type=Path, help="capture folder with video-1080p.mp4 and events.json")
    ap.add_argument("music", type=Path, help="music WAV (16-bit, 48 kHz), at least as long as the video")
    ap.add_argument("out", type=Path, help="output mp4 (video stream copied)")
    ap.add_argument("--video", type=Path, help="use this video instead of RECORDING/video-1080p.mp4 (same timing)")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--whoosh-at", help="comma-separated whoosh start times in seconds (replaces detection)")
    g.add_argument("--no-whoosh", action="store_true", help="no whooshes")
    ap.add_argument("--keep-wav", type=Path, help="also write the pre-loudnorm mix to this WAV")
    args = ap.parse_args()

    video = args.video or args.recording / "video-1080p.mp4"
    events = sorted(json.loads((args.recording / "events.json").read_text())["events"], key=lambda e: e["t"])
    dur = ffprobe_duration(video)

    if args.no_whoosh:
        whooshes: list[tuple[float, str]] = []
    elif args.whoosh_at:
        whooshes = [(float(v), "given") for v in args.whoosh_at.split(",") if v.strip()]
    else:
        whooshes = find_whooshes(events, *frame_diffs(video))

    mix, info = build_mix(events, read_wav(args.music), dur, [t for t, _ in whooshes])

    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "mix.wav"
        write_wav(wav, mix)
        if args.keep_wav:
            shutil.copyfile(wav, args.keep_wav)
        ln = "loudnorm=I=-16:TP=-1.5:LRA=11"
        probe = subprocess.run(
            wrapped(
                [
                    "ffmpeg",
                    "-nostats",
                    "-hide_banner",
                    "-threads",
                    "4",
                    "-i",
                    str(wav),
                    "-af",
                    f"{ln}:print_format=json",
                    "-f",
                    "null",
                    "-",
                ]
            ),
            check=True,
            capture_output=True,
            text=True,
        ).stderr
        m = json.loads(probe[probe.rindex("{") : probe.rindex("}") + 1])
        measured = (
            f"measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
            f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
        )
        args.out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            wrapped(
                [
                    "ffmpeg",
                    "-v",
                    "error",
                    "-threads",
                    "4",
                    "-y",
                    "-i",
                    str(video),
                    "-i",
                    str(wav),
                    "-map",
                    "0:v:0",
                    "-map",
                    "1:a:0",
                    "-c:v",
                    "copy",
                    "-af",
                    f"{ln}:{measured},aresample={SR}",
                    "-ar",
                    str(SR),
                    "-ac",
                    "2",
                    "-c:a",
                    "aac",
                    "-b:a",
                    "160k",
                    "-shortest",
                    "-movflags",
                    "+faststart",
                    str(args.out),
                ]
            ),
            check=True,
        )
    final = subprocess.run(
        wrapped(
            [
                "ffmpeg",
                "-nostats",
                "-hide_banner",
                "-threads",
                "4",
                "-i",
                str(args.out),
                "-af",
                "ebur128=peak=true:framelog=quiet",
                "-f",
                "null",
                "-",
            ]
        ),
        check=True,
        capture_output=True,
        text=True,
    ).stderr
    loud = re.search(r"I:\s+(-?[\d.]+) LUFS", final)
    tp = re.search(r"Peak:\s+(-?[\d.inf]+) dBFS", final)
    print(
        json.dumps(
            {
                "out": str(args.out),
                "duration_s": round(dur, 3),
                **info,
                "whooshes": [{"start_s": round(t, 2), "why": why} for t, why in whooshes],
                "integrated_lufs": float(loud.group(1)) if loud else None,
                "true_peak_dbtp": tp.group(1) if tp else None,
            },
            indent=1,
        )
    )


if __name__ == "__main__":
    main()
