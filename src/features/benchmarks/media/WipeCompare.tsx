import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { AiBadge } from '../../../components/ui/AiBadge.tsx';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { HudFrame } from '../../../components/fx/index.ts';
import { cn } from '../../../lib/cn.ts';
import { useInView, useReducedMotion } from '../../../lib/hooks.ts';
import { mediaUrl } from '../../../lib/media.ts';
import { useBenchCopy } from '../copy.ts';

interface Side {
  video: string;
  poster: string;
  label: string;
}

/*
 * Wipe comparison of two synchronised clips: drag the divider (pointer) or use ←/→ (Shift = 10 %), Home/End. Both clips
 * play together from one button (left clip carries the sound), pause offscreen, and never autoplay. Under reduced motion
 * the same wipe runs over the two still posters.
 */
export function WipeCompare({ left, right, hud }: { left: Side; right: Side; hud: string }) {
  const copy = useBenchCopy();
  const reducedMotion = useReducedMotion();
  const [frameRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px', threshold: 0.25 });
  const aRef = useRef<HTMLVideoElement>(null);
  const bRef = useRef<HTMLVideoElement>(null);
  const [pos, setPos] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const dragging = useRef(false);

  const setFromClient = (clientX: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.round(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))));
  };

  const pause = useCallback(() => {
    aRef.current?.pause();
    bRef.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = () => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    if (playing) {
      pause();
      return;
    }
    b.currentTime = a.currentTime;
    void Promise.all([a.play(), b.play()])
      .then(() => setPlaying(true))
      .catch(() => pause());
  };

  // Keep the right clip on the left clip's clock.
  useEffect(() => {
    const a = aRef.current;
    const b = bRef.current;
    if (!a || !b) return;
    const sync = () => {
      if (Math.abs(b.currentTime - a.currentTime) > 0.06) b.currentTime = a.currentTime;
    };
    a.addEventListener('timeupdate', sync);
    a.addEventListener('seeked', sync);
    return () => {
      a.removeEventListener('timeupdate', sync);
      a.removeEventListener('seeked', sync);
    };
  }, [reducedMotion]);

  useEffect(() => {
    if (!inView && playing) pause();
  }, [inView, playing, pause]);

  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setPos((p) => Math.max(0, p - step));
    else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setPos((p) => Math.min(100, p + step));
    else if (event.key === 'Home') setPos(0);
    else if (event.key === 'End') setPos(100);
    else return;
    event.preventDefault();
  };

  const media = (side: Side, ref: typeof aRef, isMuted: boolean) =>
    reducedMotion ? (
      <img src={side.poster} alt="" className="absolute inset-0 size-full object-cover" />
    ) : (
      <video ref={ref} className="absolute inset-0 size-full object-cover" poster={side.poster} preload="none" playsInline loop muted={isMuted} aria-hidden>
        <source src={mediaUrl(side.video)} type="video/mp4" />
      </video>
    );

  return (
    <HudFrame label={hud}>
      <div
        ref={frameRef}
        className="relative aspect-[768/448] touch-none overflow-hidden rounded-xl bg-stage select-none"
        onPointerDown={(event: PointerEvent<HTMLDivElement>) => {
          if ((event.target as HTMLElement).closest('button')) return;
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setFromClient(event.clientX);
        }}
        onPointerMove={(event: PointerEvent<HTMLDivElement>) => {
          if (dragging.current) setFromClient(event.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
      >
        {media(left, aRef, muted)}
        <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
          {media(right, bRef, true)}
        </div>
        <span className="material-hud pointer-events-none absolute top-2.5 left-2.5 rounded-md px-2 py-0.5 text-[12px] font-semibold text-fg">{left.label}</span>
        <span className="material-hud pointer-events-none absolute top-2.5 right-2.5 rounded-md px-2 py-0.5 text-[12px] font-semibold text-fg">{right.label}</span>
        {/* Licence-required disclosure; both clips are MiniMax H3 outputs. Bottom-right stays clear of labels and controls. */}
        <div className="pointer-events-none absolute right-2.5 bottom-2.5 max-w-[calc(100%-7rem)]">
          <AiBadge variant="h3" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-[#fff]/85" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label={copy.dit.wipe.handle}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pos}
          aria-valuetext={`${left.label} ${pos}% · ${right.label} ${100 - pos}%`}
          onKeyDown={onKey}
          className="absolute top-1/2 grid size-11 -translate-1/2 cursor-ew-resize place-items-center rounded-full border border-[rgb(255_255_255_/_0.5)] bg-[rgb(6_10_18_/_0.72)] text-fg shadow-popover outline-offset-2 backdrop-blur-md"
          style={{ left: `${pos}%` }}
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth={1.75}>
            <path d="M9 6 3 12l6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {!reducedMotion ? (
          <div className="absolute bottom-2.5 left-2.5 flex gap-1.5">
            <button type="button" onClick={toggle} aria-label={playing ? copy.common.pause : copy.common.play} className="pressable material-hud grid size-9 place-items-center rounded-md text-fg [&_svg]:size-4">
              {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            </button>
            <button type="button" onClick={() => setMuted((m) => !m)} aria-pressed={muted} aria-label={muted ? copy.common.unmute : copy.common.mute} className={cn('pressable material-hud grid size-9 place-items-center rounded-md text-fg [&_svg]:size-4')}>
              {muted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
            </button>
          </div>
        ) : null}
      </div>
    </HudFrame>
  );
}
