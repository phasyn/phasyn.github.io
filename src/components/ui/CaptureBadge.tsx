import { cn } from '../../lib/cn.ts';
import { captureBadge } from '../../site/captures.ts';
import { AiBadge } from './AiBadge.tsx';

/**
 * AI disclosure for a real still capture (src/site/captures.ts): the AiBadge `screen` chip pinned to the capture's top-left
 * corner, always visible, wrapping on narrow frames. Renders nothing for UI-only captures. Place it as a sibling of the
 * capture (outside any link, so it is read and never panned, zoomed or drifted) inside a positioned box; clicks pass through.
 */
export function CaptureBadge({ capture, className }: { capture: string; className?: string }) {
  const variant = captureBadge(capture);
  if (!variant) return null;
  return (
    <span className={cn('pointer-events-none absolute top-2 left-2 z-10 max-w-[calc(100%-1rem)]', className)}>
      <AiBadge variant={variant} />
    </span>
  );
}
