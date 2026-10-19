import { Maximize2, ScanLine, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { HudFrame } from '../../../components/fx/index.ts';
import { AiBadge } from '../../../components/ui/AiBadge.tsx';
import { CaptureBadge } from '../../../components/ui/CaptureBadge.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import { useHydrated, useInView, useReducedMotion } from '../../../lib/hooks.ts';
import { captureBadge } from '../../../site/captures.ts';
import { HTML_LANG } from '../../../site/config.ts';
import { HOME } from '../copy.ts';
import { SCREENS, captureSources, type CropName, type HotspotId, type Rect, type ScreenKey } from '../screens.ts';

interface RealScreenProps {
  screen: ScreenKey;
  /** Named CSS crop of the capture (screens.ts). The whole window when omitted or not defined for this screen. */
  crop?: CropName;
  /** Callouts to show, in order (ids from screens.ts; points outside the crop are skipped). */
  hotspots?: readonly HotspotId[];
  /** Displayed width of the frame as a CSS length, for `sizes` (the crop's zoom is added automatically). */
  displayWidth?: string;
  /** Wrap in the FX kit's HudFrame (corner brackets, HUD tag). Off when the parent already frames the screen. */
  framed?: boolean;
  /** HUD tag override (decorative). */
  hud?: string;
  orbit?: boolean;
  /** Slow pan/zoom towards the screen's focus point: only on screen, never under reduced motion. */
  drift?: boolean;
  /** Parent gate, e.g. false for a sticky pane that is not the one being shown. */
  active?: boolean;
  eager?: boolean;
  /**
   * Phones: below a 34rem frame, keep the screen at least this tall (e.g. '15rem') and let it pan sideways instead of shrinking
   * a desktop UI into an unreadable strip.
   */
  pan?: string;
  className?: string;
}

const FULL_RECT: Rect = [0, 0, 1, 1];
const pct = (value: number) => `${(value * 100).toFixed(3)}%`;

/**
 * A real Phasyn Studio screen (screens.ts): the capture in a stage well, optionally cropped with CSS, with numbered callouts
 * and a slow drift towards its focus point. Callout labels sit on the screen in wide frames and turn into a numbered legend
 * under it in narrow ones (the legend is always what assistive technology reads). Clicking or tapping a captured screen opens
 * the whole capture at 1:1 in a native modal dialog (Esc and the backdrop close it, focus returns); without JavaScript the link
 * opens the @2x file itself. A screen without a reviewed capture renders a neutral "real capture pending" frame — never a
 * stand-in UI.
 */
export function RealScreen({
  screen,
  crop,
  hotspots = [],
  displayWidth = '100vw',
  framed = true,
  hud,
  orbit = false,
  drift = true,
  active = true,
  eager = false,
  pan,
  className,
}: RealScreenProps) {
  const t = useCopy(HOME).screens;
  const lang = HTML_LANG[useLocale()];
  const spec = SCREENS[screen];
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const imgRef = useRef<HTMLImageElement>(null);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);
  const [frameRef, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });

  const capture = spec.capture;
  const available = capture !== undefined && !failed;
  // Captures that show generated media carry the AI disclosure as their one real-screen label (src/site/captures.ts).
  const disclosure = available ? captureBadge(screen) : null;
  const rect = (crop && available ? spec.crops?.[crop] : undefined) ?? FULL_RECT;
  const [x, y, w, h] = rect;
  const size = capture ?? { width: 1920, height: 1080 };

  // An image that failed before hydration fires no React error event: read its state once mounted.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  // Open after the dialog has rendered, so the browser moves focus into it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  const spots = available
    ? hotspots
        .map((id) => spec.hotspots?.find((spot) => spot.id === id))
        .filter((spot): spot is NonNullable<typeof spot> => {
          if (!spot) return false;
          const [px, py] = spot.at;
          return px >= x && px <= x + w && py >= y && py <= y + h;
        })
    : [];

  const armed = hydrated && !reducedMotion;
  const shown = available && inView && active;
  const [fx, fy] = spec.focus ?? [x + w / 2, y + h / 2];
  const focusX = Math.min(1, Math.max(0, (fx - x) / w));
  const focusY = Math.min(1, Math.max(0, (fy - y) / h));
  const { src, src2x } = captureSources(screen);
  const sizes = w < 1 ? `calc(${displayWidth} / ${w.toFixed(4)})` : displayWidth;
  const aspect = (size.width * w) / (size.height * h);
  const alt = t.alt[screen];

  const screenFrame = (
    <div
      ref={frameRef}
      className="home-screen relative isolate overflow-hidden rounded-xl bg-stage"
      style={{ aspectRatio: `${(size.width * w).toFixed(1)} / ${(size.height * h).toFixed(1)}` }}
      {...(armed ? { 'data-armed': '' } : {})}
      {...(shown ? { 'data-shown': '' } : {})}
      {...(shown && drift ? { 'data-live': '' } : {})}
    >
      {available ? (
        <div className="home-screen-cam absolute inset-0" style={{ ['--home-focus' as string]: `${pct(focusX)} ${pct(focusY)}` } as CSSProperties}>
          <div className="absolute" style={{ left: pct(-x / w), top: pct(-y / h), width: pct(1 / w), height: pct(1 / h) }}>
            <img
              ref={imgRef}
              src={src}
              srcSet={`${src} ${size.width}w, ${src2x} ${size.width * 2}w`}
              sizes={sizes}
              width={size.width}
              height={size.height}
              alt={alt}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              draggable={false}
              onError={() => setFailed(true)}
              className="absolute inset-0 size-full select-none"
            />
            {spots.length > 0 ? (
              <ul aria-hidden className="pointer-events-none absolute inset-0">
                {spots.map((spot, index) => {
                  const rx = (spot.at[0] - x) / w;
                  const ry = (spot.at[1] - y) / h;
                  return (
                    <li
                      key={spot.id}
                      className="home-spot"
                      style={{ left: pct(spot.at[0]), top: pct(spot.at[1]), ['--i' as string]: index } as CSSProperties}
                      {...((spot.side ?? (rx > 0.62 ? 'left' : 'right')) === 'left' ? { 'data-left': '' } : {})}
                      {...((spot.up ?? ry > 0.8) ? { 'data-up': '' } : {})}
                    >
                      <span className="home-spot-dot machine">{index + 1}</span>
                      <span lang={lang} className="home-spot-label material-hud">
                        {t.hotspots[spot.id]}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
        </div>
      ) : (
        <PendingFrame area={spec.area} title={t.pendingTitle} body={t.pendingBody} />
      )}
    </div>
  );

  const panned = pan ? (
    <div className="home-screen-pan" data-pan="" style={{ ['--pan-h' as string]: pan, ['--aspect' as string]: aspect.toFixed(4) } as CSSProperties}>
      {screenFrame}
    </div>
  ) : (
    screenFrame
  );

  const frame = available ? (
    <a
      ref={triggerRef}
      href={src2x}
      aria-label={`${t.enlarge}: ${alt}`}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setOpen(true);
      }}
      className="group/screen relative block rounded-xl no-underline focus-visible:outline-offset-2"
    >
      {panned}
      <span
        aria-hidden
        lang={lang}
        className="home-enlarge material-hud pointer-events-none absolute right-2 bottom-2 z-10 inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium text-fg"
      >
        <Maximize2 className="size-3.5" />
        <span className="home-enlarge-text">{t.tapHint}</span>
      </span>
    </a>
  ) : (
    panned
  );

  // The disclosure sits beside the link (read by assistive tech), over the capture's corner; it never pans or drifts.
  const withDisclosure = disclosure ? (
    <div className="relative">
      {frame}
      <CaptureBadge capture={screen} />
    </div>
  ) : (
    frame
  );

  return (
    <div className={cn('@container/screen min-w-0', className)}>
      {framed ? (
        <div className="relative">
          <HudFrame label={hud ?? spec.hud} orbit={orbit}>
            {withDisclosure}
          </HudFrame>
          {/* On the frame's border, outside the capture, so it never covers what the screen says (UI-only captures). */}
          {available && !disclosure ? (
            <span lang={lang} className="home-real-badge absolute -top-3 right-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-stage px-2.5 py-0.5 text-[12px] font-medium text-fg">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              {t.real}
            </span>
          ) : null}
        </div>
      ) : (
        withDisclosure
      )}
      {spots.length > 0 ? (
        <ol aria-label={t.callouts} className="mt-3 grid gap-1.5 text-caption text-fg-secondary @min-[34rem]/screen:sr-only">
          {spots.map((spot, index) => (
            <li key={spot.id} className="flex items-baseline gap-2">
              <span aria-hidden className="machine grid size-4 shrink-0 place-items-center rounded-full bg-brand-cyan text-[10px] font-semibold text-on-accent">
                {index + 1}
              </span>
              {t.hotspots[spot.id]}
            </li>
          ))}
        </ol>
      ) : null}
      {open ? (
        <dialog
          ref={dialogRef}
          onClose={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
          onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}
          aria-label={alt}
          className="home-dialog m-auto max-h-[92dvh] w-[min(96vw,124rem)] max-w-none overflow-hidden rounded-2xl border border-[rgb(255_255_255_/_0.1)] bg-canvas p-0 text-fg shadow-window"
        >
          <div className="grid">
            <div className="flex min-h-12 items-center gap-3 border-b border-line-subtle bg-rail px-4">
              {disclosure ? (
                <AiBadge variant={disclosure} className="shrink-0" />
              ) : (
                <>
                  <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-success" />
                  <span lang={lang} className="text-data font-medium text-fg">
                    {t.real}
                  </span>
                </>
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
              <img src={src2x} width={size.width} height={size.height} alt={alt} decoding="async" className="block h-auto w-[1920px] max-w-none" />
            </div>
          </div>
        </dialog>
      ) : null}
    </div>
  );
}

/** Placeholder until a reviewed capture exists: says so plainly and names the screen; no stand-in UI. */
function PendingFrame({ area, title, body }: { area: string; title: string; body: string }) {
  return (
    <div role="img" aria-label={`${area} — ${title}`} className="absolute inset-0 grid place-items-center p-4 text-center">
      <span aria-hidden className="home-pending-grid absolute inset-0" />
      <div aria-hidden className="relative grid justify-items-center gap-2">
        <span className="grid size-10 place-items-center rounded-xl border border-line-strong bg-sunken text-fg-tertiary">
          <ScanLine className="size-5" />
        </span>
        <span className="text-data font-semibold text-fg-secondary">{title}</span>
        <span lang="en" translate="no" className="machine text-[11px] text-fg-tertiary">
          {area}
        </span>
        <span className="hidden max-w-[34ch] text-caption text-fg-tertiary @min-[26rem]/screen:block">{body}</span>
      </div>
    </div>
  );
}
