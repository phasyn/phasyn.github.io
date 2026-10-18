import { ChevronDown, Music2 } from 'lucide-react';
import { useState } from 'react';
import { FilmPlayer } from '../../components/media/FilmPlayer.tsx';
import { cn } from '../../lib/cn.ts';
import { useHydrated } from '../../lib/hooks.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SHOWCASE } from './copy.ts';
import { formatSeconds, shortRun, type ShowcaseItem } from './data.ts';
import { AiBadge, PipelineChip } from './parts.tsx';

/** Films shown before "Show more films" once hydrated (the prerendered HTML lists all of them). */
const FILM_PAGE = 6;

/** "t2i-pc / fl2va-pc" → chips. */
export function PipelineChips({ pipeline, className }: { pipeline: string; className?: string }) {
  return (
    <span className={cn('inline-flex flex-wrap gap-1.5', className)}>
      {pipeline
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => (
          <PipelineChip key={part} pipeline={part} />
        ))}
    </span>
  );
}

/** "1.75" for a display factor (two decimals at most, no trailing zeros). */
export function scaleText(scale: number): string {
  return String(Math.round(scale * 100) / 100);
}

/** Disclosure for launch cuts: native clips enlarged on a blurred backdrop (resampling only). */
export function ScaleNote({ item, className }: { item: ShowcaseItem; className?: string }) {
  const copy = SHOWCASE[useLocale()].gallery;
  if (item.media.displayScale === undefined) return null;
  return <p className={cn('text-[12px] text-fg-tertiary', className)}>{copy.scaled(scaleText(item.media.displayScale))}</p>;
}

export function MusicChip({ className }: { className?: string }) {
  const copy = SHOWCASE[useLocale()].gallery;
  return (
    <span className={cn('inline-flex min-h-6 items-center gap-1.5 rounded-full border border-line-strong bg-raised px-2.5 text-caption text-fg-secondary', className)}>
      <Music2 aria-hidden className="size-3" />
      <span lang="en">{copy.music}</span>
    </span>
  );
}

/**
 * The cut as an edit strip: one segment per generated shot, widths to scale (decorative; the shot list carries the same
 * facts as text).
 */
export function ShotStrip({ item, className }: { item: ShowcaseItem; className?: string }) {
  const total = item.shots.reduce((sum, shot) => sum + (shot.seconds ?? 0), 0) || item.seconds || 1;
  if (!item.shots.length) return null;
  return (
    <span aria-hidden className={cn('flex h-2 gap-0.5 overflow-hidden rounded-full', className)}>
      {item.shots.map((shot, index) => (
        <span
          key={`${shot.runId}-${index}`}
          className="h-full rounded-full bg-brand-gradient"
          style={{ width: `${((shot.seconds ?? total / item.shots.length) / total) * 100}%`, backgroundSize: `${item.shots.length * 100}% 100%`, backgroundPosition: `${(index / Math.max(1, item.shots.length - 1)) * 100}% 0` }}
        />
      ))}
    </span>
  );
}

/** Shot list (run, seed, length per shot), collapsed by default; works without JavaScript. */
export function ShotList({ item, className }: { item: ShowcaseItem; className?: string }) {
  const copy = SHOWCASE[useLocale()].gallery;
  if (!item.shots.length) return null;
  return (
    <details className={cn('group/shots rounded-lg border border-line-subtle bg-sunken/60', className)}>
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 text-caption font-semibold text-fg-secondary hover:text-fg [&::-webkit-details-marker]:hidden">
        {copy.shotList}
        <span aria-hidden className="text-fg-tertiary transition-transform group-open/shots:rotate-45">
          +
        </span>
      </summary>
      <table className="w-full border-t border-line-subtle text-left text-[12px]">
        <thead className="text-fg-tertiary">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">{copy.shotHeaders.shot}</th>
            <th scope="col" className="px-3 py-2 font-medium">{copy.shotHeaders.run}</th>
            <th scope="col" className="px-3 py-2 font-medium">{copy.shotHeaders.seed}</th>
            <th scope="col" className="px-3 py-2 text-right font-medium">{copy.shotHeaders.length}</th>
          </tr>
        </thead>
        <tbody className="machine text-fg-secondary tabular-nums">
          {item.shots.map((shot, index) => (
            <tr key={`${shot.runId}-${index}`} className="border-t border-line-subtle">
              <td className="px-3 py-1.5">{index + 1}</td>
              <td className="px-3 py-1.5" lang="en">{shortRun(shot.runId)}</td>
              <td className="px-3 py-1.5">{shot.seed ?? '–'}</td>
              <td className="px-3 py-1.5 text-right">{shot.seconds !== null ? `${shot.seconds.toFixed(2)} s` : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

/** One edited piece: muted preview while on screen, play for sound; kind, length, shots, pipelines, music credit. */
export function FilmCard({ item, className }: { item: ShowcaseItem; className?: string }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const title = item.title[locale];
  return (
    <article id={`film-${item.slug}`} aria-label={title} className={cn('grid content-start gap-3 scroll-mt-[calc(var(--site-header-h)+1rem)]', className)}>
      <div className="relative">
        {item.media.clip ? (
          <FilmPlayer src={item.media.clip} poster={item.media.image.src} title={title} ambient aspect={`${item.width} / ${item.height}`} {...(item.media.captions ? { captions: item.media.captions } : {})} />
        ) : null}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          <AiBadge />
          <span className="inline-flex min-h-6 items-center rounded-full border border-[rgb(255_255_255_/_0.14)] bg-[rgb(7_11_20_/_0.72)] px-2.5 text-caption font-medium text-fg-secondary backdrop-blur-sm">
            {copy.card.kind[item.kind]}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h4 className="text-section font-semibold text-balance-cjk text-fg">{title}</h4>
        <p className="machine text-caption text-fg-secondary tabular-nums">
          {item.seconds !== null ? `${formatSeconds(item.seconds)} ${copy.card.seconds}` : ''}
          {item.shots.length ? ` · ${copy.gallery.shots(item.shots.length)}` : ''}
        </p>
      </div>
      <ShotStrip item={item} />
      <div className="flex flex-wrap items-center gap-2">
        <PipelineChips pipeline={item.pipeline} />
        <span lang="en" className="machine text-[11px] text-fg-tertiary">
          {item.width}×{item.height}
          {item.fps ? ` · ${item.fps} fps` : ''}
        </span>
        {item.music ? <MusicChip className="ml-auto" /> : null}
      </div>
      <ScaleNote item={item} />
      <ShotList item={item} />
    </article>
  );
}

/** The films row (films, trailers, making-of): two-up on wide screens, "Show more" past six once hydrated. */
export function FilmsRow({ items }: { items: readonly ShowcaseItem[] }) {
  const copy = SHOWCASE[useLocale()].gallery;
  const hydrated = useHydrated();
  const [limit, setLimit] = useState(FILM_PAGE);
  if (!items.length) return null;
  const visible = hydrated ? items.slice(0, limit) : items;
  const hidden = items.length - visible.length;
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h3 className="text-headline tracking-display text-balance-cjk text-fg">{copy.films}</h3>
        <p className="max-w-[60ch] text-body text-fg-secondary">{copy.filmsLead}</p>
      </div>
      <ul className="grid gap-x-6 gap-y-10 md:grid-cols-2">
        {visible.map((item) => (
          <li key={item.slug}>
            <FilmCard item={item} />
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((value) => value + FILM_PAGE)}
            className="pressable inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong bg-raised px-6 text-[15px] font-medium text-fg shadow-edge hover:border-action/60"
          >
            {copy.moreFilms(hidden)}
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Vertical 9:16 cuts in a narrow row (scrolls sideways on phones). */
export function SocialRow({ items }: { items: readonly ShowcaseItem[] }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  if (!items.length) return null;
  return (
    <div className="grid gap-6">
      <div className="grid gap-1">
        <h3 className="text-headline tracking-display text-balance-cjk text-fg">{copy.gallery.social}</h3>
        <p className="text-body text-fg-secondary">{copy.gallery.socialLead}</p>
      </div>
      <ul className="-mx-(--site-gutter) flex snap-x snap-mandatory gap-4 overflow-x-auto px-(--site-gutter) pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-4 xl:grid-cols-5">
        {items.map((item) => (
          <li key={item.slug} className="w-[min(15rem,70vw)] shrink-0 snap-start sm:w-auto">
            <article aria-label={item.title[locale]} className="grid gap-2">
              <div className="relative">
                {item.media.clip ? (
                  <FilmPlayer src={item.media.clip} poster={item.media.image.src} title={item.title[locale]} ambient aspect={`${item.width} / ${item.height}`} {...(item.media.captions ? { captions: item.media.captions } : {})} />
                ) : null}
                <AiBadge className="pointer-events-none absolute top-3 left-3" />
              </div>
              <p className="text-body font-semibold text-balance-cjk text-fg">{item.title[locale]}</p>
              <p className="machine text-caption text-fg-tertiary">
                {item.seconds !== null ? `${formatSeconds(item.seconds)} ${copy.card.seconds} · ` : ''}
                {item.width}×{item.height}
              </p>
              {item.music ? <MusicChip className="justify-self-start" /> : null}
              <ScaleNote item={item} />
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The making-of, shown with the breakdown it illustrates: a large player with the producer's captions and its shot list. */
export function MakingOf({ item, className }: { item: ShowcaseItem; className?: string }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const title = item.title[locale];
  return (
    <article aria-labelledby={`making-of-${item.slug}`} className={cn('grid gap-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-8', className)}>
      <div className="relative">
        {item.media.clip ? (
          <FilmPlayer src={item.media.clip} poster={item.media.image.src} title={title} ambient aspect={`${item.width} / ${item.height}`} {...(item.media.captions ? { captions: item.media.captions } : {})} />
        ) : null}
        <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
          <AiBadge />
          <span className="inline-flex min-h-6 items-center rounded-full border border-[rgb(255_255_255_/_0.14)] bg-[rgb(7_11_20_/_0.72)] px-2.5 text-caption font-medium text-fg-secondary backdrop-blur-sm">
            {copy.card.kind[item.kind]}
          </span>
        </div>
      </div>
      <div className="grid content-start gap-3">
        <h3 id={`making-of-${item.slug}`} className="text-headline tracking-display text-balance-cjk text-fg">
          {copy.gallery.makingOf}
        </h3>
        <p className="text-body text-fg-secondary">{copy.gallery.makingOfLead}</p>
        <p className="machine text-caption text-fg-secondary tabular-nums">
          {item.seconds !== null ? `${formatSeconds(item.seconds)} ${copy.card.seconds}` : ''}
          {item.shots.length ? ` · ${copy.gallery.shots(item.shots.length)}` : ''}
        </p>
        <ShotStrip item={item} />
        <div className="flex flex-wrap items-center gap-2">
          <PipelineChips pipeline={item.pipeline} />
          {item.music ? <MusicChip /> : null}
        </div>
        <ScaleNote item={item} />
        <ShotList item={item} />
      </div>
    </article>
  );
}
