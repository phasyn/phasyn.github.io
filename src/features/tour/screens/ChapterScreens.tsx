import { Maximize2, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { SpotlightCard } from '../../../components/fx/index.ts';
import { AiBadge } from '../../../components/ui/AiBadge.tsx';
import { CaptureBadge } from '../../../components/ui/CaptureBadge.tsx';
import { captureBadge } from '../../../site/captures.ts';
import { cn } from '../../../lib/cn.ts';
import type { TourCopy } from '../copy.ts';
import { THUMB_CROP, captureSrc, type UiKey } from '../screens.ts';
import { ScreenViewer } from './ScreenViewer.tsx';

interface ChapterScreensProps {
  keys: readonly UiKey[];
  title: string;
  screens: TourCopy['screens'];
  /** `column`: stacked beside the steps on wide screens (two up on tablets); `row`: side by side. */
  layout?: 'column' | 'row';
}

/**
 * The chapter's real screens as a small gallery. Each available capture opens large in a native modal dialog (focus moves in,
 * Esc and the backdrop close it, focus returns to the thumbnail); without JavaScript the thumbnail links to the image itself.
 * A capture that has not landed yet stays a plain "pending" frame, not a link.
 */
export function ChapterScreens({ keys, title, screens, layout = 'row' }: ChapterScreensProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState<UiKey | null>(null);

  // Open after the dialog content has rendered, so the browser focuses the close button.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (open && dialog && !dialog.open) dialog.showModal();
  }, [open]);

  const show = useCallback((key: UiKey, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setOpen(key);
  }, []);

  const onClose = () => {
    setOpen(null);
    triggerRef.current?.focus();
  };

  return (
    <div className="grid gap-4">
      <h3 className="flex items-center gap-2 text-caption font-semibold text-fg-tertiary">
        <span aria-hidden className="size-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgb(73_207_255)]" />
        {title}
      </h3>
      <ul className={cn('grid gap-4', keys.length > 1 && 'sm:grid-cols-2', layout === 'column' ? 'lg:grid-cols-1' : keys.length > 2 && 'xl:grid-cols-3')}>
        {keys.map((key) => (
          <li key={key} className="min-w-0">
            <ScreenThumb capture={key} caption={screens.captures[key]} screens={screens} onOpen={show} />
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={onClose}
        onClick={(event) => event.target === event.currentTarget && dialogRef.current?.close()}
        aria-label={open ? screens.captures[open] : undefined}
        className="tour-dialog m-auto max-h-[92dvh] w-[min(96vw,100rem)] max-w-none overflow-hidden rounded-2xl border border-[rgb(255_255_255_/_0.1)] bg-canvas p-0 text-fg shadow-window"
      >
        {open ? (
          <div className="grid">
            <div className="flex min-h-12 items-center gap-3 border-b border-line-subtle bg-rail px-4">
              {/* A capture that shows generated media is labelled by its AI disclosure (src/site/captures.ts). */}
              {captureBadge(open) ? (
                <AiBadge variant="screen" className="shrink-0" />
              ) : (
                <span aria-hidden lang="en" className="machine text-[10px] tracking-[0.18em] text-brand-cyan">
                  REAL CAPTURE
                </span>
              )}
              <span className="min-w-0 truncate text-data font-medium text-fg-secondary">{screens.captures[open]}</span>
              <button
                type="button"
                onClick={() => dialogRef.current?.close()}
                aria-label={screens.close}
                title={screens.close}
                className="pressable ml-auto inline-flex size-9 items-center justify-center rounded-md text-fg-secondary hover:bg-raised hover:text-fg"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="max-h-[calc(92dvh-3rem)] overflow-auto">
              <ScreenViewer capture={open} alt={screens.captures[open]} eager pending={{ title: screens.pendingTitle, body: screens.pendingBody }} />
            </div>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

function ScreenThumb({
  capture,
  caption,
  screens,
  onOpen,
}: {
  capture: UiKey;
  caption: string;
  screens: TourCopy['screens'];
  onOpen: (key: UiKey, trigger: HTMLElement) => void;
}) {
  const [available, setAvailable] = useState<boolean | null>(null);
  const pending = { title: screens.pendingTitle, body: screens.pendingBody };
  // Captures that show generated media carry the AI disclosure instead of the small REAL tag (one label per capture).
  const disclosure = captureBadge(capture);
  const media = (
    <div className="relative overflow-hidden rounded-[0.9rem] border border-line-subtle">
      <ScreenViewer
        capture={capture}
        alt={caption}
        crop={THUMB_CROP[capture]}
        pending={pending}
        onAvailability={setAvailable}
        className="transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover/thumb:scale-[1.03]"
      />
      {disclosure ? null : (
        <span aria-hidden lang="en" className="material-hud absolute top-1.5 left-1.5 inline-flex h-5 items-center gap-1 rounded-full px-1.5 font-mono text-[9px] tracking-[0.14em] text-fg">
          <span className="size-1 rounded-full bg-brand-cyan shadow-[0_0_6px_rgb(73_207_255)]" />
          REAL
        </span>
      )}
      {available ? (
        <span aria-hidden className="material-hud absolute right-2 bottom-2 inline-flex size-8 items-center justify-center rounded-full text-fg opacity-0 transition-opacity group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 pointer-coarse:opacity-100">
          <Maximize2 className="size-3.5" aria-hidden />
        </span>
      ) : null}
    </div>
  );

  return (
    <SpotlightCard tilt={3} className="h-full rounded-2xl border-line-subtle bg-surface p-2">
      <figure className="grid gap-2">
        <div className="relative">
          {/* One element either way (no remount): without a capture the link loses its href, role and handler. */}
          <a
            {...(available === false
              ? {}
              : {
                  href: captureSrc(capture),
                  'aria-label': screens.enlarge(caption),
                  onClick: (event: MouseEvent<HTMLAnchorElement>) => {
                    event.preventDefault();
                    onOpen(capture, event.currentTarget);
                  },
                })}
            className="group/thumb block rounded-[0.9rem] no-underline focus-visible:outline-offset-2"
          >
            {media}
          </a>
          {/* Beside the link so it is read; shown unless the capture turned out to be missing (no-JS readers get it too). */}
          {disclosure && available !== false ? <CaptureBadge capture={capture} className="top-1.5 left-1.5 max-w-[calc(100%-0.75rem)]" /> : null}
        </div>
        <figcaption className="px-1.5 pb-1 text-caption text-fg-secondary [text-wrap:pretty]">{caption}</figcaption>
      </figure>
    </SpotlightCard>
  );
}
