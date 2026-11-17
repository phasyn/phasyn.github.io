import { Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';
import { formatLength, useWorkSource, type WallEntry } from '../../lib/works.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { WORKS_COPY } from '../../i18n/works.ts';
import type { Work, WorkOrientation } from '../../site/works.ts';
import { FilmPlayer } from './FilmPlayer.tsx';

const ASPECT: Record<WorkOrientation, string> = { landscape: '1280 / 736', portrait: '736 / 1280' };

interface WorkCardProps {
  entry: WallEntry;
  /** `sizes` for the poster's srcSet. */
  sizes: string;
  /** Home's compact card: no feature chips. */
  compact?: boolean;
  className?: string;
}

/**
 * One showcase work: the poster until someone presses play (Enter or Space on the play button), then the video with sound
 * in the shared FilmPlayer (one plays at a time; media attached only near the viewport; H.264, playsInline). Under it the
 * title, category, length and feature chips. A slate entry that has not been delivered yet renders as a "rendering" card
 * that requests no media.
 */
export function WorkCard({ entry, sizes, compact = false, className }: WorkCardProps) {
  return entry.kind === 'work' ? (
    <RealCard work={entry.work} sizes={sizes} compact={compact} className={className} />
  ) : (
    <SlateCard entry={entry} className={className} />
  );
}

function CardShell({ className, children }: { className?: string | undefined; children: ReactNode }) {
  return (
    <figure
      className={cn(
        'grid min-w-0 content-start gap-3 rounded-2xl border border-line-subtle bg-surface p-2 shadow-edge',
        className,
      )}
    >
      {children}
    </figure>
  );
}

function RealCard({
  work,
  sizes,
  compact,
  className,
}: {
  work: Work;
  sizes: string;
  compact: boolean;
  className?: string | undefined;
}) {
  const locale = useLocale();
  const copy = WORKS_COPY[locale];
  const src = useWorkSource(work);
  const title = work.title[locale];
  const titleLang = locale === 'ja' && work.jaFallback ? 'en' : undefined;
  return (
    <CardShell className={className}>
      <FilmPlayer
        src={src}
        poster={work.media.poster.src}
        posterSet={{ srcSet: work.media.poster.srcSet, sizes }}
        title={copy.videoLabel(title)}
        aspect={ASPECT[work.orientation]}
        badge="h3"
        className="rounded-xl shadow-none"
      />
      <figcaption className="grid gap-2 px-1.5 pb-1.5">
        <p className="flex items-baseline justify-between gap-3">
          <span lang={titleLang} className="min-w-0 text-data font-semibold text-balance-cjk text-fg">
            {title}
          </span>
          <span className="machine shrink-0 text-caption text-fg-secondary tabular-nums">
            <span className="sr-only">{copy.length} </span>
            {formatLength(work.seconds)}
          </span>
        </p>
        <p className="flex flex-wrap items-center gap-1.5">
          <CategoryTag>{copy.category[work.category]}</CategoryTag>
          {work.orientation === 'portrait' ? <CategoryTag>{copy.orientation.portrait}</CategoryTag> : null}
        </p>
        {compact || work.features.length === 0 ? null : (
          <ul aria-label={copy.features} className="flex flex-wrap gap-1.5">
            {work.features.map((feature) => (
              <li
                key={feature}
                className="inline-flex min-h-6 items-center rounded-md border border-action/30 bg-brand-gradient-soft px-2 text-[11px] font-semibold text-action-fg"
              >
                {copy.feature[feature]}
              </li>
            ))}
          </ul>
        )}
      </figcaption>
    </CardShell>
  );
}

function CategoryTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-6 items-center rounded-full border border-line-strong bg-raised px-2.5 text-caption text-fg-secondary">
      {children}
    </span>
  );
}

function SlateCard({
  entry,
  className,
}: {
  entry: Extract<WallEntry, { kind: 'slate' }>;
  className?: string | undefined;
}) {
  const locale = useLocale();
  const copy = WORKS_COPY[locale];
  const { title, category, orientation } = entry.entry;
  return (
    <CardShell className={className}>
      <div
        className="relative grid place-items-center overflow-hidden rounded-xl border border-line-subtle bg-[radial-gradient(70%_80%_at_30%_20%,rgb(62_137_255_/_0.16),transparent_70%),radial-gradient(60%_70%_at_80%_90%,rgb(171_123_255_/_0.14),transparent_70%)] bg-sunken"
        style={{ aspectRatio: ASPECT[orientation] }}
      >
        <span className="material-hud inline-flex min-h-8 items-center gap-2 rounded-full px-3 text-caption font-medium text-fg-secondary">
          <Clock aria-hidden className="size-3.5 text-warning" />
          {copy.rendering}
        </span>
      </div>
      <figcaption className="grid gap-2 px-1.5 pb-1.5">
        <span className="text-data font-semibold text-balance-cjk text-fg-secondary">{title[locale]}</span>
        <p className="flex flex-wrap items-center gap-1.5">
          {category ? <CategoryTag>{copy.category[category]}</CategoryTag> : null}
          {orientation === 'portrait' ? <CategoryTag>{copy.orientation.portrait}</CategoryTag> : null}
        </p>
      </figcaption>
    </CardShell>
  );
}
