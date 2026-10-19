import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/cn.ts';
import { useHydrated } from '../../lib/hooks.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SHOWCASE } from './copy.ts';
import { FILMS, GROUPS, SOCIAL, VERTICALS, type ShowcaseItem } from './data.ts';
import { FilmsRow, SocialRow } from './Films.tsx';
import { SectionHeading } from './parts.tsx';
import { ResultCard } from './ResultCard.tsx';

/** Cards per group before "Show all" once hydrated (the prerendered HTML lists every result). */
const GROUP_PAGE = 6;

type GroupId = keyof typeof GROUPS;
const GROUP_ORDER: readonly GroupId[] = ['multishot', 'video', 'image'];

/**
 * Gallery, curated rather than a dump: films first (the owner's #1 asset), then everything vertical (cuts and native 9:16
 * generations), then the single generations grouped by kind — each group strongest first, the rest behind "Show all".
 * Media loads only on play; posters are lazy.
 */
export function Gallery() {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const groups = GROUP_ORDER.filter((id) => GROUPS[id].length);

  return (
    <section id="gallery" aria-labelledby="gallery-title" className="site-container scroll-mt-[calc(var(--site-header-h)+1rem)] py-[clamp(4rem,2.5rem+6vw,8rem)]">
      <SectionHeading id="gallery-title" eyebrow={copy.gallery.eyebrow} title={copy.gallery.title} lead={copy.gallery.lead} />

      {FILMS.length ? (
        <div className="mt-12">
          <FilmsRow items={FILMS} />
        </div>
      ) : null}

      {SOCIAL.length || VERTICALS.length ? (
        <div className="mt-16 grid gap-10">
          {SOCIAL.length ? <SocialRow items={SOCIAL} /> : null}
          {VERTICALS.length ? (
            <ResultGroup id="vertical" title={copy.gallery.verticalSingles.title} lead={copy.gallery.verticalSingles.lead} items={VERTICALS} columns="lg:grid-cols-2" />
          ) : null}
        </div>
      ) : null}

      <div className="mt-16 grid gap-4">
        <h3 className="text-headline tracking-display text-balance-cjk text-fg">{copy.gallery.singles}</h3>
        <p className="max-w-[70ch] text-body text-fg-secondary">{copy.gallery.singlesLead}</p>
        <nav aria-label={copy.gallery.singles} className="flex flex-wrap gap-2">
          {groups.map((id) => (
            <a key={id} href={`#group-${id}`} className="pressable inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-raised/60 px-4 text-data font-medium text-fg-secondary no-underline hover:border-action/50 hover:text-fg">
              {copy.gallery.groups[id].title}
              <span className="machine text-[11px] text-fg-tertiary tabular-nums">{GROUPS[id].length}</span>
            </a>
          ))}
        </nav>
        <p className="max-w-[70ch] text-caption text-fg-tertiary">{copy.card.lanesNote}</p>
      </div>

      {groups.map((id) => (
        <ResultGroup key={id} id={id} title={copy.gallery.groups[id].title} lead={copy.gallery.groups[id].lead} items={GROUPS[id]} columns={id === 'multishot' ? 'lg:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3'} className="mt-14" />
      ))}
    </section>
  );
}

/** One group of single results: heading, the strongest few, the rest behind "Show all" (all in the prerendered HTML). */
export function ResultGroup({ id, title, lead, items, columns, className }: { id: string; title: string; lead: string; items: readonly ShowcaseItem[]; columns: string; className?: string }) {
  const copy = SHOWCASE[useLocale()].gallery;
  const hydrated = useHydrated();
  const [open, setOpen] = useState(false);
  const visible = hydrated && !open ? items.slice(0, GROUP_PAGE) : items;
  const hidden = items.length - visible.length;
  return (
    <section id={`group-${id}`} aria-labelledby={`group-${id}-title`} className={cn('grid scroll-mt-[calc(var(--site-header-h)+1rem)] gap-6', className)}>
      <div className="grid gap-1">
        <h4 id={`group-${id}-title`} className="text-section font-semibold text-balance-cjk text-fg md:text-[1.375rem]">
          {title}
        </h4>
        <p className="max-w-[70ch] text-body text-fg-secondary">{lead}</p>
      </div>
      <ul className={cn('grid gap-5', columns)}>
        {visible.map((item) => (
          <li key={item.slug}>
            <ResultCard item={item} />
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="pressable inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong bg-raised px-6 text-[15px] font-medium text-fg shadow-edge hover:border-action/60"
          >
            {copy.showAll(hidden)}
            <ChevronDown aria-hidden className="size-4" />
          </button>
        </div>
      ) : null}
    </section>
  );
}
