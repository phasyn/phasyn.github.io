import { ArrowRight } from 'lucide-react';
import { DataTicker, SpotlightCard, type TickerItem } from '../../../components/fx/index.ts';
import { useLocale } from '../../../i18n/locale.tsx';
import { useBenchCopy } from '../copy.ts';
import { REF448, TAKEAWAY_FACTS } from '../data/charts.gen.ts';
import { ROW_COUNTS } from '../data/rows.gen.ts';
import { maxCardGiB, originalOverPai8, todayRows } from '../data/select.ts';
import type { StepKind } from '../data/types.ts';
import { TICKER_DEVICE, isDevice } from '../lib/devices.ts';
import { fmtCount, fmtGiB, fmtNumber, fmtSeconds, fmtSec } from '../lib/format.ts';
import { Section } from '../ui/Section.tsx';

/** HUD ticker of real step times from two of today's runs (and one still), each with its machine's dot. */
export function StepTicker() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const fl = todayRows('fl2va').find((row) => row.scene === 'ocean');
  const rf = todayRows('ref2va').find((row) => row.scene === 'meadow');
  const still = todayRows('t2i').find((row) => row.scene === 'ocean');
  const pick = (labels: Partial<Record<StepKind, string>>, row: typeof fl) =>
    (row?.steps ?? []).flatMap((step): TickerItem[] => {
      const label = labels[step.kind];
      if (!label || step.seconds == null || !isDevice(step.placement)) return [];
      return [{ label: `${row?.pipeline ?? ''} · ${label} · ${step.component ?? ''}`, value: fmtSeconds(locale, step.seconds, step.approx), device: TICKER_DEVICE[step.placement] }];
    });
  const t = copy.ticker.items;
  const items = [
    ...pick({ te: t.te, 'venc-ff': t.venc, dit: t.dit, video: t.video, audio: t.audio, mux: t.mux }, fl),
    ...pick({ te: t.teRef, dit: t.ditRef }, rf),
    ...pick({ dit: t.image }, still),
  ];
  return <DataTicker label={copy.ticker.label} items={items} duration={56} />;
}

const JUMP = [
  ['speed', '#speed-table'],
  ['today', '#today'],
  ['dit', '#dit'],
  ['references', '#references'],
  ['method', '#method'],
  ['experiments', '#experiments'],
] as const;

export function JumpNav() {
  const copy = useBenchCopy();
  return (
    // Narrow screens: a sticky chip strip under the site header (as on the Tour page), so the long page stays navigable.
    <nav aria-label={copy.jump.label} className="relative isolate max-lg:sticky max-lg:top-(--site-header-h) max-lg:z-30">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-canvas max-lg:border-b max-lg:border-line-subtle max-lg:bg-[rgb(7_11_20_/_0.88)] max-lg:backdrop-blur-xl supports-[not(backdrop-filter:blur(1px))]:max-lg:bg-[rgb(7_11_20_/_0.97)]"
      />
      <ul className="site-container flex gap-2 py-6 max-lg:overflow-x-auto max-lg:py-2.5 max-lg:[scrollbar-width:none] lg:flex-wrap [&::-webkit-scrollbar]:hidden">
        {JUMP.map(([key, href]) => (
          <li key={key} className="shrink-0">
            <a
              href={href}
              className="pressable inline-flex min-h-9 items-center rounded-full border border-line-subtle bg-surface px-3.5 text-caption text-fg-secondary no-underline hover:border-action/50 hover:bg-raised hover:text-fg"
            >
              {copy.jump.items[key]}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function Takeaways() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const [lo, hi] = originalOverPai8();
  const total = REF448.find((m) => m.key === 'total');
  const stats = [
    `${fmtNumber(locale, lo, 1, 1)}–${fmtNumber(locale, hi, 1, 1)}×`,
    total ? `${fmtSec(locale, total.ref768)} → ${fmtSeconds(locale, total.ref448)}` : '',
    `${fmtGiB(locale, maxCardGiB())} / 15.92 GiB`,
    `${fmtNumber(locale, TAKEAWAY_FACTS.vencRatio, 1, 1)}×`,
    `${TAKEAWAY_FACTS.turbo4Leaked} / ${TAKEAWAY_FACTS.turbo4Seeds}`,
    fmtCount(locale, ROW_COUNTS.failed),
  ];
  return (
    <Section id="takeaways" eyebrow={copy.takeaways.eyebrow} title={copy.takeaways.title} lead={copy.takeaways.lead}>
      <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {copy.takeaways.cards.map((card, index) => (
          <li key={card.title} className="min-w-0">
            <SpotlightCard className="@container grid h-full content-start gap-4 p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span aria-hidden className="font-mono text-caption text-fg-tertiary">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span aria-hidden className="h-px flex-1 translate-y-2 bg-line" />
              </div>
              <div className="grid gap-1">
                {/* Sized to the card (container units) so "600.5 → 297.2 s" or "15.91 / 15.92 GiB" stays on one line. */}
                <p className="text-[clamp(1.5rem,9cqi,2.5rem)] leading-tight font-semibold whitespace-nowrap tabular-nums tracking-display text-fg">{stats[index]}</p>
                <p className="text-caption text-fg-tertiary">{card.statLabel}</p>
              </div>
              <h3 className="text-section font-semibold text-balance-cjk text-fg">{card.title}</h3>
              <p className="text-data text-pretty text-fg-secondary">{card.body}</p>
              <a href={card.anchor} className="mt-auto inline-flex items-center gap-1.5 text-data font-medium no-underline hover:underline [&_svg]:size-4">
                {copy.common.seeData}
                <ArrowRight aria-hidden />
              </a>
            </SpotlightCard>
          </li>
        ))}
      </ol>
    </Section>
  );
}
