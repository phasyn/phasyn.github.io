import { useId } from 'react';
import { cn } from '../../lib/cn.ts';

interface WordmarkProps {
  /** Rendered width in px; height follows the 681-unit artwork. */
  width?: number;
  /** Omit the STUDIO line. */
  short?: boolean;
  /** Brand gradient fill — brand moments only (DESIGN_GUIDE §10). */
  gradient?: boolean;
  /** Show the "AI-Native Filmmaking Platform" line. */
  tagline?: boolean;
  /** Hide from assistive tech when a visible name is next to it. */
  decorative?: boolean;
  className?: string;
}

const VIEW_W = 681;

/**
 * PHASYN wordmark: wide geometric capitals, an A without crossbar holding a
 * brand-blue triangle, and a widely tracked STUDIO line. Artwork from the brand
 * system showcase (tools/showcase/build.mjs), drawn as SVG so no font loads.
 */
export function Wordmark({ width = 160, short = false, gradient = false, tagline = false, decorative = false, className }: WordmarkProps) {
  const uid = useId().replace(/:/g, '');
  const viewH = short ? 100 : 160;
  const height = Math.round(((width * viewH) / VIEW_W) * 1000) / 1000;
  const gradientId = `wm-grad-${uid}`;
  const clipId = `wm-clip-${uid}`;
  const fill = gradient ? `url(#${gradientId})` : 'currentColor';
  return (
    <span className={cn('inline-grid justify-items-start gap-[0.35em] leading-none text-fg', className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${viewH}`}
        width={width}
        height={height}
        focusable="false"
        className="block overflow-visible"
        {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': 'Phasyn Studio' })}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2={VIEW_W} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: 'var(--color-brand-cyan)' }} />
            <stop offset="0.5" style={{ stopColor: 'var(--color-brand-blue)' }} />
            <stop offset="1" style={{ stopColor: 'var(--color-brand-violet)' }} />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={VIEW_W} height="100" />
          </clipPath>
        </defs>
        <g fill="none" stroke={fill} strokeWidth="16" strokeLinejoin="miter" clipPath={`url(#${clipId})`}>
          <path d="M8 100V8H54A27 27 0 0 1 54 62H8" />
          <path d="M117 0V100M193 0V100M117 50H193" />
          <path d="M445 8H381A20 20 0 0 0 361 28V30A20 20 0 0 0 381 50H417A20 20 0 0 1 437 70V72A20 20 0 0 1 417 92H353" />
          <path d="M467 -10L517 50L567 -10M517 50V100" />
        </g>
        <path fill={fill} d="M221 100L277 0L333 100H314.66L277 32.75L239.34 100Z" />
        <path fill={fill} d="M589 0H605V100H589ZM665 0H681V100H665ZM589 0H609L681 100H661Z" />
        <path style={{ fill: gradient ? 'var(--color-fg)' : 'var(--color-brand-blue)' }} d="M253 100L277 57L301 100Z" />
        {short ? null : (
          <g fill="none" stroke="currentColor" strokeWidth="6" opacity="0.88">
            <path d="M27 133H9A6 6 0 0 0 3 139A6 6 0 0 0 9 145H18A6 6 0 0 1 24 151A6 6 0 0 1 18 157H0" />
            <path d="M129 133H159M144 133V160" />
            <path d="M264 130V146.5A10.5 10.5 0 0 0 285 146.5V130" />
            <path d="M393.5 133H404.5A12 12 0 0 1 404.5 157H393.5Z" />
            <path d="M535.5 130V160" />
            <rect x="654" y="133" width="24" height="24" rx="12" />
          </g>
        )}
      </svg>
      {tagline ? (
        <span className="text-[10px] font-medium tracking-[0.42em] whitespace-nowrap text-fg-tertiary uppercase" lang="en">
          AI-Native Filmmaking Platform
        </span>
      ) : null}
    </span>
  );
}
