import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../../lib/cn.ts';
import { ART, type ArtKey } from '../art.ts';

interface ArtImageProps {
  art: ArtKey;
  /** Displayed size in CSS px (square slot). */
  size: number;
  /** Shown in a quiet brand tile when the map has no art for this key (or every source failed). */
  fallback: LucideIcon;
  className?: string;
}

/**
 * Decorative brand illustration from the single art map (`art.ts`). Fixed square slot so layout never jumps; lazy-loaded;
 * `alt=""` because the adjacent text names the feature. A failed cutout falls back to its brand-system art, then to a lucide
 * icon tile; each source is tried once.
 */
export function ArtImage({ art, size, fallback: Fallback, className }: ArtImageProps) {
  const entry = ART[art];
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const source = !entry ? undefined : stage === 0 ? entry : stage === 1 ? entry.fallback : undefined;

  if (!source) {
    return (
      <span aria-hidden className={cn('grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
        <span
          className="grid size-[52%] place-items-center rounded-2xl border border-action/25 bg-brand-gradient-soft text-brand-cyan shadow-[inset_0_1px_0_rgb(255_255_255_/_0.06)]"
        >
          <Fallback className="size-[44%]" aria-hidden />
        </span>
      </span>
    );
  }
  return (
    <img
      key={source.src}
      src={source.src}
      width={size}
      height={size}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setStage((current) => (current === 0 ? 1 : 2))}
      className={cn('shrink-0 object-contain select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}
