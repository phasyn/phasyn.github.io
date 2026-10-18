import { ArrowRight, AudioLines, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useLocale } from '../../../../i18n/locale.tsx';
import { cn } from '../../../../lib/cn.ts';
import { AiBadge } from '../../../../components/ui/AiBadge.tsx';
import { mediaUrl } from '../../../../lib/media.ts';
import { HTML_LANG } from '../../../../site/config.ts';
import { REAL } from '../../art.ts';
import { RealScreen } from '../../components/RealScreen.tsx';
import type { CropName, HotspotId, ScreenKey } from '../../screens.ts';

interface ScreenPaneProps {
  screen: ScreenKey;
  crop?: CropName;
  hotspots?: readonly HotspotId[];
  /** Visible caption: what this real screen shows. */
  note: string;
  /** This pane is the one being shown (sticky window) — gates the drift and the callout entrance. */
  active: boolean;
  framed?: boolean;
  hud?: string;
  displayWidth: string;
  className?: string;
}

/** A pipeline step told with a real Phasyn Studio screen and a caption that says what it shows. */
export function ScreenPane({ screen, crop, hotspots, note, active, framed = false, hud, displayWidth, className }: ScreenPaneProps) {
  return (
    <figure className={cn('grid gap-3', className)}>
      <RealScreen screen={screen} crop={crop} hotspots={hotspots} framed={framed} hud={hud} active={active} displayWidth={displayWidth} />
      <figcaption className="text-on-fx text-caption leading-relaxed text-fg-secondary">{note}</figcaption>
    </figure>
  );
}

function RealBadge({ children, className }: { children: string; className?: string }) {
  const locale = useLocale();
  return (
    <span lang={HTML_LANG[locale]} className={cn('material-hud inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium whitespace-nowrap text-fg', className)}>
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      {children}
    </span>
  );
}

export interface ClipLabels {
  note: string;
  firstFrame: string;
  clipLabel: string;
  loudness: string;
  realBadge: string;
  sound: string;
  mute: string;
  play: string;
  pause: string;
  replay: string;
}

const still = REAL.stills[REAL.clip.firstFrame];

/**
 * Step 3 — the real output: the H3 fl2va clip of run cfa759df, made from the real rain still (its first frame, shown beside it).
 * It plays once, muted, when the step is shown; a thin line tracks its own clock. Play / Pause / Replay and Sound are real
 * buttons. Nothing autoplays under reduced motion: the clip then starts only from Play.
 */
export function ClipPane({ active, armed, labels, className }: { active: boolean; armed: boolean; labels: ClipLabels; className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const [attached, setAttached] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  // The clip is requested only once its step is first shown.
  useEffect(() => {
    if (active) setAttached(true);
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !attached) return;
    if (active && armed) {
      video.muted = muted;
      video.currentTime = 0;
      void video.play().catch(() => setPlaying(false));
    } else if (!active) {
      video.pause();
    }
    // `muted` is applied by the sound toggle itself; re-running on it would restart the clip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, armed, attached]);

  // Progress line from the video clock while playing (one rAF loop, stopped when paused or ended).
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      const line = lineRef.current;
      if (video && line && video.duration > 0) line.style.transform = `scaleX(${Math.min(1, video.currentTime / video.duration)})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const restart = (withSound: boolean) => {
    const video = videoRef.current;
    setAttached(true);
    if (!video) return;
    video.muted = !withSound;
    setMuted(!withSound);
    video.currentTime = 0;
    void video.play().catch(() => setPlaying(false));
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (playing && video) {
      video.pause();
      return;
    }
    if (ended || !video || video.currentTime === 0) {
      restart(!muted);
      return;
    }
    void video.play().catch(() => setPlaying(false));
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (muted) restart(true);
    else {
      video.muted = true;
      setMuted(true);
    }
  };

  return (
    <figure className={cn('grid gap-3', className)}>
      <div className="relative overflow-hidden rounded-xl border border-line-subtle bg-stage" style={{ aspectRatio: '768 / 448' }}>
        <img src={still.src} alt="" width={still.width} height={still.height} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        {attached ? (
          <video
            ref={videoRef}
            aria-label={labels.clipLabel}
            className="absolute inset-0 size-full object-cover"
            src={mediaUrl(REAL.clip.src)}
            poster={still.src}
            muted
            playsInline
            preload="auto"
            onPlay={() => {
              setPlaying(true);
              setEnded(false);
            }}
            onPause={() => setPlaying(false)}
            onEnded={() => {
              setPlaying(false);
              setEnded(true);
            }}
          />
        ) : null}
        <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-[rgb(255_255_255_/_0.08)]">
          <span ref={lineRef} className="block h-full origin-left scale-x-0 bg-brand-gradient shadow-[0_0_10px_rgb(73_207_255_/_0.7)]" style={ended ? { transform: 'scaleX(1)' } : undefined} />
        </span>
        <span className="pointer-events-none absolute top-2 left-2 max-w-[calc(100%-1rem)]">
          <AiBadge variant="h3" />
        </span>
        <span className="absolute right-2 bottom-2.5">
          <RealBadge>{labels.realBadge}</RealBadge>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <img
            src={still.small}
            alt=""
            width={384}
            height={224}
            loading="lazy"
            decoding="async"
            className="h-12 w-auto shrink-0 rounded-md border border-brand-blue/50 object-cover shadow-[0_0_14px_-4px_rgb(62_137_255_/_0.7)]"
            style={{ aspectRatio: '12 / 7' }}
          />
          <span className="text-caption font-medium text-fg-secondary">{labels.firstFrame}</span>
          <ArrowRight className="size-4 shrink-0 text-brand-cyan" aria-hidden />
          <span className="grid min-w-0 gap-0.5">
            <span lang="en" className="text-caption font-medium text-fg-secondary">
              H3 fl2va
            </span>
            <span lang="en" className="machine flex flex-wrap items-center gap-x-1 whitespace-nowrap text-[11px] text-fg-tertiary">
              768×448 · 5.17&nbsp;s · {REAL.clip.run}
              <AudioLines className="size-3 text-brand-cyan" aria-hidden />
            </span>
          </span>
          {/* The first frame is a Qwen-Image still (the clip itself carries the H3 badge). */}
          <span className="basis-full">
            <AiBadge variant="qwen" />
          </span>
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="pressable inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-raised px-3.5 text-data font-medium text-fg hover:border-action/60"
          >
            {playing ? <Pause className="size-4" aria-hidden /> : ended ? <RotateCcw className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {playing ? labels.pause : ended ? labels.replay : labels.play}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            className="pressable inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-raised px-3.5 text-data font-medium text-fg hover:border-action/60"
          >
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
            {muted ? labels.sound : labels.mute}
          </button>
        </span>
      </div>
      <figcaption className="text-on-fx grid gap-1 text-caption leading-relaxed text-fg-secondary">
        <span>{labels.note}</span>
        <span className="text-fg-disabled">{labels.loudness}</span>
      </figcaption>
    </figure>
  );
}
