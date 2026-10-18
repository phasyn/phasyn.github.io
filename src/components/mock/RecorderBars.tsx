import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';
import './mock.css';

export interface RecorderBarRow {
  /** Stable id (React key). */
  id: string;
  /** Row label, e.g. a step id (`dit`) or an engine name. */
  label: string;
  /** Secondary mono line, e.g. `dit-5080 · RTX 5080`. */
  detail?: string;
  /** Numeric value that sets the bar length (same unit for every row). */
  value: number;
  /** Text shown for the value, e.g. "34.7 s". Use real measurements only, or values the frame label marks as illustrative. */
  display: string;
  /** Marks the row the panel is about (bold label); no glow, charts stay solid. */
  emphasis?: boolean;
  /** Trailing content (a status chip such as "Not measured" with its reason). */
  note?: ReactNode;
}

export interface RecorderBarsProps {
  rows: RecorderBarRow[];
  /** Scale maximum; defaults to the largest value. */
  max?: number;
  /** Table caption for assistive tech (visually hidden). */
  caption: string;
  /** Column headers for assistive tech (visually hidden): label column and value column. */
  headers: { label: string; value: string };
  /** From `useMockPlayback`: bars start collapsed once armed and grow when `shown`. */
  armed?: boolean;
  shown?: boolean;
  className?: string;
}

/**
 * Solid horizontal bar chart in the Records style (series-1 fills, mono tabular values, no glow). Rendered as a real table so
 * the measured values stay readable for assistive tech. Bars grow once from the left on first view (transform only).
 */
export function RecorderBars({ rows, max, caption, headers, armed = false, shown = false, className }: RecorderBarsProps) {
  const scale = max ?? Math.max(...rows.map((row) => row.value), 1);
  return (
    <table
      className={cn('w-full border-collapse text-left', className)}
      {...(armed ? { 'data-mock-armed': '' } : {})}
      {...(shown ? { 'data-mock-shown': '' } : {})}
    >
      <caption className="sr-only">{caption}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">{headers.label}</th>
          <th scope="col">{headers.value}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={row.id} className="align-middle">
            <th scope="row" className="w-[42%] py-1.5 pr-3 font-normal">
              <span className={cn('machine block text-data leading-5', row.emphasis ? 'font-semibold text-fg' : 'text-fg-secondary')}>{row.label}</span>
              {row.detail ? <span className="machine block truncate text-[11px] leading-4 text-fg-tertiary">{row.detail}</span> : null}
            </th>
            <td className="py-1.5">
              <div className="flex items-center gap-2.5">
                <div className="relative h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-sunken shadow-[inset_0_0_0_1px_var(--color-line-subtle)]">
                  <div
                    className={cn('mock-bar absolute inset-y-0 left-0 rounded-full', row.emphasis ? 'bg-series-1' : 'bg-series-1/70')}
                    style={{ width: `${Math.max(0.6, (row.value / scale) * 100)}%`, '--i': index } as CSSProperties}
                  />
                </div>
                <span className={cn('machine w-16 shrink-0 text-right text-data', row.emphasis ? 'text-fg' : 'text-fg-secondary')}>{row.display}</span>
                {row.note}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
