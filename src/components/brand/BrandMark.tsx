import { cn } from '../../lib/cn.ts';

interface BrandMarkProps {
  size?: number;
  glow?: boolean;
  label?: string;
  /** `lazy` for marks below the fold (footer) so React does not preload them with the header's sizes. */
  loading?: 'eager' | 'lazy';
  className?: string;
}

/** The transparent layered-frame mark (user original `logo_nb.png`). Never redrawn or distorted. */
export function BrandMark({ size = 32, glow = false, label, loading = 'eager', className }: BrandMarkProps) {
  const src = size <= 32 ? '/brand/mark-64.webp' : size <= 64 ? '/brand/mark-128.webp' : size <= 128 ? '/brand/mark-256.webp' : '/brand/mark-512.webp';
  return (
    <img
      src={src}
      srcSet="/brand/mark-64.webp 64w, /brand/mark-128.webp 128w, /brand/mark-256.webp 256w, /brand/mark-512.webp 512w"
      sizes={`${size}px`}
      width={size}
      height={size}
      alt={label ?? ''}
      {...(label ? {} : { 'aria-hidden': true })}
      draggable={false}
      decoding="async"
      loading={loading}
      // Low priority: tiny decorative marks never compete with real content, and React does not preload them
      // (a preloaded mark hidden by CSS, e.g. the other header variant, would trigger an "unused preload" warning).
      fetchPriority="low"
      className={cn('shrink-0 object-contain select-none', glow && 'drop-shadow-[0_0_14px_rgb(79_123_255_/_0.45)]', className)}
      style={{ width: size, height: size }}
    />
  );
}
