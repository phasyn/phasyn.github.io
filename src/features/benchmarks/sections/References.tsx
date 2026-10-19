import { ImageOff } from 'lucide-react';
import { useLocale } from '../../../i18n/locale.tsx';
import { Dumbbell } from '../charts/Dumbbell.tsx';
import { Timeline } from '../charts/Timeline.tsx';
import { useBenchCopy } from '../copy.ts';
import { REF448, TIMELINE_RUNS } from '../data/charts.gen.ts';
import type { Ref448Key } from '../data/chartTypes.ts';
import { fmtCount, fmtGiB, fmtSeconds, fmtSec } from '../lib/format.ts';
import { ChartFrame, Legend, SimpleTable } from '../ui/ChartFrame.tsx';
import { TipRow } from '../ui/ChartTooltip.tsx';
import { Section } from '../ui/Section.tsx';

const TIMELINE_KEYS = {
  'today-fl2va-ocean': 'todayFl2va',
  'today-ref2va-meadow': 'todayRef2va',
  '06-ref448-ui': 'ref448',
} as const;

/** Every step of three representative runs on one time axis, coloured by the machine that ran it. */
function Timelines() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const t = copy.references.timelines;
  const runs = TIMELINE_RUNS.map((run) => ({ ...run, label: t.runs[TIMELINE_KEYS[run.id as keyof typeof TIMELINE_KEYS]] }));
  return (
    <ChartFrame
      title={t.title}
      desc={t.desc}
      legend={
        <Legend
          items={[
            { label: copy.machines['dgx-gb10'], swatch: 'bar', color: 'bg-series-2' },
            { label: copy.machines['pc-rtx5080'], swatch: 'bar', color: 'bg-series-1' },
            { label: copy.machines['pc-rtx3060'], swatch: 'bar', color: 'bg-series-3' },
            { label: copy.machines['pc-cpu'], swatch: 'bar', color: 'bg-series-neutral' },
            { label: t.unattributed, swatch: 'hatch' },
          ]}
        />
      }
      table={
        <SimpleTable
          label={t.title}
          columns={[
            { key: 'run', label: copy.speed.cols.run },
            { key: 'steps', label: copy.speed.detail.steps },
            { key: 'total', label: `${copy.speed.cols.total} (s)`, align: 'end', mono: true },
          ]}
          rows={runs.map((run) => ({
            id: run.id,
            cells: {
              run: run.label,
              steps: (
                <span className="grid gap-0.5 text-caption">
                  {run.steps
                    .filter((step) => step.seconds != null)
                    .map((step) => (
                      <span key={step.kind}>
                        {copy.steps[step.kind]} · <span className="machine">{fmtSeconds(locale, step.seconds ?? 0, step.approx)}</span>
                        {step.placement !== 'not-recorded' && step.placement !== 'not-run' ? ` · ${copy.machines[step.placement]}` : ''}
                      </span>
                    ))}
                </span>
              ),
              total: fmtSec(locale, run.total),
            },
          }))}
        />
      }
    >
      <Timeline runs={runs} label={t.title} />
    </ChartFrame>
  );
}

const TIME_KEYS: Ref448Key[] = ['total', 'dit', 'venc', 'te', 'dit-p50'];

/** Reference video preprocessed at 768 vs 448 (R5 conditions): time per step, with the memory change in the caption. */
function Ref448() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const d = copy.references.dumbbell;
  const metric = (key: Ref448Key) => REF448.find((m) => m.key === key);
  const rows = TIME_KEYS.flatMap((key) => {
    const m = metric(key);
    return m ? [m] : [];
  });
  const alloc = metric('alloc');
  const reserved = metric('reserved');
  const seq = metric('seq');
  const note =
    alloc && reserved && seq
      ? d.memNote(`${fmtGiB(locale, alloc.ref768)} / ${fmtGiB(locale, reserved.ref768)}`, `${fmtGiB(locale, alloc.ref448)} / ${fmtGiB(locale, reserved.ref448)}`, fmtCount(locale, seq.ref768), fmtCount(locale, seq.ref448))
      : undefined;
  return (
    <ChartFrame
      title={d.title}
      desc={d.desc}
      note={note}
      legend={
        <Legend
          items={[
            { label: d.ref768, swatch: 'ring', color: 'border-series-1' },
            { label: d.ref448, swatch: 'dot', color: 'bg-series-1' },
          ]}
        />
      }
      table={
        <SimpleTable
          label={d.title}
          columns={[
            { key: 'metric', label: copy.speed.detail.steps },
            { key: 'a', label: `${d.ref768} (s)`, align: 'end', mono: true },
            { key: 'b', label: `${d.ref448} (s)`, align: 'end', mono: true },
          ]}
          rows={rows.map((m) => ({ id: m.key, cells: { metric: d.metrics[m.key], a: fmtSec(locale, m.ref768), b: fmtSec(locale, m.ref448) } }))}
        />
      }
    >
      <Dumbbell
        label={d.title}
        unit="s"
        domain={[0, 650]}
        rows={rows.map((m) => ({
          id: m.key,
          label: d.metrics[m.key],
          a: m.ref448,
          b: m.ref768,
          aText: fmtSec(locale, m.ref448),
          bText: fmtSec(locale, m.ref768),
          emphasis: m.key === 'total',
          ariaLabel: `${d.metrics[m.key]}: ${d.ref768} ${fmtSeconds(locale, m.ref768)}, ${d.ref448} ${fmtSeconds(locale, m.ref448)}`,
          tip: (
            <>
              <TipRow value={fmtSeconds(locale, m.ref768)} label={d.ref768} />
              <TipRow value={fmtSeconds(locale, m.ref448)} label={d.ref448} keyClass="bg-series-1" />
            </>
          ),
        }))}
      />
    </ChartFrame>
  );
}

export function ReferencesSection() {
  const copy = useBenchCopy();
  return (
    <Section id="references" eyebrow={copy.references.eyebrow} title={copy.references.title} lead={copy.references.lead} wide>
      <Timelines />
      <Ref448 />
      <p className="flex max-w-[72ch] items-start gap-2.5 text-data text-pretty text-fg-tertiary [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0">
        <ImageOff aria-hidden />
        {copy.references.noMedia}
      </p>
    </Section>
  );
}
