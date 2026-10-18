import { SpotlightCard } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { ClipPlayer } from './ClipPlayer.tsx';
import { SHOWCASE } from './copy.ts';
import { itemBySlug, type ShowcaseItem } from './data.ts';
import { AiBadge, PipelineChip, PromptDisclosure, StepLanes, useSecondsText } from './parts.tsx';

/** Anchor id of a result card, for references between results. */
export function cardId(slug: string): string {
  return `result-${slug}`;
}

/**
 * One real result: the media (muted loop with a sound toggle for clips), the AI-generated badge, its run facts (pipeline,
 * seed, native resolution, controller-observed end-to-end time), where each step ran, what it was made from, and the
 * exact prompt.
 */
export function ResultCard({ item, size = 'regular', className }: { item: ShowcaseItem; size?: 'regular' | 'wide'; className?: string }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale].card;
  const secondsText = useSecondsText();
  const reference = item.reference?.slug ? itemBySlug(item.reference.slug) : undefined;
  const titleId = `${cardId(item.slug)}-title`;
  const sizes = size === 'wide' ? '(min-width: 1280px) 56vw, (min-width: 640px) 90vw, 100vw' : '(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 100vw';
  const referenceLabel = item.kind === 'fl2va' ? copy.firstFrame : item.kind === 'ref2va' ? copy.referenceImage : copy.madeFrom;

  return (
    <SpotlightCard tilt={2} className={cn('h-full', className)}>
      <article id={cardId(item.slug)} aria-labelledby={titleId} className="grid h-full scroll-mt-[calc(var(--site-header-h)+1rem)] content-start">
        <div className="relative">
          <ClipPlayer item={item} sizes={sizes} className="rounded-t-2xl" />
          <div className="pointer-events-none absolute top-3 left-3 flex flex-wrap gap-1.5">
            <AiBadge />
            <span className="inline-flex min-h-6 items-center rounded-full border border-[rgb(255_255_255_/_0.14)] bg-[rgb(7_11_20_/_0.72)] px-2.5 text-caption font-medium text-fg-secondary backdrop-blur-sm">
              {copy.kind[item.kind]}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-4 md:p-5">
          <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h3 id={titleId} className="text-section font-semibold text-balance-cjk text-fg">
              {item.title[locale]}
            </h3>
            <PipelineChip pipeline={item.pipeline} />
          </header>

          <dl className="grid grid-cols-3 gap-3 text-caption">
            <Fact label={copy.endToEnd} value={secondsText(item.endToEndSeconds, item.endToEndApprox)} strong />
            <Fact label={copy.resolution} value={`${item.width}×${item.height}`} />
            <Fact label={copy.seed} value={String(item.seed)} />
          </dl>

          {item.frames && item.fps && item.seconds ? (
            <p className="machine -mt-1 text-caption text-fg-tertiary">{copy.clip(item.frames, item.fps, item.seconds.toFixed(2))}</p>
          ) : null}

          <StepLanes item={item} className="sc-lanes-grow" />

          {reference || item.reference?.label ? (
            <p className="flex flex-wrap items-center gap-2 text-caption text-fg-tertiary">
              <span>{referenceLabel}</span>
              {reference ? (
                <a href={`#${cardId(reference.slug)}`} className="inline-flex items-center gap-2 rounded-md text-fg-secondary no-underline hover:text-fg">
                  <img src={reference.media.image.src} srcSet={reference.media.image.srcSet} sizes="40px" width={reference.media.image.width} height={reference.media.image.height} alt="" loading="lazy" decoding="async" className="h-6 w-auto rounded-sm" />
                  {reference.title[locale]}
                </a>
              ) : (
                <span className="text-fg-secondary">{item.reference?.label}</span>
              )}
            </p>
          ) : null}

          <PromptDisclosure prompt={item.prompt} summary={copy.showPrompt} />

          <p lang="en" className="machine text-[11px] text-fg-tertiary">
            {item.model} · {item.ditEngine} · {copy.run} {item.runId}
            {item.outputId ? ` · ${copy.output} ${item.outputId}` : ''}
          </p>
        </div>
      </article>
    </SpotlightCard>
  );
}

function Fact({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="grid min-w-0 gap-0.5">
      <dt className="truncate text-fg-tertiary">{label}</dt>
      <dd className={cn('machine truncate tabular-nums', strong ? 'font-semibold text-fg' : 'text-fg-secondary')}>{value}</dd>
    </div>
  );
}
