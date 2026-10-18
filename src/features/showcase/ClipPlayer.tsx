import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { cn } from '../../lib/cn.ts';
import { useHydrated, useInView, useReducedMotion } from '../../lib/hooks.ts';
import { mediaUrl } from '../../lib/media.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SHOWCASE } from './copy.ts';
import type { ShowcaseItem } from './data.ts';

/*
 * One clip with sound at a time: turning sound on for a clip mutes whichever clip had it before. A tiny external store,
 * so every player re-renders only when the owner changes.
 */
let soundOwner: string | null = null;
const listeners = new Set<() => void>();
function setSoundOwner(id: string | null) {
  soundOwner = id;
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
const getOwner = () => soundOwner;
const getServerOwner = () => null;

interface ClipPlayerProps {
  item: ShowcaseItem;
  /** `sizes` for the poster's srcSet. */
  sizes: string;
  /** `full` shows text labels on the buttons (large players); `compact` shows icons only. */
  variant?: 'full' | 'compact';
  /** Load the poster eagerly (above the fold). */
  priority?: boolean;
  className?: string;
}

/**
 * Real output, played the way the brief asks: a muted ambient loop while the clip is on screen (never under reduced
 * motion), a sound toggle that restarts the clip with the sound H3 generated, and a pause control (WCAG 2.2.2). Native
 * controls are the fallback before hydration and without JavaScript. The video downloads only when it starts playing.
 */
export function ClipPlayer({ item, sizes, variant = 'compact', priority = false, className }: ClipPlayerProps) {
  const locale = useLocale();
  const copy = SHOWCASE[locale].player;
  const title = item.title[locale];
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const id = useId();
  const owner = useSyncExternalStore(subscribe, getOwner, getServerOwner);
  const sound = owner === id;
  const [frameRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px', threshold: 0.35 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [userPaused, setUserPaused] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const clip = item.media.clip;
  const image = item.media.image;

  // Ambient loop while visible; sound playback also stops when the clip leaves the screen.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hydrated || failed) return;
    const wantPlay = inView && !userPaused && (sound || !reducedMotion);
    if (wantPlay) void video.play().catch(() => {});
    else video.pause();
  }, [hydrated, inView, userPaused, sound, reducedMotion, failed]);

  // Keep the element's muted state in step with sound ownership (another clip may take the sound away).
  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = !sound;
  }, [sound]);

  useEffect(() => () => {
    if (soundOwner === id) setSoundOwner(null);
  }, [id]);

  // Linear progress line (decorative): drawn per frame while playing, no React re-render.
  useEffect(() => {
    const video = videoRef.current;
    const bar = barRef.current;
    if (!video || !bar || !playing) return;
    let frame = 0;
    const tick = () => {
      if (video.duration > 0) bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (sound) {
      setSoundOwner(null);
      return;
    }
    setSoundOwner(id);
    setUserPaused(false);
    video.muted = false;
    video.currentTime = 0;
    void video.play().catch(() => {});
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      setUserPaused(false);
      void video.play().catch(() => {});
    } else {
      setUserPaused(true);
      video.pause();
    }
  };

  const ratio = `${item.width} / ${item.height}`;
  const iconButton =
    'pressable material-hud inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-[rgb(255_255_255_/_0.12)] text-fg hover:border-action/60 hover:text-fg focus-visible:outline-offset-2';

  if (!clip) {
    return (
      <div className={cn('relative overflow-hidden bg-stage', className)} style={{ aspectRatio: ratio }}>
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={sizes}
          width={image.width}
          height={image.height}
          alt={title}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
      </div>
    );
  }

  return (
    <div ref={frameRef} className={cn('group/clip relative isolate overflow-hidden bg-stage', className)} style={{ aspectRatio: ratio }}>
      {/* The poster is a real <img> (srcSet, lazy); the video paints over it once it has frames. */}
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt=""
        aria-hidden
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="absolute inset-0 size-full object-cover"
      />
      {failed ? null : (
        <video
          ref={videoRef}
          className="absolute inset-0 size-full object-cover"
          src={mediaUrl(clip)}
          poster={image.src}
          preload="none"
          muted
          loop
          playsInline
          // Native controls until the custom ones are live (no JavaScript, or before hydration).
          controls={!hydrated}
          aria-label={copy.clipLabel(title)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}

      {hydrated && !failed ? (
        <>
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-[rgb(255_255_255_/_0.08)]">
            <span ref={barRef} className="block h-full origin-left scale-x-0 bg-[linear-gradient(90deg,var(--color-brand-cyan),var(--color-brand-blue))]" />
          </span>
          <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 md:right-3 md:bottom-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? `${copy.pause}: ${title}` : `${copy.play}: ${title}`}
              title={playing ? copy.pause : copy.play}
              className={cn(iconButton, 'size-9 px-0')}
            >
              {playing ? <Pause className="size-3.5 fill-current" aria-hidden /> : <Play className="ml-px size-3.5 fill-current" aria-hidden />}
            </button>
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              aria-label={`${sound ? copy.soundOff : copy.soundOn}: ${title}`}
              title={sound ? copy.soundOff : copy.soundOn}
              className={cn(iconButton, variant === 'full' ? 'px-3.5 text-caption font-semibold' : 'size-9 px-0', sound && 'border-brand-cyan/70 text-brand-cyan shadow-glow-sm')}
            >
              {sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
              {variant === 'full' ? <span>{sound ? copy.soundOff : copy.soundOn}</span> : null}
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
