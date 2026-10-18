import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/*
 * Chart readout (overlay-surface + material-popover, role=tooltip). Positioned inside the chart's relative wrapper above
 * the anchor point, flipped below near the top and clamped to the wrapper's width so it never causes overflow at 390 px.
 * Values lead (strong, mono); the label follows in secondary ink.
 */
export function ChartTooltip({ anchor, containerWidth, children }: { anchor: { x: number; y: number } | null; containerWidth: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || !anchor) {
      setBox(null);
      return;
    }
    const { width, height } = element.getBoundingClientRect();
    const left = Math.min(Math.max(anchor.x - width / 2, 0), Math.max(0, containerWidth - width));
    const top = anchor.y - height - 10 < 0 ? anchor.y + 14 : anchor.y - height - 10;
    setBox({ left, top });
  }, [anchor, containerWidth, children]);

  if (!anchor) return null;
  return (
    <div
      ref={ref}
      role="tooltip"
      className="overlay-surface material-popover pointer-events-none absolute z-20 grid w-max max-w-[min(18rem,100%)] gap-1 px-3 py-2 text-caption text-fg-secondary"
      style={box ? { left: box.left, top: box.top } : { left: 0, top: 0, visibility: 'hidden' }}
    >
      {children}
    </div>
  );
}

/** One readout line: line key in the mark colour, value first, label after. */
export function TipRow({ value, label, keyClass }: { value: ReactNode; label: ReactNode; keyClass?: string }) {
  return (
    <span className="flex items-baseline gap-2">
      {keyClass ? <span aria-hidden className={`inline-block h-0.5 w-3 shrink-0 translate-y-[-3px] rounded-full ${keyClass}`} /> : null}
      <span className="machine font-semibold text-fg">{value}</span>
      <span className="min-w-0">{label}</span>
    </span>
  );
}
