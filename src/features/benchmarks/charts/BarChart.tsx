import { CircleX } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { cn } from '../../../lib/cn.ts';
import { revealStyle, useReveal, useRoving } from '../lib/hooks.ts';
import { ChartTooltip } from '../ui/ChartTooltip.tsx';
import { niceTicks } from './scale.ts';

export interface BarItem {
  id: string;
  label: ReactNode;
  meta?: ReactNode;
  /** Bar length (null = failed or missing; the row then shows `failed`). */
  value: number | null;
  /** Optional range end drawn as a pale extension (e.g. slowest of several runs). */
  extent?: number;
  emphasis?: boolean;
  /** Tailwind bg class for the bar (defaults to series-1 = RTX 5080). */
  color?: string;
  valueLabel?: ReactNode;
  failed?: ReactNode;
  tip: ReactNode;
  ariaLabel: string;
}

const VALUE_ROOM = '6.5rem';
const CONTEXT_FILL = 'color-mix(in oklab, var(--color-series-1) 55%, var(--color-surface))';

/*
 * Horizontal bars, thin (12 px), 4 px rounded data end, square at the baseline; value at the tip; hairline solid grid.
 * Emphasis = full colour, context bars = the same hue mixed toward the surface (all marks stay one machine's colour).
 * Rows are one roving Tab stop with the full readout in their accessible name and in the tooltip.
 */
export function BarChart({ items, max, label, format, unit }: { items: BarItem[]; max: number; label: string; format: (value: number) => string; unit: string }) {
  const [ref, state] = useReveal<HTMLDivElement>();
  const roving = useRoving(items.length);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const ticks = niceTicks(0, max, 4).filter((t) => t <= max);
  const pos = (value: number) => `calc((100% - ${VALUE_ROOM}) * ${Math.min(1, value / max)})`;

  const show = (index: number, target: HTMLElement) => {
    roving.setActive(index);
    const wrap = wrapRef.current?.getBoundingClientRect();
    // The readout sits right of the row's value label and grows upward (rows above are shorter: their right side is empty).
    const end = (target.querySelector('[data-value]') ?? target.querySelector('[data-bar]') ?? target).getBoundingClientRect();
    const row = target.getBoundingClientRect();
    if (wrap) setAnchor({ x: end.right - wrap.left, y: row.bottom - wrap.top });
  };

  const activeItem = roving.active != null ? items[roving.active] : undefined;

  return (
    <div ref={ref} className="min-w-0">
      <div ref={wrapRef} className="relative">
        <div className="mb-1 hidden grid-cols-[minmax(0,16rem)_minmax(0,1fr)] gap-4 md:grid" aria-hidden>
          <span />
          <div className="relative h-4 text-[12px] text-fg-tertiary">
            {ticks.map((tick) => (
              <span key={tick} className="machine absolute -translate-x-1/2" style={{ left: pos(tick) }}>
                {format(tick)}
                {tick === ticks[ticks.length - 1] ? ` ${unit}` : ''}
              </span>
            ))}
          </div>
        </div>
        <ul aria-label={label} className="grid">
          {items.map((item, index) => {
            const props = roving.props(index);
            return (
              <li
                key={item.id}
                {...props}
                aria-label={item.ariaLabel}
                onFocus={(event) => {
                  props.onFocus();
                  show(index, event.currentTarget);
                }}
                onPointerEnter={(event) => show(index, event.currentTarget)}
                onPointerLeave={() => {
                  props.onPointerLeave();
                  setAnchor(null);
                }}
                onBlur={() => {
                  props.onBlur();
                  setAnchor(null);
                }}
                className={cn(
                  'group/bar grid grid-cols-1 gap-x-4 gap-y-1 rounded-md px-1 py-1.5 outline-offset-0 md:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] md:items-center',
                  roving.active === index && 'bg-raised/60',
                )}
              >
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className={cn('machine text-caption [overflow-wrap:anywhere]', item.emphasis ? 'font-semibold text-fg' : 'text-fg-secondary')}>{item.label}</span>
                  {item.meta ? <span className="text-[12px] text-fg-tertiary">{item.meta}</span> : null}
                </div>
                <div className="relative h-5">
                  {ticks.map((tick) => (
                    <span key={tick} aria-hidden className="absolute inset-y-0 w-px bg-line-subtle" style={{ left: pos(tick) }} />
                  ))}
                  {item.value != null ? (
                    <>
                      {item.extent != null && item.extent > item.value ? (
                        <span
                          aria-hidden
                          className={cn('absolute top-1/2 h-3 -translate-y-1/2 rounded-r-[4px] opacity-40', item.color ?? (item.emphasis ? 'bg-series-1' : undefined))}
                          style={{
                            left: `calc(${pos(item.value)} + 2px)`,
                            width: `max(1px, calc((100% - ${VALUE_ROOM}) * ${(item.extent - item.value) / max} - 2px))`,
                            ...(item.emphasis || item.color ? {} : { backgroundColor: CONTEXT_FILL }),
                            ...revealStyle(state, 'bar-x', index),
                          }}
                        />
                      ) : null}
                      <span
                        data-bar
                        aria-hidden
                        className={cn('absolute top-1/2 left-0 h-3 -translate-y-1/2', item.extent != null && item.extent > item.value ? 'rounded-none' : 'rounded-r-[4px]', item.color ?? 'bg-series-1')}
                        style={{
                          width: pos(item.value),
                          ...(item.emphasis || item.color ? {} : { backgroundColor: CONTEXT_FILL }),
                          ...revealStyle(state, 'bar-x', index),
                        }}
                      />
                      <span
                        data-value
                        aria-hidden
                        className={cn('machine absolute top-1/2 -translate-y-1/2 pl-1.5 text-caption whitespace-nowrap', item.emphasis ? 'font-semibold text-fg' : 'text-fg-secondary')}
                        style={{ left: pos(item.extent ?? item.value), ...revealStyle(state, 'fade', index) }}
                      >
                        {item.valueLabel ?? format(item.value)}
                      </span>
                    </>
                  ) : (
                    <span className="absolute inset-y-0 left-0 inline-flex items-center gap-1 text-caption text-danger [&_svg]:size-3.5">
                      <CircleX aria-hidden />
                      {item.failed}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <ChartTooltip anchor={anchor} containerWidth={wrapRef.current?.clientWidth ?? 0} placement="right-up">
          {activeItem?.tip}
        </ChartTooltip>
      </div>
    </div>
  );
}
