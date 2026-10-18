import { ArrowDown, ArrowUp, ArrowUpDown, Ban, ChevronDown, CircleCheck, CircleX, Download, LoaderCircle, RotateCcw } from 'lucide-react';
import { Fragment, useId, useMemo, useState, type ReactNode } from 'react';
import { cn } from '../../../lib/cn.ts';
import type { Copy } from '../../../i18n/locale.tsx';
import { useLocale } from '../../../i18n/locale.tsx';
import { useBenchCopy } from '../copy.ts';
import { FAILED_ROWS, FEATURED_ROWS, ROW_COUNTS } from '../data/rows.gen.ts';
import { configTags, devicesUsed, ditCompleted, failedStep, outputText, runLabel, statusLabel, variantName } from '../data/rowText.ts';
import type { Pipeline, Precision, Schedule, SpeedRow, Step } from '../data/types.ts';
import { MiniTimeline } from '../charts/Timeline.tsx';
import { DEVICE_SHORT } from '../lib/devices.ts';
import { fmtGiB, fmtSeconds, fmtSec } from '../lib/format.ts';
import { useAllRows, useMediaQuery, type RowsState } from '../lib/hooks.ts';
import { DeviceChip, DeviceDot, MissingValue } from '../ui/DeviceChip.tsx';
import { Hint } from '../ui/Hint.tsx';
import { Section, SubHead } from '../ui/Section.tsx';
import { SimpleTable } from '../ui/ChartFrame.tsx';

type TableKind = 'h3' | 'image';
type SortKey = 'dit' | 'total' | 'vram';
type StatusFilter = 'all' | 'ok' | 'failed';

const PIPELINES: Record<TableKind, Pipeline[]> = { h3: ['t2va', 'fl2va', 'ref2va'], image: ['t2i', 'i2i'] };
const PRECISIONS: Record<TableKind, Precision[]> = { h3: ['FP8', 'INT8', 'BF16', 'NF4'], image: ['BF16', 'GGUF Q4_K_M'] };
const SCHEDULES: Schedule[] = ['pai8', 'turbo8', 'turbo4', 'original'];

function sortValue(row: SpeedRow, key: SortKey): number | null {
  if (key === 'dit') return ditCompleted(row) ? row.dit : null;
  if (key === 'total') return row.total;
  return row.vram.reserved;
}

function StatusChip({ row }: { row: SpeedRow }) {
  const copy = useBenchCopy();
  const { tone, label } = statusLabel(copy, row);
  const Icon = tone === 'ok' ? CircleCheck : tone === 'cancelled' ? Ban : CircleX;
  return (
    <span
      className={cn(
        'inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-left text-caption leading-tight text-balance [&_svg]:size-3.5 [&_svg]:shrink-0',
        tone === 'ok' && 'border-transparent px-0 text-fg-secondary [&_svg]:text-success',
        tone === 'failed' && 'border-danger/30 bg-danger/12 text-danger',
        tone === 'cancelled' && 'border-line-strong bg-raised text-fg-secondary',
      )}
    >
      <Icon aria-hidden />
      {label}
    </span>
  );
}

function Seconds({ value, approx }: { value: number; approx?: boolean | undefined }) {
  const locale = useLocale();
  return <span className="machine whitespace-nowrap text-fg">{`${approx ? '≈' : ''}${fmtSec(locale, value)}`}</span>;
}

/** DiT step wall time (the page default), with the recorder's denoise compute as a labelled secondary line. */
function DitCell({ row, align = 'end' }: { row: SpeedRow; align?: 'start' | 'end' }) {
  const copy = useBenchCopy();
  const locale = useLocale();
  const main =
    ditCompleted(row) && row.dit != null ? (
      <Seconds value={row.dit} approx={row.ditApprox} />
    ) : row.ditReason === 'batch-dit' ? (
      <MissingValue kind="notReported" reason="batch-dit" />
    ) : (
      <span className="text-fg-tertiary">—</span>
    );
  if (row.compute == null) return main;
  return (
    <span className={cn('inline-grid gap-0.5', align === 'end' ? 'justify-items-end' : 'justify-items-start')}>
      {main}
      <span className={cn('flex flex-wrap gap-x-1 text-[12px] leading-tight text-fg-tertiary', align === 'end' ? 'justify-end text-right' : 'justify-start')}>
        <span>{copy.speed.cols.compute}</span>
        <span className="machine whitespace-nowrap">{fmtSec(locale, row.compute)}</span>
      </span>
    </span>
  );
}

function TotalCell({ row }: { row: SpeedRow }) {
  const locale = useLocale();
  if (row.total != null) return <Seconds value={row.total} />;
  if (row.status !== 'ok') return <span className="text-fg-tertiary">—</span>;
  return (
    <span className="inline-grid justify-items-end gap-0.5">
      <MissingValue kind="notEndToEnd" reason={row.totalReason ?? undefined} />
      {row.run != null ? <span className="machine text-[12px] whitespace-nowrap text-fg-tertiary">run {fmtSeconds(locale, row.run)}</span> : null}
    </span>
  );
}

function VramCell({ row, align = 'end' }: { row: SpeedRow; align?: 'start' | 'end' }) {
  const copy = useBenchCopy();
  const locale = useLocale();
  const v = row.vram;
  if (v.alloc == null && v.reserved == null && v.card == null) return <MissingValue kind={v.reason === 'today-not-logged' ? 'notReported' : 'notMeasured'} reason={v.reason} />;
  const part = (value: number | null) => (value == null ? '—' : fmtGiB(locale, value));
  return (
    <span className={cn('inline-grid gap-0.5 text-caption text-fg-secondary', align === 'end' ? 'justify-items-end' : 'justify-items-start')}>
      <span className="machine whitespace-nowrap">
        <span className="text-fg">{part(v.alloc)}</span> / {part(v.reserved)}
      </span>
      <span className="text-[12px] whitespace-nowrap text-fg-tertiary">
        {copy.speed.vramParts[2]}{' '}
        <span className="machine">{v.card == null && v.cardReason ? <Hint content={<CardReason reason={v.cardReason} />}>—</Hint> : part(v.card)}</span>
      </span>
    </span>
  );
}

function CardReason({ reason }: { reason: NonNullable<SpeedRow['vram']['cardReason']> }) {
  const copy = useBenchCopy();
  return <>{copy.reasons[reason]}</>;
}

function StepsCell({ row }: { row: SpeedRow }) {
  const copy = useBenchCopy();
  const devices = devicesUsed(row);
  const unknown = row.steps.some((step) => step.placement === 'not-recorded');
  return (
    <div className="grid w-full max-w-40 gap-1.5">
      <MiniTimeline steps={row.steps} total={row.total ?? row.run} />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {devices.map((device) => (
          <span key={device} className="inline-flex items-center gap-1 text-[12px] text-fg-secondary">
            <DeviceDot device={device} />
            <span aria-hidden>{DEVICE_SHORT[device]}</span>
            <span className="sr-only">{copy.machines[device]}</span>
          </span>
        ))}
        {unknown ? <DeviceChip placement="not-recorded" reason={row.steps.find((step) => step.placement === 'not-recorded')?.reason} /> : null}
      </div>
    </div>
  );
}

function VariantCell({ row }: { row: SpeedRow }) {
  const copy = useBenchCopy();
  const tags = configTags(copy, row);
  return (
    <div className="grid min-w-0 gap-1">
      {/* keep-all: CJK names break at spaces ("40 ステップ" stays whole), with anywhere as the overflow valve. */}
      <span className="font-semibold [overflow-wrap:anywhere] [word-break:keep-all] text-fg">{variantName(copy, row)}</span>
      <span className="machine text-[12px] text-fg-secondary">{outputText(copy, row)}</span>
      {row.component ? (
        <code className="machine block truncate text-[12px] text-fg-tertiary" title={row.component}>
          {row.component}
        </code>
      ) : null}
      {tags.length ? (
        <span className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span key={tag} className="rounded border border-line-subtle bg-sunken px-1 font-mono text-[11px] leading-4 text-fg-tertiary">
              {tag}
            </span>
          ))}
        </span>
      ) : null}
    </div>
  );
}

/** Every step with its component, machine, time and caveats (the "expand row" view). */
function StepDetail({ row, note, notesState }: { row: SpeedRow; note: Copy<string> | undefined; notesState: RowsState['status'] }) {
  const copy = useBenchCopy();
  const locale = useLocale();
  const d = copy.speed.detail;
  const flags = (step: Step): ReactNode[] => {
    const out: ReactNode[] = [];
    if (step.sharedFrom) out.push(copy.common.reusedFrom(step.sharedFrom));
    if (step.parallelWith) out.push(`${copy.common.parallel}: ${copy.steps[step.parallelWith]}`);
    if (step.reason) out.push(copy.reasons[step.reason]);
    if (step.error) out.push(<code className="machine text-danger">{step.error}</code>);
    return out;
  };
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
      <SimpleTable
        label={`${d.steps} · ${runLabel(copy, row)}`}
        columns={[
          { key: 'step', label: d.steps },
          { key: 'component', label: d.component },
          { key: 'machine', label: d.machine },
          { key: 'time', label: d.time, align: 'end' },
          { key: 'compute', label: d.compute, align: 'end' },
          { key: 'note', label: d.notes },
        ]}
        rows={row.steps.map((step, index) => ({
          id: `${step.kind}-${index}`,
          cells: {
            step: (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                {step.status === 'failed' ? <CircleX aria-hidden className="size-3.5 text-danger" /> : step.status === 'cancelled' ? <Ban aria-hidden className="size-3.5 text-fg-tertiary" /> : null}
                {copy.steps[step.kind]}
              </span>
            ),
            component: step.component ? <code className="machine text-[12px] text-fg-secondary">{step.component}</code> : <span className="text-fg-tertiary">—</span>,
            machine: step.placements ? (
              <span className="flex flex-wrap gap-1">
                {step.placements.map((device) => (
                  <DeviceChip key={device} placement={device} />
                ))}
              </span>
            ) : (
              <DeviceChip placement={step.placement} reason={step.reason} />
            ),
            time: step.seconds != null ? <span className="machine whitespace-nowrap text-fg">{fmtSeconds(locale, step.seconds, step.approx)}</span> : <MissingValue kind={step.status === 'not-run' || step.status === 'cancelled' ? 'notRun' : 'notMeasured'} reason={step.reason} />,
            compute: step.compute != null ? <span className="machine whitespace-nowrap text-fg-secondary">{fmtSeconds(locale, step.compute)}</span> : <span className="text-fg-tertiary">—</span>,
            note: (
              <span className="grid gap-0.5 text-caption text-fg-tertiary">
                {flags(step).map((flag, i) => (
                  <span key={i}>{flag}</span>
                ))}
              </span>
            ),
          },
        }))}
      />
      <dl className="grid content-start gap-x-4 gap-y-2 text-data sm:grid-cols-[auto_minmax(0,1fr)]">
        <dt className="text-fg-tertiary">{copy.common.runId}</dt>
        <dd className="machine text-fg">{row.runId ?? '—'}</dd>
        <dt className="text-fg-tertiary">{copy.common.seed}</dt>
        <dd className="machine text-fg">{row.seed ?? '—'}</dd>
        <dt className="text-fg-tertiary">{copy.common.date}</dt>
        <dd className="machine text-fg">{row.date}</dd>
        <dt className="text-fg-tertiary">{d.scope}</dt>
        <dd className="text-fg-secondary">{copy.scopes[row.scope]}</dd>
        {row.run != null ? (
          <>
            <dt className="text-fg-tertiary">{d.runTime}</dt>
            <dd className="machine text-fg">{fmtSeconds(locale, row.run)}</dd>
          </>
        ) : null}
        {row.stepP50 != null ? (
          <>
            <dt className="text-fg-tertiary">{d.p50}</dt>
            <dd className="machine text-fg">{fmtSeconds(locale, row.stepP50)}</dd>
          </>
        ) : null}
        {row.seqLen != null ? (
          <>
            <dt className="text-fg-tertiary">{d.seq}</dt>
            <dd className="machine text-fg">{row.seqLen.toLocaleString('en-US')}</dd>
          </>
        ) : null}
        <dt className="text-fg-tertiary">{d.notes}</dt>
        <dd className="text-pretty text-fg-secondary">
          {row.experiment === 'today' ? (
            copy.speed.todayNote
          ) : note ? (
            note[locale]
          ) : notesState === 'error' ? (
            copy.common.loadError
          ) : (
            <span role="status" className="text-fg-tertiary">
              {copy.common.loading}
            </span>
          )}
        </dd>
      </dl>
    </div>
  );
}

/** Sortable numeric header: the label and sort arrow on one line, the unit and its explanation below (fits CJK labels). */
function SortHeader({ label, unit, hint, active, dir, onClick, children }: { label: string; unit: string; hint: string; active: boolean; dir: 'asc' | 'desc'; onClick: () => void; children?: ReactNode }) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  return (
    <span className="grid justify-items-end gap-1">
      <button type="button" onClick={onClick} className="pressable -mr-1 inline-flex items-center gap-1 rounded px-1 text-caption font-medium whitespace-nowrap text-fg-tertiary hover:text-fg [&_svg]:size-3 [&_svg]:shrink-0">
        {label}
        <Icon aria-hidden className={active ? 'text-action-fg' : undefined} />
      </button>
      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] leading-none font-normal text-fg-tertiary">
        {unit}
        <Hint content={hint}>
          <span aria-label={hint} className="grid size-4 place-items-center rounded-full border border-line-strong font-sans text-[11px] text-fg-tertiary">
            ?
          </span>
        </Hint>
      </span>
      {children}
    </span>
  );
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void }) {
  const id = useId();
  return (
    <span className="inline-grid gap-1">
      <label htmlFor={id} className="text-caption text-fg-tertiary">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as T)}
        className="h-9 min-w-32 rounded-md border border-line-control/70 bg-sunken px-2.5 text-data text-fg outline-offset-0"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </span>
  );
}

function SpeedTable({ kind, all, retry }: { kind: TableKind; all: RowsState; retry: () => void }) {
  const copy = useBenchCopy();
  const f = copy.speed.filters;
  const [pipeline, setPipeline] = useState<'all' | Pipeline>('all');
  const [precision, setPrecision] = useState<'all' | Precision>('all');
  const [schedule, setSchedule] = useState<'all' | Schedule>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [featuredOnly, setFeaturedOnly] = useState(true);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null);
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const baseId = useId();

  const source = !featuredOnly && all.status === 'ready' ? all.rows : FEATURED_ROWS;
  const notes = useMemo(() => (all.status === 'ready' ? new Map(all.rows.map((row) => [row.id, row.note])) : null), [all]);
  const total = ROW_COUNTS[kind];

  const rows = useMemo(() => {
    const filtered = source.filter(
      (row) =>
        row.table === kind &&
        (pipeline === 'all' || row.pipeline === pipeline) &&
        (precision === 'all' || row.precision === precision) &&
        (schedule === 'all' || row.schedule === schedule) &&
        (status === 'all' || (status === 'ok' ? row.status === 'ok' : row.status !== 'ok')),
    );
    if (!sort) return filtered;
    return [...filtered].sort((a, b) => {
      const va = sortValue(a, sort.key);
      const vb = sortValue(b, sort.key);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      return sort.dir === 'asc' ? va - vb : vb - va;
    });
  }, [source, kind, pipeline, precision, schedule, status, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((current) => (current?.key !== key ? { key, dir: 'asc' } : current.dir === 'asc' ? { key, dir: 'desc' } : null));
  const toggleRow = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const reset = () => {
    setPipeline('all');
    setPrecision('all');
    setSchedule('all');
    setStatus('all');
  };

  const filtersActive = pipeline !== 'all' || precision !== 'all' || schedule !== 'all' || status !== 'all';
  // Narrow screens get one card per row after hydration; the prerendered table (own scroller) serves until then.
  const cards = useMediaQuery('(max-width: 52.49rem)');
  const colCount = 8;
  const ariaSort = (key: SortKey) => (sort?.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none');

  return (
    <div className="grid min-w-0 gap-4">
      <div role="group" aria-label={f.label} className="flex flex-wrap items-end gap-3">
        <Select label={f.pipeline} value={pipeline} onChange={setPipeline} options={[{ value: 'all', label: f.all }, ...PIPELINES[kind].map((p) => ({ value: p, label: `${p} · ${copy.pipelines[p]}` }))]} />
        <Select label={f.precision} value={precision} onChange={setPrecision} options={[{ value: 'all', label: f.all }, ...PRECISIONS[kind].map((p) => ({ value: p, label: p }))]} />
        {kind === 'h3' ? <Select label={f.schedule} value={schedule} onChange={setSchedule} options={[{ value: 'all', label: f.all }, ...SCHEDULES.map((s) => ({ value: s, label: copy.schedules[s] }))]} /> : null}
        <Select
          label={f.status}
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: f.all },
            { value: 'ok', label: f.ok },
            { value: 'failed', label: f.failed },
          ]}
        />
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-line-subtle bg-surface px-3 text-data text-fg-secondary">
          <input type="checkbox" checked={featuredOnly} onChange={(event) => setFeaturedOnly(event.currentTarget.checked)} className="size-4" />
          {f.featured}
        </label>
        {filtersActive ? (
          <button type="button" onClick={reset} className="pressable inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-data text-fg-secondary hover:bg-raised hover:text-fg [&_svg]:size-4">
            <RotateCcw aria-hidden />
            {f.reset}
          </button>
        ) : null}
        <p className="ml-auto text-caption text-fg-tertiary" aria-live="polite">
          {featuredOnly ? f.featuredShowing(rows.length, total) : f.showing(rows.length, total)}
          {featuredOnly ? (
            <>
              {' · '}
              <button type="button" onClick={() => setFeaturedOnly(false)} className="font-medium text-action-fg underline-offset-2 hover:underline">
                {f.allRows(total)}
              </button>
            </>
          ) : null}
        </p>
      </div>

      {!featuredOnly && all.status !== 'ready' ? (
        <p role="status" className="flex items-center gap-2 text-data text-fg-secondary [&_svg]:size-4">
          {all.status === 'error' ? (
            <>
              <CircleX aria-hidden className="text-danger" />
              {copy.common.loadError}
              <button type="button" onClick={retry} className="pressable rounded-md border border-line-strong bg-raised px-2.5 py-1 text-caption text-fg">
                {copy.common.retry}
              </button>
            </>
          ) : (
            <>
              <LoaderCircle aria-hidden className="motion-safe:animate-spin" />
              {copy.common.loading}
            </>
          )}
        </p>
      ) : null}

      {rows.length === 0 ? (
        <div className="panel grid justify-items-start gap-3 p-6">
          <p className="text-data text-fg-secondary">{f.empty}</p>
          <button type="button" onClick={reset} className="pressable rounded-md border border-line-strong bg-raised px-3 py-1.5 text-data text-fg">
            {f.reset}
          </button>
        </div>
      ) : null}

      {/* Desktop and tablet-landscape: a real table in its own horizontal scroller. */}
      {!cards && rows.length > 0 ? (
        <div role="region" aria-label={kind === 'h3' ? copy.speed.title : copy.speed.imageTitle} tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border border-line bg-surface shadow-edge">
          <table className={cn('w-full min-w-[75rem] table-fixed border-collapse text-left text-data')}>
            <caption className="sr-only">{kind === 'h3' ? copy.speed.title : copy.speed.imageTitle}</caption>
            <colgroup>
              <col className="w-[8rem]" />
              <col className={kind === 'h3' ? 'w-[10.5rem]' : 'w-[11rem]'} />
              <col className="w-[11rem]" />
              <col className="w-[10rem]" />
              <col className="w-[7.5rem]" />
              <col className="w-[8.5rem]" />
              <col className="w-[9rem]" />
              <col className="w-[10.5rem]" />
            </colgroup>
            <thead>
              <tr className="bg-sunken/80 text-caption text-fg-tertiary">
                <th scope="col" className="border-b border-line px-3 py-2.5 align-top pl-4 font-medium whitespace-nowrap">
                  {copy.speed.cols.run}
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 align-top font-medium">
                  {copy.speed.cols.pipeline}
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 align-top font-medium whitespace-nowrap">
                  {copy.speed.cols.variant}
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 align-top font-medium whitespace-nowrap">
                  {copy.speed.cols.steps}
                </th>
                <th scope="col" aria-sort={ariaSort('dit')} className="border-b border-line px-3 py-2.5 text-right align-top font-medium">
                  <SortHeader label={copy.speed.cols.dit} unit="s" hint={`${copy.speed.colHints.dit}. ${copy.speed.cols.compute}: ${copy.speed.colHints.compute}`} active={sort?.key === 'dit'} dir={sort?.dir ?? 'asc'} onClick={() => toggleSort('dit')}>
                    <span className="text-[12px] leading-snug font-normal text-fg-tertiary">
                      <span className="whitespace-nowrap">{copy.speed.wall} /</span> <span className="whitespace-nowrap">{copy.speed.cols.compute}</span>
                    </span>
                  </SortHeader>
                </th>
                <th scope="col" aria-sort={ariaSort('total')} className="border-b border-line px-3 py-2.5 text-right align-top font-medium">
                  <SortHeader label={copy.speed.cols.total} unit="s" hint={copy.speed.colHints.total} active={sort?.key === 'total'} dir={sort?.dir ?? 'asc'} onClick={() => toggleSort('total')} />
                </th>
                <th scope="col" aria-sort={ariaSort('vram')} className="border-b border-line px-3 py-2.5 text-right align-top font-medium">
                  <SortHeader label={copy.speed.cols.vram} unit="GiB" hint={copy.speed.colHints.vram} active={sort?.key === 'vram'} dir={sort?.dir ?? 'asc'} onClick={() => toggleSort('vram')}>
                    <span className="grid justify-items-end leading-snug font-normal text-fg-tertiary">
                      <span className="font-mono text-[11px] whitespace-nowrap">
                        {copy.speed.vramParts[0]} / {copy.speed.vramParts[1]}
                      </span>
                      <span className="text-[12px] whitespace-nowrap">{copy.speed.vramParts[2]}</span>
                    </span>
                  </SortHeader>
                </th>
                <th scope="col" className="border-b border-line px-3 py-2.5 align-top pr-4 font-medium whitespace-nowrap">
                  {copy.speed.cols.status}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const expanded = open.has(row.id);
                const detailId = `${baseId}-${row.id}`;
                return (
                  <Fragment key={row.id}>
                    <tr className={cn('align-top hover:bg-raised/50', expanded && 'bg-selection/50 shadow-[inset_3px_0_0_var(--color-action)]')}>
                      <th scope="row" className="border-b border-line-subtle px-3 py-3 pl-4 text-left font-normal">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          aria-controls={detailId}
                          onClick={() => toggleRow(row.id)}
                          className="pressable -ml-1.5 inline-flex items-start gap-1.5 rounded-md px-1.5 py-0.5 text-left hover:bg-raised"
                        >
                          <ChevronDown aria-hidden className={cn('mt-0.5 size-4 shrink-0 text-fg-tertiary transition-transform', expanded && 'rotate-180')} />
                          <span className="grid gap-0.5">
                            <span className="text-data font-medium whitespace-nowrap text-fg">{copy.experimentLabel(row.experiment)}</span>
                            {row.runId ? <span className="machine text-[12px] leading-snug text-fg-secondary">{row.runId}</span> : null}
                            {row.scene || row.tag ? <span className="text-[12px] leading-snug text-fg-tertiary">{[row.scene ? copy.scenes[row.scene] : null, row.tag].filter(Boolean).join(' · ')}</span> : null}
                            <span className="sr-only">{expanded ? copy.speed.hideDetails : copy.speed.details}</span>
                          </span>
                        </button>
                      </th>
                      <td className="border-b border-line-subtle px-3 py-3">
                        <code className="machine rounded bg-sunken px-1.5 py-0.5 text-[12px] text-fg">{row.pipeline}</code>
                        <p className="mt-1.5 text-caption text-pretty text-fg-secondary">{copy.inputs[row.inputs]}</p>
                      </td>
                      <td className="border-b border-line-subtle px-3 py-3">
                        <VariantCell row={row} />
                      </td>
                      <td className="border-b border-line-subtle px-3 py-3">
                        <StepsCell row={row} />
                      </td>
                      <td className="border-b border-line-subtle px-3 py-3 text-right">
                        <DitCell row={row} />
                      </td>
                      <td className="border-b border-line-subtle px-3 py-3 text-right">
                        <TotalCell row={row} />
                      </td>
                      <td className="border-b border-line-subtle px-3 py-3 text-right">
                        <VramCell row={row} />
                      </td>
                      <td className="border-b border-line-subtle px-3 py-3 pr-4">
                        <StatusChip row={row} />
                      </td>
                    </tr>
                    {expanded ? (
                      <tr id={detailId} className="bg-sunken/40">
                        <td colSpan={colCount} className="border-b border-line px-4 py-5">
                          <StepDetail row={row} note={notes?.get(row.id) ?? row.note} notesState={all.status} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Phones and portrait tablets: one card per row. */}
      {cards ? (
        <ul className="grid gap-3">
          {rows.map((row) => {
            const expanded = open.has(row.id);
            const detailId = `${baseId}-m-${row.id}`;
            return (
              <li key={row.id}>
                <article className={cn('panel grid gap-3 p-4', expanded && 'border-action/50')}>
                  <header className="flex items-start justify-between gap-3">
                    <div className="grid min-w-0 gap-0.5">
                      <p className="text-data font-semibold text-fg">{runLabel(copy, row)}</p>
                      <p className="flex flex-wrap items-baseline gap-x-2">
                        <code className="machine text-[12px] text-fg">{row.pipeline}</code>
                        <span className="text-caption text-fg-secondary">{variantName(copy, row)}</span>
                      </p>
                    </div>
                    <StatusChip row={row} />
                  </header>
                  <p className="text-caption text-pretty text-fg-secondary">{copy.inputs[row.inputs]}</p>
                  {row.component ? <code className="machine text-[12px] text-fg-tertiary">{row.component}</code> : null}
                  <StepsCell row={row} />
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-line-subtle pt-3 text-caption">
                    <div className="grid content-start gap-0.5">
                      <dt className="text-fg-tertiary">{copy.speed.cols.dit} (s)</dt>
                      <dd>
                        <DitCell row={row} align="start" />
                      </dd>
                    </div>
                    <div className="grid content-start gap-0.5">
                      <dt className="text-fg-tertiary">{copy.speed.cols.total} (s)</dt>
                      <dd className="justify-self-start [&>span]:justify-items-start">
                        <TotalCell row={row} />
                      </dd>
                    </div>
                    <div className="col-span-2 grid gap-0.5">
                      <dt className="text-fg-tertiary">
                        {copy.speed.cols.vram} (GiB) · <span className="font-mono text-[11px]">{copy.speed.vramParts[0]} / {copy.speed.vramParts[1]}</span>
                      </dt>
                      <dd>
                        <VramCell row={row} align="start" />
                      </dd>
                    </div>
                  </dl>
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={detailId}
                    onClick={() => toggleRow(row.id)}
                    className="pressable inline-flex items-center gap-1.5 justify-self-start rounded-md border border-line-strong bg-raised px-2.5 py-1 text-caption text-fg-secondary [&_svg]:size-3.5"
                  >
                    <ChevronDown aria-hidden className={cn('transition-transform', expanded && 'rotate-180')} />
                    {expanded ? copy.speed.hideDetails : copy.speed.details}
                  </button>
                  {expanded ? (
                    <div id={detailId}>
                      <StepDetail row={row} note={notes?.get(row.id) ?? row.note} notesState={all.status} />
                    </div>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Every failed or canceled run, with the step it failed at and the time it took to fail. */
function Failures() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const failed = [...FEATURED_ROWS, ...FAILED_ROWS].filter((row) => row.status !== 'ok');
  return (
    <div id="failures" className="grid scroll-mt-24 gap-4">
      <SubHead title={copy.speed.failuresTitle} lead={copy.speed.failuresLead} />
      <SimpleTable
        label={copy.speed.failuresTitle}
        columns={[
          { key: 'run', label: copy.speed.failureCols.run },
          { key: 'what', label: copy.speed.failureCols.what },
          { key: 'code', label: copy.speed.failureCols.code },
          { key: 'at', label: copy.speed.failureCols.at },
          { key: 'stopped', label: copy.speed.failureCols.stopped, align: 'end' },
        ]}
        rows={failed.map((row) => {
          const at = failedStep(row);
          const step = at ? row.steps.find((s) => s.kind === at) : undefined;
          return {
            id: row.id,
            cells: {
              run: (
                <span className="grid justify-items-start gap-1">
                  <span className="whitespace-nowrap">{runLabel(copy, row)}</span>
                  <StatusChip row={row} />
                </span>
              ),
              what: (
                <span className="grid gap-0.5">
                  <span className="text-fg">
                    <code className="machine text-[12px]">{row.pipeline}</code> · {variantName(copy, row)}
                  </span>
                  {row.component ? <code className="machine text-[12px] text-fg-tertiary">{row.component}</code> : null}
                  <span className="text-caption">{copy.inputs[row.inputs]}</span>
                </span>
              ),
              code: <code className="machine whitespace-nowrap text-danger">{row.failure?.code ?? '—'}</code>,
              at: at ? (
                <span className="grid justify-items-start gap-1">
                  <span className="whitespace-nowrap">{copy.steps[at]}</span>
                  {step ? <DeviceChip placement={step.placement} reason={step.reason} /> : null}
                </span>
              ) : (
                '—'
              ),
              stopped: row.run != null ? <span className="machine whitespace-nowrap text-fg">{fmtSeconds(locale, row.run)}</span> : <MissingValue kind="notRun" reason={row.totalReason ?? undefined} />,
            },
          };
        })}
      />
    </div>
  );
}

export function SpeedSection() {
  const copy = useBenchCopy();
  const [all, retry] = useAllRows();
  return (
    <Section id="speed-table" eyebrow={copy.speed.eyebrow} title={copy.speed.title} lead={copy.speed.lead} wide>
      <SpeedTable kind="h3" all={all} retry={retry} />
      <p className="-mt-6 max-w-[72ch] text-caption text-pretty text-fg-tertiary">{copy.speed.caption}</p>
      <div className="grid gap-6">
        <SubHead title={copy.speed.imageTitle} lead={copy.speed.imageLead} />
        <SpeedTable kind="image" all={all} retry={retry} />
      </div>
      <Failures />
      <Downloads />
    </Section>
  );
}

const DATA_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/data/benchmarks`;
const DOWNLOADS = [
  { key: 'runs', file: 'phasyn-benchmarks-runs.csv', size: '38 KB' },
  { key: 'steps', file: 'phasyn-benchmarks-steps.csv', size: '49 KB' },
  { key: 'json', file: 'phasyn-benchmarks.json', size: '199 KB' },
] as const;

/** Sanitized exports of every row (built from rows.json; no hostnames or paths). */
function Downloads() {
  const copy = useBenchCopy();
  const d = copy.speed.downloads;
  return (
    <div className="panel grid gap-3 p-5 sm:p-6">
      <h3 className="text-section font-semibold text-fg">{d.label}</h3>
      <ul className="flex flex-wrap gap-2">
        {DOWNLOADS.map((item) => (
          <li key={item.key}>
            <a
              href={`${DATA_BASE}/${item.file}`}
              download={item.file}
              className="pressable inline-flex min-h-9 items-center gap-2 rounded-md border border-line-strong bg-raised px-3 text-data text-fg no-underline hover:border-action/50 [&_svg]:size-4"
            >
              <Download aria-hidden className="text-fg-tertiary" />
              {d[item.key]}
              <span className="machine text-[12px] text-fg-tertiary">{item.size}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-caption text-pretty text-fg-tertiary">{d.note}</p>
    </div>
  );
}

