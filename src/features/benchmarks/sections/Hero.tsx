import type { ReactNode } from 'react';
import { DecodeText, HudFrame, NebulaField, RevealText } from '../../../components/fx/index.ts';
import { cn } from '../../../lib/cn.ts';
import { useLocale } from '../../../i18n/locale.tsx';
import { useBenchCopy } from '../copy.ts';
import { todayRows, totals } from '../data/select.ts';
import type { DeviceId, SpeedRow, StepKind } from '../data/types.ts';
import { DEVICES } from '../lib/devices.ts';
import { fmtNumber, fmtSeconds } from '../lib/format.ts';
import { DeviceDot } from '../ui/DeviceChip.tsx';

/**
 * One measured range. The final value is in the HTML from the first frame (screenshots never catch a half-counted
 * number); the only motion is the kit's light sweep over an aria-hidden copy, staggered per tile.
 */
function HeroTile({ rows, label, detail, runs, note, hud, devices, index }: { rows: readonly SpeedRow[]; label: string; detail: string; runs: string; note?: string | undefined; hud: string; devices: DeviceId[]; index: number }) {
  const copy = useBenchCopy();
  const locale = useLocale();
  const values = totals(rows).sort((a, b) => a - b);
  const lo = values[0] ?? 0;
  const hi = values[values.length - 1] ?? 0;
  const fmt = (value: number) => fmtNumber(locale, value, 1, 1);
  const range = (dash: ReactNode) => (hi !== lo ? <>{fmt(lo)}{dash}{fmt(hi)}</> : fmt(lo));
  return (
    <li className="min-w-0">
      <HudFrame label={hud} className="h-full" innerClassName="h-full">
        <div className="@container grid h-full content-start gap-3 bg-[rgb(6_10_18_/_0.82)] p-5 backdrop-blur-md sm:p-6">
          <p className="text-data font-medium text-fg-secondary">{label}</p>
          <p className="flex items-baseline gap-x-1.5 whitespace-nowrap text-fg">
            <span className="sr-only">{hi !== lo ? `${fmt(lo)}–${fmt(hi)} s` : `${fmt(lo)} s`}</span>
            {/* Sized to the tile (container units) so a range like 105.0–108.0 s stays on one line in every locale. */}
            <span aria-hidden className="relative text-[clamp(1.5rem,12.5cqi,3.25rem)] leading-none font-semibold whitespace-nowrap tabular-nums tracking-display">
              {range(<span className="px-0.5 text-fg-tertiary">–</span>)}
              <span className="fx-sweep-text absolute inset-0" style={{ ['--fx-sweep-delay' as string]: `${350 + index * 260}ms` }}>
                {range(<span className="px-0.5">–</span>)}
              </span>
            </span>
            <span aria-hidden className="text-headline font-semibold text-fg-secondary">s</span>
          </p>
          <p className="text-data text-fg-secondary">{detail}</p>
          <p className="text-caption text-fg-tertiary">{runs}</p>
          {note ? <p className="border-l-2 border-line-strong pl-2.5 text-caption text-pretty text-fg-tertiary">{note}</p> : null}
          <ul className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1 text-caption text-fg-secondary">
            {devices.map((device) => (
              <li key={device} className="inline-flex items-center gap-1.5">
                <DeviceDot device={device} />
                {copy.machines[device]}
              </li>
            ))}
          </ul>
        </div>
      </HudFrame>
    </li>
  );
}

const STAGES: { key: 'te' | 'encode' | 'dit' | 'decode' | 'mux'; parts: { component: string; device: DeviceId; kind: StepKind }[] }[] = [
  { key: 'te', parts: [{ component: 'te-gb10', device: 'dgx-gb10', kind: 'te' }] },
  {
    key: 'encode',
    parts: [
      { component: 'venc-5080', device: 'pc-rtx5080', kind: 'venc' },
      { component: 'aenc-3060', device: 'pc-rtx3060', kind: 'aenc' },
    ],
  },
  { key: 'dit', parts: [{ component: 'dit5080-ref2va-fp8-pai8', device: 'pc-rtx5080', kind: 'dit' }] },
  {
    key: 'decode',
    parts: [
      { component: 'vae-5080', device: 'pc-rtx5080', kind: 'video' },
      { component: 'audio-3060', device: 'pc-rtx3060', kind: 'audio' },
    ],
  },
  { key: 'mux', parts: [{ component: 'mux', device: 'pc-cpu', kind: 'mux' }] },
];

/** TE → encodes → DiT → decodes → mux, coloured by device, with today's step times from one ref2va run. */
function MachineStrip() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const run = todayRows('ref2va').find((row) => row.scene === 'meadow');
  const seconds = (kind: StepKind) => run?.steps.find((step) => step.kind === kind)?.seconds ?? null;
  return (
    <div className="panel relative grid gap-6 overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <h2 className="text-section font-semibold text-fg">{copy.hero.stripTitle}</h2>
        {run ? (
          <p className="machine text-caption text-fg-tertiary">
            ref2va · run {run.runId} · {copy.common.measuredToday}
          </p>
        ) : null}
      </div>
      <ol className="grid gap-3 lg:grid-cols-5 lg:gap-0">
        {STAGES.map((stage, index) => (
          <li key={stage.key} className="relative grid content-start gap-2 lg:pr-6">
            {index < STAGES.length - 1 ? (
              <span aria-hidden className="absolute top-3 right-0 left-[calc(1.75rem+0.5rem)] hidden h-px overflow-hidden bg-line-strong lg:block">
                <span className="block h-full w-1/2 bg-[linear-gradient(90deg,transparent,var(--color-brand-cyan),transparent)] motion-safe:animate-[fx-pulse-line_2.8s_var(--ease-standard)_infinite] motion-reduce:hidden" style={{ animationDelay: `${index * 0.45}s` }} />
              </span>
            ) : null}
            <span className="relative z-10 grid size-7 place-items-center rounded-full border border-line-strong bg-raised font-mono text-[12px] text-fg-secondary">{index + 1}</span>
            <p className="text-data font-semibold text-fg">{copy.hero.stages[stage.key]}</p>
            <ul className="grid gap-1.5">
              {stage.parts.map((part) => {
                const s = seconds(part.kind);
                return (
                  <li key={part.component} className="flex min-w-0 items-center gap-x-2">
                    <DeviceDot device={part.device} />
                    {/* Long component IDs truncate (full ID on hover) so the time stays on the same line. */}
                    <code className="machine min-w-0 truncate text-[12px] text-fg-secondary" title={part.component}>
                      {part.component}
                    </code>
                    {s != null ? <span className="machine shrink-0 text-[12px] font-semibold text-fg">{fmtSeconds(locale, s)}</span> : null}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
      <ul className="grid gap-x-6 gap-y-2 border-t border-line-subtle pt-4 text-caption sm:grid-cols-2">
        {DEVICES.map((device) => (
          <li key={device} className="flex min-w-0 items-baseline gap-2">
            <DeviceDot device={device} className="translate-y-[-1px]" />
            <span className="font-semibold whitespace-nowrap text-fg">{copy.machines[device]}</span>
            <span className="min-w-0 text-fg-tertiary">{copy.machines.memory[device]}</span>
          </li>
        ))}
      </ul>
      <p className="text-caption text-fg-tertiary">{copy.hero.stripNote}</p>
    </div>
  );
}

export function BenchHero() {
  const copy = useBenchCopy();
  const all: DeviceId[] = ['dgx-gb10', 'pc-rtx5080', 'pc-rtx3060', 'pc-cpu'];
  // Recorded runs (a static page, not a live feed); the HUD tag carries the date, the pipeline IDs stay lowercase below.
  const hud = 'MEASURED · 2026-10-18';
  const tiles = [
    { rows: todayRows('fl2va'), devices: all },
    { rows: todayRows('ref2va'), devices: all },
    { rows: todayRows('t2i'), devices: ['pc-rtx5080', 'pc-cpu'] as DeviceId[] },
  ];
  return (
    <section className="relative isolate overflow-hidden">
      <NebulaField position="absolute" intensity={1.05} particles={170} />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(75%_60%_at_18%_32%,rgb(7_11_20_/_0.78),rgb(7_11_20_/_0.35)_60%,transparent_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-72 bg-[linear-gradient(180deg,transparent,var(--color-canvas)_85%)]" />
      <div className="site-container grid gap-12 pt-[calc(var(--site-header-h)+clamp(3.5rem,8vw,7.5rem))] pb-[clamp(3rem,6vw,5rem)]">
        <div className="grid max-w-[62rem] gap-6">
          <p className="eyebrow text-brand-cyan" lang="en">
            <DecodeText text={copy.hero.eyebrow} afterIntro duration={700} />
          </p>
          {/* `on="load"` waits for the first-visit splash by itself (the kit's --fx-intro-delay). */}
          <RevealText as="h1" on="load" text={copy.hero.title} className="text-hero tracking-display text-balance-cjk text-fg" />
          <p className="max-w-[48rem] text-lead text-pretty text-fg-secondary">{copy.hero.lead}</p>
        </div>
        <ul className={cn('grid gap-6 md:grid-cols-3')}>
          {tiles.map((tile, index) => {
            const text = copy.hero.tiles[index];
            return text ? <HeroTile key={index} index={index} rows={tile.rows} label={text.label} detail={text.detail} runs={text.runs} note={text.note} hud={hud} devices={tile.devices} /> : null;
          })}
        </ul>
      </div>
    </section>
  );
}

/** The per-step device strip, on the solid page background (data never sits on the nebula). */
export function DeviceStrip() {
  return (
    <div className="relative bg-canvas">
      <div className="site-container pb-[clamp(2.5rem,5vw,4rem)]">
        <MachineStrip />
      </div>
    </div>
  );
}
