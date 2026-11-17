import { Maximize2, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { useLocale, type Copy } from '../../i18n/locale.tsx';
import { captureSize } from '../../lib/assets.ts';
import { cn } from '../../lib/cn.ts';
import {
  CAPTURES,
  captureRegion,
  captureSources,
  captureWindow,
  type CaptureKey,
  type Rect,
} from '../../site/captures.ts';
import { HTML_LANG } from '../../site/config.ts';
import { HudFrame } from '../fx/HudFrame.tsx';
import { AiBadge } from '../ui/AiBadge.tsx';

const TEXT: Copy<{ enlarge: string; close: string; real: string }> = {
  'zh-hant': { enlarge: '放大', close: '關閉', real: '實際畫面' },
  ja: { enlarge: '拡大', close: '閉じる', real: '実際の画面' },
  en: { enlarge: 'Enlarge', close: 'Close', real: 'Real screen' },
};

export interface CaptureStep {
  /** Focus region name in src/site/captures.ts; without a measured region the step shows the window without a spotlight. */
  region?: string;
  label: string;
}

interface CaptureStageProps {
  capture: CaptureKey;
  /** Accessible description of the whole capture. */
  alt: string;
  /** Focus steps: one spotlight and one label at a time. */
  steps?: readonly CaptureStep[];
  /** Index of the step shown. */
  active?: number;
  /** Phones zoom the camera onto the focused region at this aspect ratio (width / height). */
  narrowAspect?: number;
  /** Displayed width for the 1x/2x choice (CSS length). */
  displayWidth?: string;
  eager?: boolean;
  /** Dark → fade in → slow scale while it scrolls through (scroll-driven, none under reduced motion). */
  reveal?: boolean;
  /** Corner brackets and the HUD tag. */
  hud?: boolean;
  className?: string;
}

const NO_STEPS: readonly CaptureStep[] = [];
const pct = (value: number) => `${(value * 100).toFixed(3)}%`;

/** Expand `target` to the frame's aspect ratio (in pixels) around its centre, inside the capture. */
function fitView(target: Rect, aspect: number, captureAspect: number, pad: number): Rect {
  let [x, y, w, h] = target;
  x -= w * pad;
  y -= h * pad;
  w *= 1 + 2 * pad;
  h *= 1 + 2 * pad;
  const cx = x + w / 2;
  const cy = y + h / 2;
  if ((w * captureAspect) / h < aspect) w = (h * aspect) / captureAspect;
  else h = (w * captureAspect) / aspect;
  if (w > 1) {
    w = 1;
    h = captureAspect / aspect;
  }
  if (h > 1) {
    h = 1;
    w = aspect / captureAspect;
  }
  return [Math.min(Math.max(cx - w / 2, 0), 1 - w), Math.min(Math.max(cy - h / 2, 0), 1 - h), w, h];
}

/** Camera transform that shows `view` in a frame of the same aspect ratio (the image box is the full capture at frame width). */
function camera([x, y, w]: Rect): string {
  return `scale(${(1 / w).toFixed(5)}) translate(${pct(-x)}, ${pct(-y)})`;
}

/** The spotlight box in frame fractions, padded a little. */
function spotIn(view: Rect, focus: Rect): Rect {
  const [vx, vy, vw, vh] = view;
  const [fx, fy, fw, fh] = focus;
  const p = 0.006;
  return [(fx - vx) / vw - p, (fy - vy) / vh - p, fw / vw + 2 * p, fh / vh + 2 * p];
}

/**
 * A real Phasyn Studio capture on a stage (src/site/captures.ts): the camera frames the app window on wide screens and the
 * focused region on phones; a spotlight dims everything but the current step's region, with one label. Steps change with a
 * slow camera move (instant under reduced motion). Clicking opens the whole capture at 1:1 in a native modal dialog; without
 * JavaScript the link opens the @2x file. Renders nothing when the capture is not in public/images/ui.
 */
export function CaptureStage({
  capture,
  alt,
  steps = NO_STEPS,
  active = 0,
  narrowAspect = 4 / 3,
  displayWidth = '100vw',
  eager = false,
  reveal = true,
  hud = true,
  className,
}: CaptureStageProps) {
  const locale = useLocale();
  const t = TEXT[locale];
  const lang = HTML_LANG[locale];
  const size = captureSize(capture);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  if (!size) return null;
  const spec = CAPTURES[capture];
  const captureAspect = size.width / size.height;
  const win = captureWindow(capture);
  const wideAspect = (win[2] * captureAspect) / win[3];
  const zooms = steps.some((step) => captureRegion(capture, step.region));
  const phoneAspect = zooms ? narrowAspect : wideAspect;

  const step = steps[Math.min(Math.max(active, 0), steps.length - 1)];
  const focus = captureRegion(capture, step?.region);
  const wideView = win;
  const narrowView = fitView(focus ?? win, phoneAspect, captureAspect, focus ? 0.1 : 0);
  const wideSpot = focus ? spotIn(wideView, focus) : null;
  const narrowSpot = focus ? spotIn(narrowView, focus) : null;

  const vars: CSSProperties = {
    '--ar-wide': wideAspect.toFixed(4),
    '--ar-narrow': phoneAspect.toFixed(4),
    '--cam-wide': camera(wideView),
    '--cam-narrow': camera(narrowView),
    '--img-ar': captureAspect.toFixed(4),
    ...(wideSpot && narrowSpot
      ? {
          '--sw-x': pct(wideSpot[0]),
          '--sw-y': pct(wideSpot[1]),
          '--sw-w': pct(wideSpot[2]),
          '--sw-h': pct(wideSpot[3]),
          '--sn-x': pct(narrowSpot[0]),
          '--sn-y': pct(narrowSpot[1]),
          '--sn-w': pct(narrowSpot[2]),
          '--sn-h': pct(narrowSpot[3]),
        }
      : {}),
  };
  // Wide label: above the spotlight when there is room, else below it, else inside its top edge.
  const place = !wideSpot
    ? 'corner'
    : wideSpot[1] > 0.14
      ? 'above'
      : wideSpot[1] + wideSpot[3] < 0.86
        ? 'below'
        : 'inside';
  // Phone label: next to its spotlight too (above it, else inside its top edge; never below, where the AI disclosure sits),
  // on the side the spotlight is on.
  const narrowY = !narrowSpot ? 'corner' : narrowSpot[1] > 0.16 ? 'above' : 'inside';
  const narrowX = narrowSpot && narrowSpot[0] + narrowSpot[2] / 2 > 0.5 ? 'end' : 'start';
  const { srcSm, src, src2x } = captureSources(capture);
  const badge = spec.generated;
  const redact = spec.redact ?? [];

  const patches = redact.map(([x, y, w, h]) => (
    <span
      key={`${String(x)}-${String(y)}`}
      aria-hidden
      className="absolute rounded-[3px] bg-sunken"
      style={{ left: pct(x), top: pct(y), width: pct(w), height: pct(h) }}
    />
  ));

  const frame = (
    <div className="capture-frame relative isolate overflow-hidden rounded-xl bg-stage" style={vars}>
      <div className="capture-cam absolute top-0 left-0 w-full origin-top-left">
        <img
          src={src}
          srcSet={`${srcSm} ${String(size.width / 2)}w, ${src} ${String(size.width)}w, ${src2x} ${String(size.width * 2)}w`}
          sizes={`calc(${displayWidth} / ${win[2].toFixed(3)})`}
          width={size.width}
          height={size.height}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          {...(eager ? { fetchPriority: 'high' as const } : {})}
          decoding="async"
          draggable={false}
          className="block h-auto w-full select-none"
        />
        {patches}
      </div>
      {focus ? <span aria-hidden className="capture-spot" /> : null}
      {step ? (
        <span
          key={step.label}
          lang={lang}
          className="capture-label material-hud"
          data-place={place}
          data-narrow-y={narrowY}
          data-narrow-x={narrowX}
        >
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-brand-cyan shadow-[0_0_8px_rgb(73_207_255)]" />
          {step.label}
        </span>
      ) : null}
      <span aria-hidden className="capture-shade pointer-events-none absolute inset-0" />
    </div>
  );

  const link = (
    <a
      ref={triggerRef}
      href={src2x}
      aria-label={`${t.enlarge}: ${alt}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setOpen(true);
      }}
      className="group/capture relative block rounded-xl no-underline focus-visible:outline-offset-4"
    >
      {frame}
      <span
        aria-hidden
        className="material-hud pointer-events-none absolute right-2.5 bottom-2.5 z-10 inline-grid size-8 place-items-center rounded-full text-fg opacity-80 transition-opacity duration-(--duration-fast) group-hover/capture:opacity-100"
      >
        <Maximize2 className="size-3.5" />
      </span>
    </a>
  );

  const body = (
    <div className="relative">
      {link}
      {badge ? (
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 max-w-[calc(100%-4rem)]">
          <AiBadge variant="screen" />
        </span>
      ) : null}
    </div>
  );

  return (
    <figure className={cn('capture-stage @container/stage m-0 min-w-0', reveal && 'capture-reveal', className)}>
      {hud ? (
        <HudFrame label={spec.hud} innerClassName="rounded-xl">
          {body}
        </HudFrame>
      ) : (
        body
      )}
      {open ? (
        // eslint-disable-next-line jsx-a11y-x/click-events-have-key-events, jsx-a11y-x/no-noninteractive-element-interactions -- pointer-only backdrop dismissal of a native modal <dialog>; keyboard users close it with Esc (native to showModal) or the Close button, which the rules cannot see.
        <dialog
          ref={dialogRef}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
          onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}
          aria-label={alt}
          className="capture-dialog m-auto max-h-[92dvh] w-[min(96vw,124rem)] max-w-none overflow-hidden rounded-2xl border border-[rgb(255_255_255_/_0.1)] bg-canvas p-0 text-fg shadow-window"
        >
          <div className="flex min-h-12 items-center gap-3 border-b border-line-subtle bg-rail px-4">
            {badge ? (
              <AiBadge variant="screen" className="shrink-0" />
            ) : (
              <span className="inline-flex items-center gap-2 text-data font-medium text-fg">
                <span aria-hidden className="size-1.5 rounded-full bg-success" />
                {t.real}
              </span>
            )}
            <span lang="en" translate="no" className="machine min-w-0 truncate text-[12px] text-fg-tertiary">
              {spec.area}
            </span>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={t.close}
              title={t.close}
              className="pressable ml-auto inline-flex size-9 shrink-0 items-center justify-center rounded-md text-fg-secondary hover:bg-raised hover:text-fg"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="max-h-[calc(92dvh-3rem)] overflow-auto overscroll-contain">
            <div className="relative w-[1920px] max-w-none">
              <img
                src={src2x}
                width={size.width}
                height={size.height}
                alt={alt}
                decoding="async"
                className="block h-auto w-full"
              />
              {patches}
            </div>
          </div>
        </dialog>
      ) : null}
    </figure>
  );
}
