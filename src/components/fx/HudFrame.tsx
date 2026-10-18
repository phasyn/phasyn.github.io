import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

interface HudFrameProps {
  children: ReactNode;
  /** Short Latin tag in the top-left corner, e.g. "LIVE · RTX 5080" (decorative; real info must also be in text). */
  label?: string;
  /** Moving scan line over the content. */
  scan?: boolean;
  /** Rotating conic light around the frame. */
  orbit?: boolean;
  className?: string;
  innerClassName?: string;
}

const CORNER = 'pointer-events-none absolute size-4 border-brand-cyan/80';

/**
 * Holographic HUD frame for media, illustrative UI and compact data panels (a stat block, a small spec table):
 * corner brackets, optional scan line and orbiting light. Not for long body text or large data tables — keep `scan`
 * off when the frame holds text that people read.
 */
export function HudFrame({ children, label, scan = false, orbit = false, className, innerClassName }: HudFrameProps) {
  return (
    <div className={cn('relative rounded-2xl p-2', orbit && 'fx-orbit-border', className)}>
      <span aria-hidden className={cn(CORNER, '-top-px -left-px rounded-tl-lg border-t-2 border-l-2')} />
      <span aria-hidden className={cn(CORNER, '-top-px -right-px rounded-tr-lg border-t-2 border-r-2')} />
      <span aria-hidden className={cn(CORNER, '-bottom-px -left-px rounded-bl-lg border-b-2 border-l-2')} />
      <span aria-hidden className={cn(CORNER, '-right-px -bottom-px rounded-br-lg border-r-2 border-b-2')} />
      {label ? (
        <span
          aria-hidden
          lang="en"
          className="absolute -top-3 left-6 z-10 inline-flex items-center gap-1.5 rounded-full border border-brand-cyan/40 bg-stage px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.18em] text-brand-cyan uppercase"
        >
          <span className="size-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgb(73_207_255)] motion-safe:animate-pulse" />
          {label}
        </span>
      ) : null}
      <div className={cn('relative overflow-hidden rounded-xl', innerClassName)}>
        {children}
        {scan ? <span aria-hidden className="fx-scanline" /> : null}
      </div>
    </div>
  );
}
