import { useState, type ReactNode } from 'react';
import { cn } from '../../../lib/cn.ts';
import { drawStyle, revealStyle, useElementWidth, useReveal, useRoving } from '../lib/hooks.ts';
import { ChartTooltip } from '../ui/ChartTooltip.tsx';
import { linear, niceTicks } from './scale.ts';

export interface DumbbellRow {
  id: string;
  label: ReactNode;
  a: number;
  b: number;
  /** Optional third mark (e.g. whole-card NVML peak), drawn as a short vertical tick. */
  tick?: number | null;
  aText: string;
  bText: string;
  emphasis?: boolean;
  tip: ReactNode;
  ariaLabel: string;
}

/*
 * Before → after per item: a 2 px connector, a filled dot for `a`, a ringed dot for `b` (same hue, two shades), each with
 * its value printed outward so the two never collide. Optional limit line (dashed: it is a threshold, not a grid line).
 */
export function Dumbbell({
  rows,
  domain,
  label,
  unit,
  limit,
  aClass = 'fill-series-1',
  bClass = 'stroke-series-1',
  lineClass = 'stroke-series-1/45',
  tickClass = 'stroke-fg-secondary',
}: {
  rows: DumbbellRow[];
  domain: [number, number];
  label: string;
  unit: string;
  limit?: { value: number; label: string };
  aClass?: string;
  bClass?: string;
  lineClass?: string;
  tickClass?: string;
}) {
  const [wrapRef, width] = useElementWidth<HTMLDivElement>(560);
  const [revealRef, state] = useReveal<SVGSVGElement>();
  const roving = useRoving(rows.length);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const narrow = width < 440;
  const labelW = narrow ? 0 : Math.min(220, Math.round(width * 0.32));
  const rowH = narrow ? 50 : 34;
  const top = 22;
  const pad = { l: labelW + 46, r: 64 };
  const x = linear(domain, [pad.l, Math.max(pad.l + 60, width - pad.r)]);
  const ticks = niceTicks(domain[0], domain[1], narrow ? 3 : 5);
  const height = top + rows.length * rowH + 6;
  const active = roving.active != null ? rows[roving.active] : undefined;

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <svg ref={revealRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={label} className="block overflow-visible">
        {ticks.map((t) => (
          <g key={t} aria-hidden>
            <line x1={x(t)} x2={x(t)} y1={top - 6} y2={height} className="stroke-line-subtle" strokeWidth={1} />
            <text x={x(t)} y={top - 10} textAnchor="middle" className="fill-fg-tertiary font-mono text-[12px]">
              {t}
              {t === ticks[ticks.length - 1] ? ` ${unit}` : ''}
            </text>
          </g>
        ))}
        {limit ? (
          <g aria-hidden>
            <line x1={x(limit.value)} x2={x(limit.value)} y1={top - 6} y2={height} className="stroke-warning/80" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={x(limit.value) - 4} y={height - 4} textAnchor="end" className="fill-warning text-[12px]">
              {limit.label}
            </text>
          </g>
        ) : null}
        {rows.map((row, index) => {
          const cy = top + index * rowH + (narrow ? 34 : rowH / 2);
          const props = roving.props(index);
          const xa = x(row.a);
          const xb = x(row.b);
          const lo = Math.min(xa, xb);
          const hi = Math.max(xa, xb);
          const focused = roving.active === index;
          return (
            <g
              key={row.id}
              {...props}
              role="img"
              aria-label={row.ariaLabel}
              className="outline-none"
              onFocus={() => {
                props.onFocus();
                setAnchor({ x: hi, y: cy - 8 });
              }}
              onPointerEnter={() => {
                props.onPointerEnter();
                setAnchor({ x: hi, y: cy - 8 });
              }}
            >
              <rect x={0} y={cy - rowH / 2 + (narrow ? -8 : 0)} width={width} height={rowH} className={cn('fill-transparent', focused && 'fill-raised/60')} rx={6} />
              {narrow ? (
                <foreignObject x={0} y={cy - 30} width={width} height={18}>
                  <div className="truncate text-[12px] text-fg-secondary">{row.label}</div>
                </foreignObject>
              ) : (
                <foreignObject x={0} y={cy - rowH / 2} width={labelW} height={rowH}>
                  <div className={cn('flex h-full items-center text-[12px] leading-4 text-balance-cjk', row.emphasis ? 'font-semibold text-fg' : 'text-fg-secondary')}>{row.label}</div>
                </foreignObject>
              )}
              <line x1={lo} x2={hi} y1={cy} y2={cy} className={lineClass} strokeWidth={2} strokeLinecap="round" pathLength={1} style={drawStyle(state, index * 40, 700)} />
              {row.tick != null ? <line x1={x(row.tick)} x2={x(row.tick)} y1={cy - 7} y2={cy + 7} className={tickClass} strokeWidth={2} strokeLinecap="round" style={revealStyle(state, 'fade', index)} /> : null}
              <circle cx={xa} cy={cy} r={4.5} className={cn(aClass, 'stroke-surface')} strokeWidth={2} paintOrder="stroke" style={revealStyle(state, 'dot', index)} />
              <circle cx={xb} cy={cy} r={4} className={cn('fill-surface', bClass)} strokeWidth={2} style={revealStyle(state, 'dot', index + 1)} />
              <text x={Math.min(xa, xb) - 9} y={cy + 4} textAnchor="end" className="fill-fg-secondary font-mono text-[12px]" style={revealStyle(state, 'fade', index)}>
                {xa <= xb ? row.aText : row.bText}
              </text>
              <text x={Math.max(xa, xb) + 9} y={cy + 4} className="fill-fg font-mono text-[12px] font-semibold" style={revealStyle(state, 'fade', index)}>
                {xa <= xb ? row.bText : row.aText}
              </text>
              {focused ? <rect x={lo - 10} y={cy - 10} width={hi - lo + 20} height={20} rx={10} className="fill-none stroke-focus" strokeWidth={1.5} /> : null}
            </g>
          );
        })}
      </svg>
      <ChartTooltip anchor={roving.active != null ? anchor : null} containerWidth={width}>
        {active?.tip}
      </ChartTooltip>
    </div>
  );
}
