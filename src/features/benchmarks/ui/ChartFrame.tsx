import { ChartColumn, Table2 } from 'lucide-react';
import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '../../../lib/cn.ts';
import { useBenchCopy } from '../copy.ts';

/*
 * Every chart sits in a solid panel (never over the nebula) with its title, a one-line reading guide, an optional legend,
 * and a Chart/Table switch: the table is the accessible twin and carries every value the chart shows.
 */
export function ChartFrame({
  title,
  desc,
  legend,
  table,
  note,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  desc?: ReactNode;
  legend?: ReactNode;
  table?: ReactNode;
  note?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  const copy = useBenchCopy();
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const groupId = useId();
  return (
    <figure className={cn('panel grid min-w-0 content-start gap-4 p-4 sm:p-5 lg:p-6', className)}>
      <figcaption className="grid min-w-0 gap-1.5">
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <h3 className="min-w-0 flex-1 basis-64 text-section font-semibold text-balance-cjk text-fg">{title}</h3>
          {table ? (
            <div role="group" aria-labelledby={groupId} className="inline-flex shrink-0 rounded-lg border border-line-control/60 bg-sunken p-0.5">
              <span id={groupId} className="sr-only">
                {copy.common.viewAs}
              </span>
              {(['chart', 'table'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={view === option}
                  onClick={() => setView(option)}
                  className={cn(
                    'pressable inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-caption [&_svg]:size-3.5',
                    view === option ? 'bg-overlay text-fg shadow-[0_1px_2px_rgb(0_0_0/0.4),inset_0_1px_0_rgb(255_255_255/0.06)]' : 'text-fg-tertiary hover:text-fg',
                  )}
                >
                  {option === 'chart' ? <ChartColumn aria-hidden /> : <Table2 aria-hidden />}
                  {option === 'chart' ? copy.common.chart : copy.common.table}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {desc ? <p className="max-w-[72ch] text-data text-pretty text-fg-secondary">{desc}</p> : null}
      </figcaption>
      {legend}
      <div hidden={view === 'table'} className={cn('min-w-0', bodyClassName)}>
        {children}
      </div>
      {table && view === 'table' ? <div className="min-w-0">{table}</div> : null}
      {note ? <p className="text-caption text-pretty text-fg-tertiary">{note}</p> : null}
    </figure>
  );
}

export interface Column<K extends string> {
  key: K;
  label: ReactNode;
  align?: 'start' | 'end';
  mono?: boolean;
}

/** Plain data table in its own horizontal scroller (guide §12.10). */
export function SimpleTable<K extends string>({ label, columns, rows, className }: { label: string; columns: Column<K>[]; rows: { id: string; cells: Record<K, ReactNode> }[]; className?: string }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className={cn('max-w-full overflow-x-auto rounded-lg border border-line-subtle bg-sunken/40', className)}>
      <table className="w-full border-collapse text-left text-data">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn('border-b border-line bg-sunken/80 px-3 py-2 text-caption font-medium whitespace-nowrap text-fg-tertiary first:pl-4', column.align === 'end' && 'text-right')}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-raised/60">
              {columns.map((column, index) => {
                const Cell = index === 0 ? 'th' : 'td';
                return (
                  <Cell
                    key={column.key}
                    {...(index === 0 ? { scope: 'row' as const } : {})}
                    className={cn(
                      'border-b border-line-subtle px-3 py-2 align-top font-normal first:pl-4',
                      column.align === 'end' && 'text-right',
                      column.mono && 'machine whitespace-nowrap',
                      index === 0 ? 'text-fg' : 'text-fg-secondary',
                    )}
                  >
                    {row.cells[column.key]}
                  </Cell>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type SwatchKind = 'dot' | 'bar' | 'line' | 'hatch' | 'ring';

/** Legend row: the swatch mirrors the mark; the text stays in text tokens. */
export function Legend({ items, className }: { items: { label: ReactNode; swatch: SwatchKind; color?: string; style?: CSSProperties }[]; className?: string }) {
  return (
    <ul className={cn('flex flex-wrap gap-x-5 gap-y-2 text-caption text-fg-secondary', className)}>
      {items.map((item, index) => (
        <li key={index} className="inline-flex items-center gap-2">
          <Swatch kind={item.swatch} color={item.color} style={item.style} />
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function Swatch({ kind, color, style }: { kind: SwatchKind; color?: string | undefined; style?: CSSProperties | undefined }) {
  if (kind === 'line') return <span aria-hidden className={cn('inline-block h-0.5 w-4 rounded-full', color)} style={style} />;
  if (kind === 'dot') return <span aria-hidden className={cn('inline-block size-2.5 rounded-full', color)} style={style} />;
  if (kind === 'ring') return <span aria-hidden className={cn('inline-block size-2.5 rounded-full border-2 bg-transparent', color)} style={style} />;
  if (kind === 'hatch')
    return (
      <span
        aria-hidden
        className="inline-block h-2.5 w-4 rounded-[3px] border border-line-control/60"
        style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgb(146 158 192 / 0.55) 0 1.5px, transparent 1.5px 4px)', ...style }}
      />
    );
  return <span aria-hidden className={cn('inline-block h-2.5 w-4 rounded-[3px]', color)} style={style} />;
}
