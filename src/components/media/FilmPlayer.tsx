import { Clock, Maximize, Minimize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type KeyboardEvent, type Ref } from 'react';
import { cn } from '../../lib/cn.ts';
import { useInView, useReducedMotion } from '../../lib/hooks.ts';
import { mediaUrl } from '../../lib/media.ts';
import { useLocale, type Copy } from '../../i18n/locale.tsx';
import { HTML_LANG } from '../../site/config.ts';
import { activeCue, parseVtt, type Cue } from './captions.ts';

interface PlayerCopy {
  play: string;
  pause: string;
  mute: string;
  unmute: string;
  fullscreen: string;
  exitFullscreen: string;
  unavailable: string;
  unavailableHint: string;
  seek: string;
  /** Keyboard shortcuts, appended to the controls' tooltips. */
  keys: { play: string; mute: string; fullscreen: string; seek: string };
}

const UI: Copy<PlayerCopy> = {
  'zh-hant': {
    play: '播放',
    pause: '暫停',
    mute: '靜音',
    unmute: '取消靜音',
    fullscreen: '全螢幕',
    exitFullscreen: '離開全螢幕',
    unavailable: '影片準備中',
    unavailableHint: '渲染完成後就能在這裡播放。',
    seek: '播放進度',
    keys: { play: '（空白鍵或 K）', mute: '（M）', fullscreen: '（F）', seek: '（← → 倒退或快轉 5 秒）' },
  },
  ja: {
    play: '再生',
    pause: '一時停止',
    mute: 'ミュート',
    unmute: 'ミュート解除',
    fullscreen: '全画面表示',
    exitFullscreen: '全画面表示を終了',
    unavailable: '映像を準備中です',
    unavailableHint: 'レンダリングが終わり次第、ここで再生できます。',
    seek: '再生位置',
    keys: { play: '（スペースキーまたは K）', mute: '（M）', fullscreen: '（F）', seek: '（← → キーで 5 秒戻る・進む）' },
  },
  en: {
    play: 'Play',
    pause: 'Pause',
    mute: 'Mute',
    unmute: 'Unmute',
    fullscreen: 'Full Screen',
    exitFullscreen: 'Exit Full Screen',
    unavailable: 'Video in preparation',
    unavailableHint: 'It will play here as soon as rendering finishes.',
    seek: 'Playback position',
    keys: { play: ' (Space or K)', mute: ' (M)', fullscreen: ' (F)', seek: ' (← → back or ahead 5 s)' },
  },
};

/** Imperative control for pages that drive the player (e.g. chapter timestamps). */
export interface FilmPlayerHandle {
  /** Move playback to `seconds` without changing play or pause. */
  seek: (seconds: number) => void;
  /** Start playback with sound from `seconds`, activating the player like its play button. No-op when the media failed. */
  playFrom: (seconds: number) => void;
}

export interface FilmPlayerProps {
  /** Media path (relative to the media base) or one path per locale for burned-in subtitles. */
  src: string | Copy<string>;
  /** Site-relative poster image. */
  poster: string;
  /** Accessible name of the video. */
  title: string;
  /** Loop silently while on screen (never with reduced motion); click unmutes and restarts. */
  ambient?: boolean;
  /**
   * Site-relative WebVTT file per locale (e.g. `/captions/tour/01-text-image-video.en.vtt`). Rendered as brand-styled
   * subtitles over the video while it plays with sound; the files ship with the site, so no cross-origin request.
   */
  captions?: Copy<string>;
  className?: string;
  aspect?: string;
  /** Imperative handle (`seek`, `playFrom`); React 19 passes `ref` as a prop. */
  ref?: Ref<FilmPlayerHandle>;
  /** Playback position, on every media `timeupdate`. */
  onTimeUpdate?: (seconds: number) => void;
  /** The current locale's parsed subtitle cues once loaded (an empty list when the file is missing). */
  onCues?: (cues: Cue[]) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** iPhone Safari has no element full screen, only the video's native one. */
type WebKitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

// 32 px controls for mouse and trackpad, 44 px on touch screens (FE-16).
const CONTROL = 'pressable grid size-8 shrink-0 place-items-center rounded-md hover:bg-raised/60 [@media(pointer:coarse)]:size-11';

/**
 * Branded video player: poster first, media attached only near the viewport, linear progress (no springs on playheads,
 * DESIGN_GUIDE §11.5), HUD controls with shortcut tooltips, keyboard shortcuts (Space/K, ←/→, M, F), full-screen toggle.
 */
export function FilmPlayer({ src, poster, title, ambient = false, captions, className, aspect = '16 / 9', ref, onTimeUpdate, onCues }: FilmPlayerProps) {
  const locale = useLocale();
  const ui = UI[locale];
  const reducedMotion = useReducedMotion();
  const [frameRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px', threshold: 0.35 });
  const videoRef = useRef<HTMLVideoElement>(null);
  // FE-15: no media request until the player is within ~600 px of the viewport (`preload="none"` and no `src` before).
  const [near, setNear] = useState(false);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(ambient);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const path = typeof src === 'string' ? src : src[locale];
  const url = mediaUrl(path);
  const ambientActive = ambient && !activated && !reducedMotion;
  const [cues, setCues] = useState<Cue[]>([]);
  const captionPath = captions?.[locale];
  // A seek or play asked for before the source was attached; applied as soon as it is.
  const pendingRef = useRef<{ from: number; play: boolean } | null>(null);
  // Latest callbacks without re-running effects when a parent passes new function identities.
  const onCuesRef = useRef(onCues);
  const onTimeRef = useRef(onTimeUpdate);
  useEffect(() => {
    onCuesRef.current = onCues;
    onTimeRef.current = onTimeUpdate;
  });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || near) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setNear(true);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [near]);

  // Subtitles load with the media, not with the page.
  useEffect(() => {
    if (!captionPath || !near) return;
    let alive = true;
    const done = (parsed: Cue[]) => {
      if (!alive) return;
      setCues(parsed);
      onCuesRef.current?.(parsed);
    };
    fetch(captionPath)
      .then((response) => (response.ok ? response.text() : ''))
      .then((text) => done(parseVtt(text)))
      .catch(() => done([]));
    return () => {
      alive = false;
    };
  }, [captionPath, near]);

  const cue = activated ? activeCue(cues, time) : undefined;

  // The media may already have failed (missing file) or loaded its metadata when this runs: read the state directly
  // instead of relying only on events.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !near) return;
    if (video.error) setFailed(true);
    else if (video.readyState >= HTMLMediaElement.HAVE_METADATA && Number.isFinite(video.duration)) setDuration(video.duration);
  }, [url, near]);

  // Ambient preview plays only while visible; it never runs under reduced motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ambientActive || !near) return;
    if (inView) void video.play().catch(() => {});
    else video.pause();
  }, [ambientActive, inView, near]);

  // Leaving the viewport pauses a full playback too.
  useEffect(() => {
    if (!inView && activated) videoRef.current?.pause();
  }, [inView, activated]);

  // The full-screen button shows the state it would change (FE-16).
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null && document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [frameRef]);

  // Apply a request made before the source was attached.
  useEffect(() => {
    const video = videoRef.current;
    const job = pendingRef.current;
    if (!near || !video || !job) return;
    pendingRef.current = null;
    video.currentTime = job.from;
    if (job.play) void video.play().catch(() => {});
  }, [near]);

  /** Activate with sound and play from `from` (the play button, `playFrom`). */
  const start = useCallback(
    (from: number) => {
      const video = videoRef.current;
      if (!video) return;
      if (!activated) {
        setActivated(true);
        video.muted = false;
        setMuted(false);
      }
      if (!near) {
        pendingRef.current = { from, play: true };
        setNear(true);
        return;
      }
      video.currentTime = from;
      void video.play().catch(() => {});
    },
    [activated, near],
  );

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!activated) {
      // The play overlay that had focus unmounts now: keep focus inside the player so Space/K/←/→/M/F keep working.
      frameRef.current?.focus({ preventScroll: true });
      start(0);
      return;
    }
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }, [activated, frameRef, start]);

  useImperativeHandle(
    ref,
    () => ({
      seek: (seconds: number) => {
        const video = videoRef.current;
        if (!video) return;
        if (!near) {
          pendingRef.current = { from: Math.max(0, seconds), play: pendingRef.current?.play ?? false };
          setNear(true);
          return;
        }
        const end = Number.isFinite(video.duration) ? video.duration : seconds;
        video.currentTime = Math.max(0, Math.min(end, seconds));
      },
      playFrom: (seconds: number) => {
        if (failed) return;
        start(Math.max(0, seconds));
      },
    }),
    [failed, near, start],
  );

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const frame = frameRef.current;
    if (!frame) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => {});
      return;
    }
    if (typeof frame.requestFullscreen === 'function') void frame.requestFullscreen().catch(() => {});
    else (videoRef.current as WebKitVideo | null)?.webkitEnterFullscreen?.();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') toggle();
    else if (key === 'arrowright') seekBy(5);
    else if (key === 'arrowleft') seekBy(-5);
    else if (key === 'm') toggleMute();
    else if (key === 'f') toggleFullscreen();
    else return;
    event.preventDefault();
  };

  const showControls = activated;
  const progress = duration > 0 ? time / duration : 0;
  const playLabel = playing ? ui.pause : ui.play;
  const muteLabel = muted ? ui.unmute : ui.mute;
  const fullscreenLabel = fullscreen ? ui.exitFullscreen : ui.fullscreen;

  return (
    <div
      ref={frameRef}
      className={cn('group relative isolate overflow-hidden rounded-3xl bg-stage shadow-window [&:fullscreen]:rounded-none', className)}
      style={{ aspectRatio: aspect }}
      onKeyDown={onKeyDown}
      tabIndex={-1}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover [:fullscreen>&]:object-contain"
        poster={poster}
        // Nothing loads until the player is near the viewport; then metadata loads up front, so a missing or unplayable
        // file shows its state instead of a dead play button. (`preload` before `src`: both change in the same commit.)
        preload={near ? 'metadata' : 'none'}
        playsInline
        muted={muted}
        loop={ambientActive}
        aria-label={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => {
          const current = event.currentTarget.currentTime;
          setTime(current);
          onTimeRef.current?.(current);
        }}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onDurationChange={(event) => Number.isFinite(event.currentTarget.duration) && setDuration(event.currentTarget.duration)}
        // `src` on the element itself: a failed <source> child fires its error on the child, which the video never sees.
        src={near ? url : undefined}
        onError={() => setFailed(true)}
      />

      {cue ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-16 flex justify-center md:bottom-20" aria-live="off">
          <p
            lang={HTML_LANG[locale]}
            className="material-hud max-w-[min(92%,52rem)] rounded-xl px-4 py-2 text-center text-[clamp(0.875rem,0.7rem+0.7vw,1.375rem)] leading-snug font-medium whitespace-pre-line text-fg shadow-popover"
          >
            {cue.text}
          </p>
        </div>
      ) : null}

      {failed ? (
        <div role="status" className="absolute inset-0 grid place-items-center bg-[radial-gradient(closest-side,rgb(2_4_9_/_0.15),rgb(2_4_9_/_0.6))] p-6">
          <div className="material-hud grid max-w-sm justify-items-center gap-2 rounded-2xl px-6 py-5 text-center">
            <Clock className="size-6 text-warning" aria-hidden />
            <p className="text-section font-semibold text-fg">{ui.unavailable}</p>
            <p className="text-data text-fg">{ui.unavailableHint}</p>
          </div>
        </div>
      ) : null}

      {!showControls && !failed ? (
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 grid place-items-center bg-[radial-gradient(closest-side,rgb(2_4_9_/_0.0),rgb(2_4_9_/_0.35))] focus-visible:outline-offset-[-6px]"
          aria-label={`${ui.play}: ${title}`}
          title={`${ui.play}${ui.keys.play}`}
        >
          <span className="pressable grid size-20 place-items-center rounded-full bg-brand-gradient text-on-accent shadow-glow transition-transform group-hover:scale-105 md:size-24">
            <Play className="ml-1 size-8 fill-current md:size-9" aria-hidden />
          </span>
        </button>
      ) : null}

      {showControls ? (
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl material-hud px-3 py-2 text-fg opacity-100 transition-opacity md:inset-x-5 md:bottom-5 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100 [@media(pointer:coarse)]:gap-2 [@media(pointer:coarse)]:px-2 [@media(pointer:coarse)]:py-1">
          <button type="button" onClick={toggle} className={CONTROL} aria-label={playLabel} title={`${playLabel}${ui.keys.play}`}>
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
          <span className="machine shrink-0 text-caption text-fg tabular-nums">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            aria-label={ui.seek}
            aria-valuetext={`${formatTime(time)} / ${formatTime(duration)}`}
            title={`${ui.seek}${ui.keys.seek}`}
            onChange={(event) => {
              const video = videoRef.current;
              if (video) video.currentTime = Number(event.currentTarget.value);
            }}
            className="film-range min-w-0 flex-1"
            style={{ '--film-progress': `${progress * 100}%` } as CSSProperties}
          />
          <button type="button" onClick={toggleMute} className={CONTROL} aria-label={muteLabel} title={`${muteLabel}${ui.keys.mute}`}>
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          </button>
          <button type="button" onClick={toggleFullscreen} className={CONTROL} aria-label={fullscreenLabel} title={`${fullscreenLabel}${ui.keys.fullscreen}`}>
            {fullscreen ? <Minimize className="size-4" aria-hidden /> : <Maximize className="size-4" aria-hidden />}
          </button>
        </div>
      ) : null}
    </div>
  );
}
