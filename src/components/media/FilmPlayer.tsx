import { Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '../../lib/cn.ts';
import { useInView, useReducedMotion } from '../../lib/hooks.ts';
import { mediaUrl } from '../../lib/media.ts';
import { useLocale, type Copy } from '../../i18n/locale.tsx';

const UI: Copy<{ play: string; pause: string; mute: string; unmute: string; fullscreen: string; unavailable: string; seek: string }> = {
  'zh-hant': { play: '播放', pause: '暫停', mute: '靜音', unmute: '取消靜音', fullscreen: '全螢幕', unavailable: '影片準備中', seek: '播放進度' },
  ja: { play: '再生', pause: '一時停止', mute: 'ミュート', unmute: 'ミュート解除', fullscreen: 'フルスクリーン', unavailable: '映像を準備中です', seek: '再生位置' },
  en: { play: 'Play', pause: 'Pause', mute: 'Mute', unmute: 'Unmute', fullscreen: 'Full Screen', unavailable: 'Video in preparation', seek: 'Playback position' },
};

export interface FilmPlayerProps {
  /** Media path (relative to the media base) or one path per locale for burned-in subtitles. */
  src: string | Copy<string>;
  /** Site-relative poster image. */
  poster: string;
  /** Accessible name of the video. */
  title: string;
  /** Loop silently while on screen (never with reduced motion); click unmutes and restarts. */
  ambient?: boolean;
  className?: string;
  aspect?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Branded video player: poster first, media loads on demand, linear progress (no springs on
 * playheads, DESIGN_GUIDE §11.5), HUD controls, keyboard shortcuts (Space/K, ←/→, M, F).
 */
export function FilmPlayer({ src, poster, title, ambient = false, className, aspect = '16 / 9' }: FilmPlayerProps) {
  const locale = useLocale();
  const ui = UI[locale];
  const reducedMotion = useReducedMotion();
  const [frameRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px', threshold: 0.35 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activated, setActivated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(ambient);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const path = typeof src === 'string' ? src : src[locale];
  const url = mediaUrl(path);
  const ambientActive = ambient && !activated && !reducedMotion;

  // Ambient preview plays only while visible; it never runs under reduced motion.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !ambientActive) return;
    if (inView) void video.play().catch(() => {});
    else video.pause();
  }, [ambientActive, inView]);

  // Leaving the viewport pauses a full playback too.
  useEffect(() => {
    if (!inView && activated) videoRef.current?.pause();
  }, [inView, activated]);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!activated) {
      setActivated(true);
      video.muted = false;
      setMuted(false);
      video.currentTime = 0;
      void video.play().catch(() => {});
      return;
    }
    if (video.paused) void video.play().catch(() => {});
    else video.pause();
  }, [activated]);

  const seek = (delta: number) => {
    const video = videoRef.current;
    if (video) video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') toggle();
    else if (key === 'arrowright') seek(5);
    else if (key === 'arrowleft') seek(-5);
    else if (key === 'm') toggleMute();
    else if (key === 'f') void videoRef.current?.parentElement?.requestFullscreen?.();
    else return;
    event.preventDefault();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const showControls = activated;
  const progress = duration > 0 ? time / duration : 0;

  return (
    <div
      ref={frameRef}
      className={cn('group relative isolate overflow-hidden rounded-3xl bg-stage shadow-window', className)}
      style={{ aspectRatio: aspect }}
      onKeyDown={onKeyDown}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        poster={poster}
        preload={ambient ? 'metadata' : 'none'}
        playsInline
        muted={muted}
        loop={ambientActive}
        aria-label={title}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onError={() => setFailed(true)}
      >
        <source src={url} type="video/mp4" onError={() => setFailed(true)} />
      </video>

      {failed ? (
        <div className="absolute inset-x-0 bottom-0 grid place-items-center p-4">
          <span className="material-hud rounded-full px-3 py-1.5 text-caption text-fg">{ui.unavailable}</span>
        </div>
      ) : null}

      {!showControls && !failed ? (
        <button
          type="button"
          onClick={toggle}
          className="absolute inset-0 grid place-items-center bg-[radial-gradient(closest-side,rgb(2_4_9_/_0.0),rgb(2_4_9_/_0.35))] focus-visible:outline-offset-[-6px]"
          aria-label={`${ui.play}: ${title}`}
        >
          <span className="pressable grid size-20 place-items-center rounded-full bg-brand-gradient text-on-accent shadow-glow transition-transform group-hover:scale-105 md:size-24">
            <Play className="ml-1 size-8 fill-current md:size-9" aria-hidden />
          </span>
        </button>
      ) : null}

      {showControls ? (
        <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-xl material-hud px-3 py-2 text-fg opacity-100 transition-opacity md:inset-x-5 md:bottom-5 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
          <button type="button" onClick={toggle} className="pressable grid size-8 place-items-center rounded-md hover:bg-raised/60" aria-label={playing ? ui.pause : ui.play}>
            {playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          </button>
          <span className="machine text-[11px] text-fg tabular-nums">
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
            onChange={(event) => {
              const video = videoRef.current;
              if (video) video.currentTime = Number(event.currentTarget.value);
            }}
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[rgb(255_255_255_/_0.16)] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-playhead"
            style={{ backgroundImage: `linear-gradient(90deg, var(--color-brand-cyan), var(--color-brand-blue) ${progress * 100}%, transparent ${progress * 100}%)` }}
          />
          <button type="button" onClick={toggleMute} className="pressable grid size-8 place-items-center rounded-md hover:bg-raised/60" aria-label={muted ? ui.unmute : ui.mute}>
            {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          </button>
          <button
            type="button"
            onClick={() => void videoRef.current?.parentElement?.requestFullscreen?.()}
            className="pressable grid size-8 place-items-center rounded-md hover:bg-raised/60"
            aria-label={ui.fullscreen}
          >
            <Maximize className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
