import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { FilmPlayer } from '../../components/media/FilmPlayer.tsx';
import { cn } from '../../lib/cn.ts';
import { useHydrated } from '../../lib/hooks.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SHOWCASE } from './copy.ts';
import { CATEGORY_ORDER, FILMS, ITEMS, type ShowcaseCategory } from './data.ts';
import { AiBadge, PipelineChip, SectionHeading, useSecondsText } from './parts.tsx';
import { ResultCard } from './ResultCard.tsx';

/** Cards shown before "Show more" (after hydration; the prerendered HTML lists every result). */
const PAGE = 12;

/**
 * Gallery: films first (their own featured row, when there are any), then every result with filters by group and a
 * "Show more" that keeps a ~30-item gallery manageable. Scales by data alone.
 */
export function Gallery() {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const hydrated = useHydrated();
  const [filter, setFilter] = useState<ShowcaseCategory | 'all'>('all');
  const [limit, setLimit] = useState(PAGE);
  const secondsText = useSecondsText();

  const rest = useMemo(() => ITEMS.filter((item) => item.kind !== 'film'), []);
  const groups = CATEGORY_ORDER.filter((category) => category !== 'film' && rest.some((item) => item.category === category));
  const filtered = filter === 'all' ? rest : rest.filter((item) => item.category === filter);
  const visible = hydrated ? filtered.slice(0, limit) : filtered;
  const hidden = filtered.length - visible.length;

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="site-container scroll-mt-[calc(var(--site-header-h)+1rem)] py-[clamp(4rem,2.5rem+6vw,8rem)]">
      <SectionHeading id="gallery-title" eyebrow={copy.gallery.eyebrow} title={copy.gallery.title} lead={copy.gallery.lead} />

      {FILMS.length ? (
        <div className="mt-12 grid gap-5">
          <div className="grid gap-1">
            <h3 className="text-headline tracking-display text-balance-cjk text-fg">{copy.gallery.films}</h3>
            <p className="text-body text-fg-secondary">{copy.gallery.filmsLead}</p>
          </div>
          <ul className="grid gap-6 lg:grid-cols-2">
            {FILMS.map((film, index) => (
              <li key={film.slug} className={cn('grid gap-3', index === 0 && FILMS.length % 2 === 1 && 'lg:col-span-2')}>
                <div className="relative">
                  {film.media.clip ? (
                    <FilmPlayer src={film.media.clip} poster={film.media.image.src} title={film.title[locale]} ambient aspect={`${film.width} / ${film.height}`} />
                  ) : null}
                  <AiBadge className="pointer-events-none absolute top-3 left-3" />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="text-section font-semibold text-fg">{film.title[locale]}</span>
                    <PipelineChip pipeline={film.pipeline} />
                  </p>
                  <p className="machine text-caption text-fg-tertiary">
                    {film.seconds ? `${film.seconds.toFixed(1)} ${copy.card.seconds} · ` : ''}
                    {film.width}×{film.height}
                    {film.endToEndSeconds !== null ? ` · ${copy.card.endToEnd} ${secondsText(film.endToEndSeconds, film.endToEndApprox)}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label={copy.gallery.filterLabel} className="flex flex-wrap gap-2">
          {(['all', ...groups] as const).map((key) => {
            const count = key === 'all' ? rest.length : rest.filter((item) => item.category === key).length;
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setFilter(key);
                  setLimit(PAGE);
                }}
                className={cn(
                  'pressable inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-data font-medium',
                  active ? 'border-brand-cyan/70 bg-brand-gradient-soft text-fg shadow-glow-sm' : 'border-line bg-raised/60 text-fg-secondary hover:border-action/50 hover:text-fg',
                )}
              >
                {key === 'all' ? copy.gallery.all : copy.gallery.category[key]}
                <span className="machine text-[11px] text-fg-tertiary tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
        <p aria-live="polite" className="text-caption text-fg-tertiary">
          {copy.gallery.count(filtered.length)}
        </p>
      </div>
      <p className="mt-3 max-w-[70ch] text-caption text-fg-tertiary">{copy.card.lanesNote}</p>

      {visible.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((item) => (
            <li key={item.slug}>
              <ResultCard item={item} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-xl border border-line-subtle bg-surface p-6 text-body text-fg-secondary">{copy.gallery.empty}</p>
      )}

      {hidden > 0 ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((value) => value + PAGE)}
            className="pressable inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong bg-raised px-6 text-[15px] font-medium text-fg shadow-edge hover:border-action/60"
          >
            {copy.gallery.more(hidden)}
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
