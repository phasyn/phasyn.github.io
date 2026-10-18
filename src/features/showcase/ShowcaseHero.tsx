import { ArrowDown } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { CountUp, DecodeText, HudFrame, NebulaField, RevealText } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { ClipPlayer } from './ClipPlayer.tsx';
import { SHOWCASE } from './copy.ts';
import { FEATURED, ITEMS, isEdit, machinesOf, shortRun, totals, type ShowcaseItem } from './data.ts';
import { MusicChip, PipelineChips, ShotStrip } from './Films.tsx';
import { MachineDot, MachineName, MediaBadge, StepLanes, useSecondsText } from './parts.tsx';

const at = (ms: number) => ({ '--sc-at': `${ms}ms` }) as CSSProperties;

/** HUD label for the theatre frame: real run id and pipeline, or the cut's shot count (decorative; facts repeat below). */
function hudLabel(item: ShowcaseItem): string {
  if (isEdit(item)) return `${item.kind.replace('-', ' ').toUpperCase()} · ${item.shots.length} SHOTS`;
  return `RUN ${shortRun(item.runId)} · ${item.pipeline}`;
}

/**
 * Hero: the claim, totals computed from the items (CountUp), and a theatre of the hero-graded results (films first): a
 * large muted loop in a HUD frame with its run facts, and a rail to switch. Nothing auto-advances.
 */
export function ShowcaseHero() {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const sum = totals(ITEMS);
  const featured = FEATURED.length ? FEATURED : ITEMS.slice(0, 4);
  const [index, setIndex] = useState(0);
  const current = featured[Math.min(index, featured.length - 1)];
  const secondsText = useSecondsText();
  const minutes = sum.renderSeconds / 60;

  return (
    <header className="relative isolate overflow-hidden pt-(--site-header-h)">
      <NebulaField position="absolute" intensity={1.15} particles={160} className="-z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_30%_40%,rgb(7_11_20_/_0.72),rgb(7_11_20_/_0.2)_70%,rgb(7_11_20_/_0)),linear-gradient(to_bottom,rgb(7_11_20_/_0)_70%,var(--color-canvas))]" />

      <div className="site-container grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:py-20">
        <div className="grid content-start gap-6">
          <p lang="en" className="eyebrow sc-in flex items-center gap-3 text-brand-cyan" style={at(0)}>
            <span className="sc-eyebrow-line w-10" />
            <DecodeText text={sum.films ? `SHOWCASE · ${sum.films} FILMS · ${sum.results} RESULTS` : `SHOWCASE · ${sum.results} RESULTS · ${sum.gpus} GPUS`} afterIntro />
          </p>
          <h1
            aria-label={copy.hero.title.join(locale === 'en' ? ' ' : '')}
            // CJK glyphs are a full em wide: a smaller size keeps each ten-character line inside the hero column.
            className={cn('text-display tracking-display text-balance-cjk text-fg', locale === 'en' ? 'lg:text-[clamp(2.5rem,0.9rem+2.9vw,3.875rem)]' : 'lg:text-[clamp(2.25rem,0.6rem+2.6vw,3.25rem)]')}
          >
            {copy.hero.title.map((line, i) => (
              <RevealText key={line} text={line} on="load" delay={180 + i * 260} className="block" />
            ))}
          </h1>
          <p className="sc-in max-w-[40em] text-lead text-fg-secondary" style={at(650)}>
            {copy.hero.lead}
          </p>

          <HudFrame label="MEASURED · CONTROLLER" className="sc-in mt-2" innerClassName="bg-[rgb(7_11_20_/_0.62)] backdrop-blur-md">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line-subtle" style={at(820)}>
              {sum.films ? (
                <Stat label={copy.hero.stats.films((sum.filmSeconds / 60).toFixed(1))}>
                  <CountUp value={sum.films} />
                </Stat>
              ) : null}
              <Stat label={copy.hero.stats.results}>
                <CountUp value={sum.results} />
              </Stat>
              {sum.films ? null : (
                <Stat label={copy.hero.stats.video}>
                  <CountUp value={sum.videoSeconds} decimals={1} />
                </Stat>
              )}
              <Stat label={copy.hero.stats.render}>
                {sum.renderApprox ? <span aria-hidden>≈</span> : null}
                <CountUp value={minutes} decimals={1} />
                <span className="ml-1 text-section font-semibold text-fg-secondary">{copy.hero.minutes}</span>
              </Stat>
              <Stat label={copy.hero.stats.gpus(sum.hosts)}>
                <CountUp value={sum.gpus} />
              </Stat>
            </dl>
          </HudFrame>
        </div>

        {current ? (
          <div className="sc-in grid gap-4" style={at(400)}>
            <HudFrame label={hudLabel(current)} orbit innerClassName="bg-stage">
              <div key={current.slug} className="sc-swap" id="sc-theatre">
                <ClipPlayer item={current} sizes="(min-width: 1024px) 58vw, 100vw" variant="full" priority className="rounded-xl" />
                <MediaBadge item={current} />
              </div>
            </HudFrame>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div className="grid gap-1.5">
                <p className="flex flex-wrap items-center gap-2">
                  <span className="text-section font-semibold text-balance-cjk text-fg">{current.title[locale]}</span>
                  {isEdit(current) ? (
                    <span className="inline-flex min-h-6 items-center rounded-full border border-line-strong bg-raised px-2.5 text-caption text-fg-secondary">{copy.card.kind[current.kind]}</span>
                  ) : null}
                  <PipelineChips pipeline={current.pipeline} />
                </p>
                {isEdit(current) ? (
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-tertiary">
                    <span className="machine">{copy.gallery.shots(current.shots.length)}</span>
                    <span lang="en" className="machine">
                      {current.width}×{current.height}
                    </span>
                    {current.music ? <MusicChip /> : null}
                  </p>
                ) : (
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-tertiary">
                    {machinesOf(current).map((machine) => (
                      <span key={machine} className="inline-flex items-center gap-1.5">
                        <MachineDot machine={machine} />
                        <MachineName machine={machine} />
                      </span>
                    ))}
                  </p>
                )}
              </div>
              <p className="machine text-data text-fg sm:text-right">
                {isEdit(current) ? (
                  secondsText(current.seconds)
                ) : (
                  <>
                    <span className="text-fg-tertiary">{copy.card.endToEnd} </span>
                    {secondsText(current.endToEndSeconds, current.endToEndApprox)}
                  </>
                )}
              </p>
            </div>
            {isEdit(current) ? (
              <div className="rounded-xl border border-line-subtle bg-[rgb(7_11_20_/_0.6)] p-3">
                <ShotStrip item={current} />
              </div>
            ) : (
              <StepLanes item={current} dense className="rounded-xl border border-line-subtle bg-[rgb(7_11_20_/_0.6)] p-3" />
            )}

            <div className="grid gap-2">
              <p className="text-caption font-semibold text-fg-tertiary">{copy.hero.featured}</p>
              <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [mask-image:linear-gradient(90deg,#000_88%,transparent)] [scrollbar-width:thin]">
                {featured.map((item, i) => {
                  const active = item.slug === current.slug;
                  return (
                    <li key={item.slug} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setIndex(i)}
                        aria-pressed={active}
                        aria-controls="sc-theatre"
                        aria-label={copy.player.show(item.title[locale])}
                        className={cn(
                          'pressable relative block w-24 overflow-hidden rounded-lg border bg-stage sm:w-28',
                          active ? 'border-brand-cyan/80 shadow-glow-sm' : 'border-line hover:border-action/60',
                        )}
                      >
                        <img src={item.media.image.src} srcSet={item.media.image.srcSet} sizes="112px" width={item.media.image.width} height={item.media.image.height} alt="" loading="lazy" decoding="async" className={cn('aspect-[12/7] w-full object-cover transition-opacity', active ? 'opacity-100' : 'opacity-70')} />
                        {active ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-gradient" /> : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <a href="#gallery" className="sc-in pressable mx-auto mb-6 flex min-h-10 w-max items-center gap-2 rounded-full px-4 text-caption text-fg-tertiary no-underline hover:bg-raised/60 hover:text-fg" style={at(1100)}>
        {copy.hero.jump}
        <ArrowDown aria-hidden className="size-3.5" />
      </a>
    </header>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid content-start gap-1 bg-[rgb(7_11_20_/_0.78)] px-4 py-4 md:px-5">
      <dt className="order-2 text-caption text-balance-cjk text-fg-secondary">{label}</dt>
      <dd className="order-1 text-[clamp(1.75rem,1.3rem+1.4vw,2.5rem)] leading-none font-semibold text-fg tabular-nums">{children}</dd>
    </div>
  );
}
