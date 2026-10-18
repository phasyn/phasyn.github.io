import { ScanLine } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '../../../lib/cn.ts';
import { useHydrated, useInView, useReducedMotion } from '../../../lib/hooks.ts';
import { CAPTURE_SIZE, captureSrc, type Rect, type UiKey } from '../screens.ts';

export interface ScreenViewerProps {
  capture: UiKey;
  /** Accessible description of the screen (localized caption). */
  alt: string;
  /** Slow ambient pan and zoom (paused off screen, none under reduced motion). */
  drift?: boolean;
  /** Show only this region of the capture (fractions x, y, width, height); the frame takes the region's aspect ratio. */
  crop?: Rect | undefined;
  pending: { title: string; body: string };
  /** Load the capture eagerly (above the fold). */
  eager?: boolean;
  /** Reports whether the real capture is available (true), missing (false) or still unknown (null). */
  onAvailability?: (available: boolean | null) => void;
  className?: string;
}

type Status = 'loading' | 'loaded' | 'missing';

// Two gentle framings the camera drifts between (the image always covers the frame).
const DRIFT = [
  { x: -0.012, y: -0.01, z: 1.035 },
  { x: -0.05, y: -0.034, z: 1.075 },
] as const;

/**
 * A real capture in a stage well, optionally with a slow camera drift that keeps the screen alive (one writer: the camera
 * transform; a long ease between two framings). A missing file shows a neutral "real capture pending" frame instead; the server
 * render and no-JS readers get the plain image over that frame, so a missing capture never reads as a broken screen.
 */
export function ScreenViewer({ capture, alt, drift = false, crop, pending, eager = false, onAvailability, className }: ScreenViewerProps) {
  const reducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [size, setSize] = useState<{ width: number; height: number }>(CAPTURE_SIZE);
  const [stageRef, visible] = useInView<HTMLDivElement>({ rootMargin: '0px', threshold: 0.2 });
  const [phase, setPhase] = useState(0);

  // An image that failed (or loaded) before hydration fires no React event: read its state once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth > 0) {
      setSize({ width: img.naturalWidth, height: img.naturalHeight });
      setStatus('loaded');
    } else setStatus('missing');
  }, [capture]);

  useEffect(() => {
    onAvailability?.(status === 'loading' ? null : status === 'loaded');
  }, [status, onAvailability]);

  const drifting = drift && status === 'loaded' && visible && !reducedMotion;
  useEffect(() => {
    if (!drifting) return;
    setPhase(1);
    const timer = window.setInterval(() => setPhase((value) => (value + 1) % DRIFT.length), 11000);
    return () => window.clearInterval(timer);
  }, [drifting]);

  const camera = drifting ? DRIFT[phase] ?? DRIFT[0] : { x: 0, y: 0, z: 1 };
  const cameraStyle: CSSProperties = {
    transform: `translate(${camera.x * 100}%, ${camera.y * 100}%) scale(${camera.z})`,
    transitionDuration: drifting ? '11000ms' : '900ms',
    transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)',
  };

  const [cx, cy, cw, ch] = crop ?? [0, 0, 1, 1];
  // A cropped capture is drawn larger than the frame and offset so that only the region shows.
  const imageBox: CSSProperties = crop
    ? { width: `${100 / cw}%`, height: `${100 / ch}%`, left: `${(-cx / cw) * 100}%`, top: `${(-cy / ch) * 100}%` }
    : { inset: 0, width: '100%', height: '100%' };

  return (
    <div
      ref={stageRef}
      className={cn('relative isolate w-full overflow-hidden bg-stage', className)}
      style={{ aspectRatio: `${size.width * cw} / ${size.height * ch}` }}
    >
      {status !== 'loaded' ? <PendingFrame capture={capture} pending={pending} loading={hydrated && status === 'loading'} /> : null}
      {status !== 'missing' ? (
        <div className="tour-camera absolute inset-0 origin-top-left" style={cameraStyle}>
          <img
            ref={imgRef}
            src={captureSrc(capture)}
            width={size.width}
            height={size.height}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            onLoad={(event) => {
              const img = event.currentTarget;
              setSize({ width: img.naturalWidth, height: img.naturalHeight });
              setStatus('loaded');
            }}
            onError={() => setStatus('missing')}
            className="absolute max-w-none object-cover select-none"
            style={imageBox}
          />
        </div>
      ) : null}
    </div>
  );
}

/** Neutral placeholder until the real capture exists: says so plainly, never shows a fake screen. Quiet while still loading. */
function PendingFrame({ capture, pending, loading }: { capture: UiKey; pending: { title: string; body: string }; loading: boolean }) {
  return (
    <div className={cn('absolute inset-0 grid place-items-center p-4 text-center transition-opacity duration-(--duration-base)', loading && 'opacity-0')}>
      <div aria-hidden className="tour-pending-grid absolute inset-0" />
      <div className="relative grid justify-items-center gap-2">
        <span className="grid size-10 place-items-center rounded-xl border border-line-strong bg-sunken text-fg-tertiary">
          <ScanLine className="size-5" aria-hidden />
        </span>
        <p className="text-data font-semibold text-fg-secondary">{pending.title}</p>
        <p className="max-w-[34ch] text-caption text-fg-tertiary">{pending.body}</p>
        <code translate="no" className="machine text-[11px] text-fg-tertiary">
          {capture}
        </code>
      </div>
    </div>
  );
}
