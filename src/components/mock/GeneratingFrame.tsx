import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

export interface GeneratingFrameProps {
  /** Generating: breathing glow (shadow-glow-sm ↔ shadow-glow, 2.4 s) and a 1 px brand edge drawn above the media. */
  active?: boolean;
  /**
   * 0–1. Pass only a real ratio (completed steps / total). Draws the 2 px brand-gradient line at the bottom; it moves linearly.
   * Omit it for an indeterminate state — never invent a percentage.
   */
  progress?: number;
  /** HUD chip over the media, e.g. "Preview 12/40". */
  hud?: ReactNode;
  /** CSS aspect-ratio of the frame (default 1 / 1). */
  aspect?: string;
  className?: string;
  /** The real take, preview or a title card — never a fake picture. */
  children?: ReactNode;
}

/**
 * Re-creation of the App's GeneratingFrame (DESIGN_GUIDE §12.15): `stage` well, glow pulse only while generating, brand edge on top
 * of full-bleed media, optional progress line. Returns immediately to a plain frame when `active` turns false. Under reduced motion
 * the glow is static (the token rule cancels the pulse) and the information stays the same.
 */
export function GeneratingFrame({ active = false, progress, hud, aspect = '1 / 1', className, children }: GeneratingFrameProps) {
  const ratio = progress === undefined ? undefined : Math.min(1, Math.max(0, progress));
  return (
    <div
      {...(active ? { 'data-generating': '' } : {})}
      className={cn(
        'relative isolate overflow-hidden rounded-xl border bg-stage',
        active ? 'border-transparent shadow-glow-sm motion-safe:animate-glow-pulse' : 'border-line-subtle',
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {children}
      {active ? <span aria-hidden className="brand-edge" /> : null}
      {hud ? (
        <span className="material-hud absolute top-2 left-2 z-[3] inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium text-fg">
          {hud}
        </span>
      ) : null}
      {ratio !== undefined ? (
        <span aria-hidden className="absolute inset-x-0 bottom-0 z-[3] h-0.5 bg-[rgb(255_255_255_/_0.08)]">
          <span
            className="block h-full origin-left bg-brand-gradient transition-transform duration-(--duration-base) ease-linear motion-safe:animate-shimmer"
            style={{ transform: `scaleX(${ratio})` }}
          />
        </span>
      ) : null}
    </div>
  );
}
