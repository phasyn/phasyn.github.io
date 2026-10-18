import { useState, type ReactNode } from 'react';
import { useLocale } from '../../../i18n/locale.tsx';
import { BarChart, type BarItem } from '../charts/BarChart.tsx';
import { useBenchCopy } from '../copy.ts';
import { DIT_VARIANTS } from '../data/charts.gen.ts';
import type { DitVariant } from '../data/chartTypes.ts';
import { img, video } from '../data/media.ts';
import { variant } from '../data/select.ts';
import { GridPlayer } from '../media/GridPlayer.tsx';
import { WipeCompare } from '../media/WipeCompare.tsx';
import { fmtGiB, fmtSeconds, fmtSec } from '../lib/format.ts';
import { ChartFrame, Legend, SimpleTable } from '../ui/ChartFrame.tsx';
import { TipRow } from '../ui/ChartTooltip.tsx';
import { Section } from '../ui/Section.tsx';
import { Segmented } from '../ui/Segmented.tsx';

type Scenario = DitVariant['scenario'];

const CONTEXT_FILL = 'color-mix(in oklab, var(--color-series-1) 55%, var(--color-surface))';

/*
 * All 40 DiT components, sorted by DiT wall time. One bar per variant: the solid part is the recorder's denoise compute,
 * the pale extension the rest of the DiT step (AdaLN prep, input assembly, release) — both labelled, so the two timing
 * definitions are never mixed up. Production DiTs are bright; failures stay in the list as failures.
 */
function VariantBars() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const b = copy.dit.bars;
  const [scenario, setScenario] = useState<Scenario>('t2va');
  const tags = (v: DitVariant) => {
    const out: string[] = [];
    if (v.exact) out.push(b.tags.exact);
    else if (v.attention === 'sdpa') out.push(b.tags.sdpa);
    if (v.attention === 'subblock') out.push(b.tags.subblock);
    if (v.adaln === 'off') out.push(b.tags.adalnOff);
    if (v.afterUse === 'drop') out.push(b.tags.drop);
    return out;
  };
  const list = DIT_VARIANTS.filter((v) => v.scenario === scenario).sort((x, y) => (x.dit ?? Infinity) - (y.dit ?? Infinity));
  const max = Math.max(...list.map((v) => v.dit ?? 0));
  const items: BarItem[] = list.map((v) => {
    const meta = [`${v.precision} · ${copy.schedules[v.schedule]}`, ...tags(v), ...(v.production ? [copy.common.production] : [])].join(' · ');
    const ok = v.status === 'ok' && v.dit != null;
    return {
      id: v.component,
      label: v.component,
      meta,
      value: ok ? (v.compute ?? v.dit) : null,
      ...(ok && v.dit != null ? { extent: v.dit } : {}),
      emphasis: v.production,
      failed: copy.status.loadFailed,
      valueLabel: ok ? (
        <>
          <span className={v.production ? 'text-fg' : undefined}>{fmtSec(locale, v.dit ?? 0)}</span>
          {v.compute != null ? <span className="font-normal text-fg-tertiary"> · {fmtSec(locale, v.compute)}</span> : null}
        </>
      ) : undefined,
      ariaLabel: ok ? `${v.component}, ${meta}: ${b.wall} ${fmtSeconds(locale, v.dit ?? 0)}, ${b.compute} ${v.compute != null ? fmtSeconds(locale, v.compute) : '—'}` : `${v.component}, ${meta}: ${copy.status.loadFailed}`,
      tip: (
        <>
          {v.dit != null ? <TipRow value={fmtSeconds(locale, v.dit)} label={`${b.wall} · ${copy.machines['pc-rtx5080']}`} /> : null}
          {v.compute != null ? <TipRow value={fmtSeconds(locale, v.compute)} label={b.compute} keyClass="bg-series-1" /> : null}
          {v.reserved != null ? <TipRow value={`${fmtGiB(locale, v.alloc ?? 0)} / ${fmtGiB(locale, v.reserved)} GiB`} label="allocated / reserved" /> : null}
          <span className="machine text-[11px] text-fg-tertiary">{v.runId ? `run ${v.runId}` : copy.status.loadFailed}</span>
        </>
      ),
    };
  });
  return (
    <ChartFrame
      title={b.title}
      desc={b.desc}
      legend={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Legend
            items={[
              { label: `${b.compute} · ${copy.common.production}`, swatch: 'bar', color: 'bg-series-1' },
              { label: b.compute, swatch: 'bar', style: { backgroundColor: CONTEXT_FILL } },
              { label: b.wall, swatch: 'bar', style: { backgroundColor: CONTEXT_FILL, opacity: 0.4 } },
            ]}
          />
          <Segmented label={b.title} value={scenario} onChange={setScenario} options={[{ value: 't2va', label: 't2va' }, { value: 'ref2va', label: 'ref2va' }]} />
        </div>
      }
      note={b.note}
      table={
        <SimpleTable
          label={b.title}
          columns={[
            { key: 'component', label: copy.speed.detail.component, mono: true },
            { key: 'variant', label: copy.speed.cols.variant },
            { key: 'dit', label: `${b.wall} (s)`, align: 'end', mono: true },
            { key: 'compute', label: `${b.compute} (s)`, align: 'end', mono: true },
            { key: 'vram', label: 'allocated / reserved / card (GiB)', align: 'end', mono: true },
          ]}
          rows={list.map((v) => ({
            id: v.component,
            cells: {
              component: v.component,
              variant: [`${v.precision} · ${copy.schedules[v.schedule]}`, ...tags(v)].join(' · '),
              dit: v.dit != null ? fmtSec(locale, v.dit) : copy.status.loadFailed,
              compute: v.compute != null ? fmtSec(locale, v.compute) : '—',
              vram: v.reserved != null ? `${fmtGiB(locale, v.alloc ?? 0)} / ${fmtGiB(locale, v.reserved)} / ${v.card != null ? fmtGiB(locale, v.card) : '—'}` : '—',
            },
          }))}
        />
      }
    >
      <BarChart items={items} max={max} label={`${b.title} · ${scenario}`} format={(value) => fmtSec(locale, value)} unit="s" />
    </ChartFrame>
  );
}

function MediaPanel({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="panel grid min-w-0 gap-5 p-4 sm:p-5 lg:p-6">
      <div className="grid gap-1.5">
        <h3 className="text-section font-semibold text-balance-cjk text-fg">{title}</h3>
        <p className="max-w-[72ch] text-data text-pretty text-fg-secondary">{desc}</p>
      </div>
      {children}
    </section>
  );
}

export function DitSection() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const exp = copy.experiments.items['01'];
  const pai8 = variant('t2va', 'dit-5080');
  const exact = variant('t2va', 'dit5080-fl2va-bf16-base-exact');
  return (
    <Section id="dit" eyebrow={copy.dit.eyebrow} title={copy.dit.title} lead={copy.dit.lead} wide>
      <div className="panel grid gap-3 p-5 sm:p-6">
        <h3 className="text-section font-semibold text-fg">{copy.dit.findings}</h3>
        <ul className="grid gap-3 md:grid-cols-2">
          {exp.findings.map((finding) => (
            <li key={finding} className="flex gap-3 text-data text-pretty text-fg-secondary">
              <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-brand-gradient" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>
      <VariantBars />
      <MediaPanel title={copy.dit.media.title} desc={copy.dit.media.desc}>
        <GridPlayer />
      </MediaPanel>
      <MediaPanel title={copy.dit.wipe.title} desc={copy.dit.wipe.desc}>
        <WipeCompare
          hud="WIPE · T2VA · RTX 5080"
          left={{ video: video('t2va-fp8-pai8.mp4'), poster: img('t2va-fp8-pai8.webp'), label: `${copy.dit.wipe.left}${pai8?.dit != null ? ` · ${fmtSeconds(locale, pai8.dit)}` : ''}` }}
          right={{ video: video('t2va-bf16-original-exact.mp4'), poster: img('t2va-bf16-original-exact.webp'), label: `${copy.dit.wipe.right}${exact?.dit != null ? ` · ${fmtSeconds(locale, exact.dit)}` : ''}` }}
        />
      </MediaPanel>
    </Section>
  );
}
