import './showcase.css';
import { ArrowDown, ArrowRight, Clock, Info } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { DecodeText, HudFrame, NebulaField, RevealText } from '../../components/fx/index.ts';
import { FilmPlayer } from '../../components/media/FilmPlayer.tsx';
import { WorkCard } from '../../components/media/WorkCard.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { WORKS_COPY } from '../../i18n/works.ts';
import { cn } from '../../lib/cn.ts';
import { useSaveData, useWorkSource, type WallEntry } from '../../lib/works.ts';
import { pagePath } from '../../site/config.ts';
import { WORK_CATEGORIES, type Work, type WorkCategory } from '../../site/works.ts';
import { SHOWCASE } from './copy.ts';
import { HERO_WORK, WALL } from './works.ts';

const at = (ms: number): CSSProperties => ({ '--sc-at': `${String(ms)}ms` });

/**
 * Showcase (成品展示): the new single-take works. Hero (title, lead, the featured work as a muted loop) → filterable wall
 * (landscape grid, vertical row; "rendering" cards for slate entries not delivered yet) → honest notes → Tour CTA.
 * Everything is in the prerendered HTML; media attaches only near the viewport.
 */
export function ShowcasePage() {
  return (
    <>
      <Hero />
      <Gallery />
      <Notes />
      <Closing />
    </>
  );
}

function Hero() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].hero;
  return (
    <header className="relative isolate overflow-hidden pt-(--site-header-h)">
      <NebulaField position="absolute" intensity={1.1} particles={140} className="-z-20" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(60%_55%_at_30%_40%,rgb(7_11_20_/_0.72),rgb(7_11_20_/_0.2)_70%,rgb(7_11_20_/_0)),linear-gradient(to_bottom,rgb(7_11_20_/_0)_70%,var(--color-canvas))]"
      />
      <div className="site-container grid gap-10 py-12 md:py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-12 lg:py-20">
        <div className="grid content-start gap-6">
          <p lang="en" aria-hidden className="eyebrow sc-in flex items-center gap-3 text-brand-cyan" style={at(0)}>
            <span className="sc-eyebrow-line w-10" />
            <DecodeText text={copy.eyebrow} afterIntro />
          </p>
          <RevealText
            as="h1"
            text={copy.title}
            on="load"
            delay={180}
            className="text-display tracking-display text-balance-cjk text-fg"
          />
          <p className="sc-in text-on-fx max-w-[34em] text-lead text-fg-secondary" style={at(500)}>
            {copy.lead}
          </p>
          <a
            href="#works"
            className="sc-in pressable flex min-h-10 w-max items-center gap-2 rounded-full px-1 text-caption font-semibold text-fg-secondary no-underline hover:text-fg"
            style={at(700)}
          >
            {copy.jump}
            <ArrowDown aria-hidden className="size-3.5" />
          </a>
        </div>
        <div className="sc-in" style={at(350)}>
          {HERO_WORK ? <HeroPlayer work={HERO_WORK} /> : <HeroPending text={copy.pending} />}
        </div>
      </div>
    </header>
  );
}

/** The featured work: a muted loop while in view (never under reduced motion or Save-Data); the poster otherwise. */
function HeroPlayer({ work }: { work: Work }) {
  const locale = useLocale();
  const src = useWorkSource(work);
  const saveData = useSaveData();
  const portrait = work.orientation === 'portrait';
  return (
    <HudFrame label="FEATURED" orbit innerClassName="bg-stage" className={cn(portrait && 'mx-auto max-w-sm')}>
      <FilmPlayer
        src={src}
        poster={work.media.poster.src}
        posterSet={{ srcSet: work.media.poster.srcSet, sizes: '(min-width: 1024px) 58vw, 100vw' }}
        title={WORKS_COPY[locale].videoLabel(work.title[locale])}
        aspect={portrait ? '736 / 1280' : '1280 / 736'}
        ambient={!saveData}
        badge="h3"
        className="rounded-xl"
      />
    </HudFrame>
  );
}

function HeroPending({ text }: { text: string }) {
  const locale = useLocale();
  return (
    <HudFrame label="RENDERING" innerClassName="bg-stage">
      <div
        className="grid place-items-center rounded-xl bg-[radial-gradient(70%_80%_at_30%_20%,rgb(62_137_255_/_0.18),transparent_70%),radial-gradient(60%_70%_at_80%_90%,rgb(171_123_255_/_0.16),transparent_70%)] p-6"
        style={{ aspectRatio: '1280 / 736' }}
      >
        <div className="material-hud grid max-w-sm justify-items-center gap-2 rounded-2xl px-6 py-5 text-center">
          <Clock className="size-6 text-warning" aria-hidden />
          <p className="text-section font-semibold text-fg">{WORKS_COPY[locale].rendering}</p>
          <p className="text-data text-fg-secondary">{text}</p>
        </div>
      </div>
    </HudFrame>
  );
}

type Filter = 'all' | WorkCategory;

function categoryOf(entry: WallEntry): WorkCategory | null {
  return entry.kind === 'work' ? entry.work.category : entry.entry.category;
}

function orientationOf(entry: WallEntry) {
  return entry.kind === 'work' ? entry.work.orientation : entry.entry.orientation;
}

function keyOf(entry: WallEntry) {
  return entry.kind === 'work' ? `work-${entry.work.slug}` : `slate-${entry.entry.slug}`;
}

function Gallery() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].gallery;
  const labels = WORKS_COPY[locale].category;
  const [filter, setFilter] = useState<Filter>('all');
  const shown = WALL.filter((entry) => filter === 'all' || categoryOf(entry) === filter);
  const landscape = shown.filter((entry) => orientationOf(entry) === 'landscape');
  const portrait = shown.filter((entry) => orientationOf(entry) === 'portrait');
  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: copy.all },
    ...WORK_CATEGORIES.map((id) => ({ id, label: labels[id] })),
  ];

  return (
    <section id="works" aria-labelledby="works-title" className="site-section scroll-mt-(--site-header-h)">
      <div className="site-container grid gap-8 md:gap-10">
        <header className="sc-heading grid gap-5">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="sc-eyebrow-line w-10" />
            <DecodeText text={copy.eyebrow} />
          </p>
          <RevealText
            as="h2"
            id="works-title"
            text={copy.title}
            on="view"
            className="text-display tracking-display text-balance-cjk text-fg"
          />
          <p className="reveal max-w-[52ch] text-lead text-fg-secondary">{copy.lead}</p>
        </header>

        <div role="group" aria-label={copy.filterLabel} className="flex flex-wrap gap-2">
          {filters.map(({ id, label }) => {
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                aria-controls="works-wall"
                onClick={() => {
                  setFilter(id);
                }}
                className={cn(
                  'pressable inline-flex min-h-10 items-center rounded-full border px-4 text-caption font-semibold',
                  active
                    ? 'border-brand-cyan/70 bg-brand-gradient-soft text-fg shadow-glow-sm'
                    : 'border-line bg-raised/60 text-fg-secondary hover:border-action/60 hover:text-fg',
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div id="works-wall" className="grid gap-10">
          {landscape.length ? (
            <ul aria-label={copy.landscape} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {landscape.map((entry) => (
                <li key={keyOf(entry)} className="min-w-0">
                  <WorkCard
                    entry={entry}
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
                    className="h-full"
                  />
                </li>
              ))}
            </ul>
          ) : null}
          {portrait.length ? (
            <div className="grid gap-4">
              <h3 className="text-headline tracking-display text-balance-cjk text-fg">{copy.portrait}</h3>
              <ul aria-label={copy.portrait} className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                {portrait.map((entry) => (
                  <li key={keyOf(entry)} className="min-w-0">
                    <WorkCard
                      entry={entry}
                      sizes="(min-width: 1024px) 23vw, (min-width: 768px) 31vw, 48vw"
                      className="h-full"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {shown.length ? null : <p className="text-body text-fg-secondary">{copy.empty}</p>}
        </div>
      </div>
    </section>
  );
}

function Notes() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].notes;
  const items = [...copy.items, commonCopy(locale).h3License];
  return (
    <section aria-labelledby="notes-title" className="site-container pb-[clamp(3rem,2rem+4vw,6rem)]">
      <div className="grid gap-6 rounded-2xl border border-line bg-surface p-5 shadow-edge md:p-8">
        <h2 id="notes-title" className="flex items-center gap-3 text-section font-semibold text-fg">
          <Info aria-hidden className="size-4 text-brand-cyan" />
          {copy.title}
        </h2>
        <ul className="grid gap-3 md:grid-cols-2 md:gap-x-10">
          {items.map((text) => (
            <li key={text} className="flex gap-3 text-body text-fg-secondary">
              <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-brand-cyan" />
              <span className="[text-wrap:pretty]">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Closing() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].closing;
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden border-t border-line-subtle">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_50%_100%,rgb(62_137_255_/_0.18),transparent_70%),radial-gradient(40%_50%_at_70%_80%,rgb(171_123_255_/_0.12),transparent_70%)]"
      />
      <div className="site-container grid justify-items-center gap-6 py-[clamp(5rem,3rem+7vw,9rem)] text-center">
        <SourceSoon />
        <RevealText
          as="h2"
          id="closing-title"
          text={copy.title}
          on="view"
          className="max-w-[20ch] text-display tracking-display text-balance-cjk text-fg"
        />
        <p className="reveal max-w-[44ch] text-lead text-balance-cjk text-fg-secondary">{copy.lead}</p>
        <ButtonLink to={pagePath(locale, 'tour')} variant="primary" size="lg" className="relative isolate mt-2">
          <span aria-hidden className="fx-orbit" />
          {copy.tour}
          <ArrowRight aria-hidden />
        </ButtonLink>
      </div>
    </section>
  );
}
