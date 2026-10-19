import { Fragment, useState } from 'react';
import { cn } from '../../../lib/cn.ts';
import { useLocale } from '../../../i18n/locale.tsx';
import { useBenchCopy } from '../copy.ts';
import { placeSteps } from '../data/select.ts';
import type { Step } from '../data/types.ts';
import { DEVICE_FILL, isDevice } from '../lib/devices.ts';
import { fmtSeconds } from '../lib/format.ts';
import { revealStyle, useElementWidth, useReveal, useRoving } from '../lib/hooks.ts';
import { ChartTooltip, TipRow } from '../ui/ChartTooltip.tsx';
import { linear, niceTicks } from './scale.ts';

export interface TimelineRun {
  id: string;
  label: string;
  total: number;
  steps: readonly Step[];
}

const HATCH_ID = 'bench-hatch';

/** Shared hatch pattern for unattributed time (texture as the honest "unknown", not decoration). */
function HatchDefs() {
  return (
    <defs>
      <pattern id={HATCH_ID} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
        <rect width="5" height="5" className="fill-sunken" />
        <rect width="1.6" height="5" className="fill-fg-tertiary/50" />
      </pattern>
    </defs>
  );
}

/*
 * Run timelines (Gantt) on one shared time axis. Each step is a solid segment in its machine's colour; steps that run at
 * the same time stack in a second lane; the remainder up to the run's wall time is hatched as unattributed (scheduling,
 * transfers) instead of being spread across steps. Marks grow in from the axis once on view.
 */
export function Timeline({ runs, label }: { runs: readonly TimelineRun[]; label: string }) {
  const copy = useBenchCopy();
  const locale = useLocale();
  const [wrapRef, width] = useElementWidth<HTMLDivElement>(760);
  const [revealRef, state] = useReveal<SVGSVGElement>();
  const pad = { l: 4, r: 56, t: 4, b: 26 };
  const rowH = 52;
  const laneH = 11;
  const height = pad.t + runs.length * rowH + pad.b;
  const max = Math.max(...runs.map((r) => r.total));
  const x = linear([0, max], [pad.l, Math.max(pad.l + 40, width - pad.r)]);
  const ticks = niceTicks(0, max, width < 520 ? 3 : 6);

  const marks = runs.flatMap((run, r) => {
    const { placed, end } = placeSteps(run.steps);
    const y0 = pad.t + r * rowH + 20;
    const items = placed.map((p) => ({ run, kind: 'step' as const, p, x0: x(p.start), x1: x(p.start + (p.step.seconds ?? 0)), y: y0 + p.lane * (laneH + 3) }));
    const gap = run.total - end;
    const tail = gap > 0.05 ? [{ run, kind: 'gap' as const, gap, x0: x(end), x1: x(run.total), y: y0 }] : [];
    return [...items, ...tail];
  });
  const roving = useRoving(marks.length);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const active = roving.active != null ? marks[roving.active] : undefined;

  return (
    <div ref={wrapRef} className="relative min-w-0">
      <svg ref={revealRef} width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={label} className="block overflow-visible">
        <HatchDefs />
        {ticks.map((tick) => (
          <g key={tick} aria-hidden>
            <line x1={x(tick)} x2={x(tick)} y1={pad.t} y2={height - pad.b + 4} className="stroke-line-subtle" strokeWidth={1} />
            <text x={x(tick)} y={height - 8} textAnchor="middle" className="fill-fg-tertiary font-mono text-[12px]">
              {tick}
            </text>
          </g>
        ))}
        <text aria-hidden x={width - pad.r + 8} y={height - 8} className="fill-fg-tertiary text-[12px]">
          {copy.references.timelines.axis}
        </text>
        {runs.map((run, r) => (
          <g key={run.id} aria-hidden>
            <text x={pad.l} y={pad.t + r * rowH + 13} className="fill-fg-secondary text-[12px]">
              {run.label}
            </text>
            <text x={x(run.total) + 6} y={pad.t + r * rowH + 30} className="fill-fg font-mono text-[12px] font-semibold">
              {fmtSeconds(locale, run.total)}
            </text>
          </g>
        ))}
        {marks.map((mark, index) => {
          const props = roving.props(index);
          const w = Math.max(1, mark.x1 - mark.x0 - (mark.x1 - mark.x0 > 4 ? 2 : 0));
          const focusRing = roving.active === index;
          const onShow = () => setAnchor({ x: mark.x0 + w / 2, y: mark.y });
          if (mark.kind === 'gap')
            return (
              <rect
                key={`${mark.run.id}-gap`}
                {...props}
                role="img"
                aria-label={`${mark.run.label}: ${copy.references.timelines.unattributed} ${fmtSeconds(locale, mark.gap)}`}
                x={mark.x0 + 1}
                y={mark.y}
                width={Math.max(1, mark.x1 - mark.x0 - 1)}
                height={laneH}
                fill={`url(#${HATCH_ID})`}
                className={cn('outline-none', focusRing && 'stroke-focus')}
                strokeWidth={focusRing ? 1.5 : 0}
                style={revealStyle(state, 'fade', index, 18)}
                onFocus={() => {
                  props.onFocus();
                  onShow();
                }}
                onPointerEnter={() => {
                  props.onPointerEnter();
                  onShow();
                }}
              />
            );
          const step = mark.p.step;
          const device = isDevice(step.placement) ? step.placement : null;
          return (
            <rect
              key={`${mark.run.id}-${step.kind}`}
              {...props}
              role="img"
              aria-label={`${mark.run.label}: ${copy.steps[step.kind]} ${fmtSeconds(locale, step.seconds ?? 0, step.approx)}${device ? ` · ${copy.machines[device]}` : ''}`}
              x={mark.x0}
              y={mark.y}
              width={w}
              height={laneH}
              rx={2}
              className={cn('outline-none', device ? DEVICE_FILL[device] : 'fill-fg-disabled', focusRing && 'stroke-focus')}
              strokeWidth={focusRing ? 1.5 : 0}
              style={revealStyle(state, 'bar-x', index, 18)}
              onFocus={() => {
                props.onFocus();
                onShow();
              }}
              onPointerEnter={() => {
                props.onPointerEnter();
                onShow();
              }}
            />
          );
        })}
      </svg>
      <ChartTooltip anchor={roving.active != null ? anchor : null} containerWidth={width}>
        {active ? (
          active.kind === 'gap' ? (
            <TipRow value={fmtSeconds(locale, active.gap)} label={copy.references.timelines.unattributed} />
          ) : (
            <>
              <TipRow value={fmtSeconds(locale, active.p.step.seconds ?? 0, active.p.step.approx)} label={copy.steps[active.p.step.kind]} />
              <span className="machine text-[12px] text-fg-tertiary">
                {active.p.step.component}
                {isDevice(active.p.step.placement) ? ` · ${copy.machines[active.p.step.placement]}` : ''}
              </span>
            </>
          )
        ) : null}
      </ChartTooltip>
    </div>
  );
}

/*
 * Compact step bar for table rows and clip cards: one 100%-wide strip, two 5 px lanes (parallel steps below), machine
 * colours, 1 px gaps. Decorative — the steps are always listed as text next to it.
 */
export function MiniTimeline({ steps, total, className }: { steps: readonly Step[]; total: number | null; className?: string }) {
  const { placed, end } = placeSteps(steps);
  const span = Math.max(total ?? 0, end) || 1;
  const hasLane1 = placed.some((p) => p.lane === 1);
  return (
    <svg aria-hidden viewBox={`0 0 1000 ${hasLane1 ? 12 : 6}`} preserveAspectRatio="none" className={cn('block h-3 w-full', !hasLane1 && 'h-1.5', className)}>
      <rect x={0} y={0} width={1000} height={hasLane1 ? 12 : 6} className="fill-sunken" />
      {placed.map((p) => {
        const device = isDevice(p.step.placement) ? p.step.placement : null;
        const x0 = (p.start / span) * 1000;
        const w = Math.max(2, ((p.step.seconds ?? 0) / span) * 1000 - 3);
        return (
          <Fragment key={p.step.kind}>
            <rect x={x0} y={p.lane === 1 ? 7 : 0} width={w} height={5} className={device ? DEVICE_FILL[device] : 'fill-fg-disabled'} />
          </Fragment>
        );
      })}
    </svg>
  );
}
