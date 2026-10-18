import { ScanLine } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { cn } from '../../../lib/cn.ts';
import { useHydrated, useInView, useReducedMotion } from '../../../lib/hooks.ts';
import { CAPTURE_SIZE, DEFAULT_CAPTURE_SIZE, captureSrc, type Rect, type UiKey } from '../screens.ts';

export interface ScreenViewerProps {
  capture: UiKey;
  /** Accessible description of the screen (localized caption). */
  alt: string;
  /** Region to move the camera to and highlight; null/undefined = whole screen. */
  focus?: Rect | null;
  /** Slow ambient pan and zoom while nothing is focused (paused off screen and under reduced motion). */
  drift?: boolean;
  pending: { title: string; body: string };
  /** Load the capture eagerly (above the fold). */
  eager?: boolean;
  /** Reports whether the real capture is available (true), missing (false) or still unknown (null). */
  onAvailability?: (available: boolean | null) => void;
  className?: string;
}

type Status = 'loading' | 'loaded' | 'missing';

const MAX_ZOOM = 2.6;

/** Camera transform that centres `rect` (fractions of the capture) with the region filling ~72 % of the frame. */
function cameraFor(rect: Rect): { x: number; y: number; z: number } {
  const [rx, ry, rw, rh] = rect;
  const z = Math.min(MAX_ZOOM, Math.max(1, Math.min(0.72 / Math.max(rw, 0.01), 0.72 / Math.max(rh, 0.01))));
  const cx = rx + rw / 2;
  const cy = ry + rh / 2;
  const clamp = (value: number) => Math.min(0, Math.max(1 - z, value));
  return { x: clamp(0.5 - cx * z), y: clamp(0.5 - cy * z), z };
}

// Two gentle framings the idle camera drifts between (the image always covers the frame).
const DRIFT = [
  { x: -0.012, y: -0.01, z: 1.04 },
  { x: -0.045, y: -0.03, z: 1.075 },
];

/**
 * A real capture in a stage well: the camera eases to the focused region (interruptible: a new focus starts from wherever the
 * camera is), an SVG highlight dims everything else, and an idle drift keeps the screen alive. Missing file → a neutral
 * "real capture pending" frame; the server render and no-JS readers get the plain image.
 */
export function ScreenViewer({ capture, alt, focus, drift = false, pending, eager = false, onAvailability, className }: ScreenViewerProps) {
  const reducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [size, setSize] = useState(CAPTURE_SIZE[capture] ?? DEFAULT_CAPTURE_SIZE);
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

  const drifting = drift && !focus && status === 'loaded' && visible && !reducedMotion;
  useEffect(() => {
    if (!drifting) return;
    const timer = window.setInterval(() => setPhase((value) => (value + 1) % DRIFT.length), 9000);
    setPhase(1);
    return () => window.clearInterval(timer);
  }, [drifting]);

  const camera = focus && status === 'loaded' ? cameraFor(focus) : drifting ? DRIFT[phase] ?? DRIFT[0]! : { x: 0, y: 0, z: 1 };
  const cameraStyle: CSSProperties = {
    transform: `translate(${camera.x * 100}%, ${camera.y * 100}%) scale(${camera.z})`,
    transitionDuration: focus ? '1100ms' : drifting ? '9000ms' : '900ms',
    transitionTimingFunction: focus ? 'var(--ease-spring-smooth)' : 'ease-in-out',
  };

  return (
    <div
      ref={stageRef}
      className={cn('relative isolate w-full overflow-hidden bg-stage', className)}
      style={{ aspectRatio: `${size.width} / ${size.height}` }}
    >
      {/* Under the image until it has loaded: without JavaScript a missing capture still reads as "pending", never as a broken screen. */}
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
            className="absolute inset-0 size-full object-cover select-none"
          />
          {focus && status === 'loaded' ? <Highlight key={focus.join(',')} rect={focus} /> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Dims everything outside the focused region and outlines it (stroke stays 2 px at any zoom). */
function Highlight({ rect }: { rect: Rect }) {
  const [x, y, w, h] = rect.map((value) => value * 100) as [number, number, number, number];
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="tour-highlight pointer-events-none absolute inset-0 size-full">
      <path d={`M0 0H100V100H0Z M${x} ${y}V${y + h}H${x + w}V${y}Z`} fillRule="evenodd" className="fill-[rgb(2_4_9_/_0.58)]" />
      <rect x={x} y={y} width={w} height={h} fill="none" vectorEffect="non-scaling-stroke" strokeWidth={2} className="stroke-brand-cyan" />
    </svg>
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
