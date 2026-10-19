import { SpotlightCard } from '../../components/fx/index.ts';
import { AiBadge } from '../../components/ui/AiBadge.tsx';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { ClipPlayer } from './ClipPlayer.tsx';
import { SHOWCASE } from './copy.ts';
import { FILMS, itemBySlug, jstDate, shortRun, type ShowcaseImage, type ShowcaseItem } from './data.ts';
import { MediaBadge, PipelineChip, PromptDisclosure, StepLanes, useSecondsText } from './parts.tsx';

/** Landscape cards frame their media at the H3 / Qwen-Image ratio (768×448 = 1152×672), so rows line up. */
const CARD_ASPECT = 768 / 448;

/** Anchor id of a result card, for references between results. */
export function cardId(slug: string): string {
  return `result-${slug}`;
}

/** A generated image shown inside a card's details, with its own licence badge (always visible). */
function BadgedImage({ image, alt, className }: { image: ShowcaseImage; alt: string; className?: string }) {
  return (
    <span className={cn('relative block overflow-hidden rounded-md bg-stage', className)}>
      <img src={image.src} srcSet={image.srcSet} sizes="(min-width: 1280px) 26vw, 90vw" width={image.width} height={image.height} alt={alt} loading="lazy" decoding="async" className="block h-auto w-full" />
      <span className="pointer-events-none absolute top-2 left-2 max-w-[calc(100%-1rem)]">
        <AiBadge variant="qwen" />
      </span>
    </span>
  );
}

/**
 * One real result: the media (play for sound), the licence badge, its run facts (pipeline, seed, native resolution,
 * controller-observed end-to-end time), where each step ran, what it was made from (first-frame still or reference images,
 * each with its own receipt and badge), the films that reuse it, and the exact prompt. Portrait results get a side-by-side
 * layout so a 9:16 clip does not turn the card into a tower.
 */
export function ResultCard({ item, className }: { item: ShowcaseItem; className?: string }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale].card;
  const gallery = SHOWCASE[locale].gallery;
  const secondsText = useSecondsText();
  const reference = item.reference?.slug ? itemBySlug(item.reference.slug) : undefined;
  const titleId = `${cardId(item.slug)}-title`;
  const portrait = item.height > item.width;
  const sizes = portrait ? '(min-width: 1024px) 18vw, 50vw' : '(min-width: 1280px) 30vw, (min-width: 640px) 46vw, 100vw';
  const ff = item.firstFrame;
  const usedIn = item.usedIn.map((slug) => itemBySlug(slug)).filter((entry): entry is ShowcaseItem => Boolean(entry));

  return (
    <SpotlightCard tilt={portrait ? 0 : 2} className={cn('h-full', className)}>
      <article
        id={cardId(item.slug)}
        aria-labelledby={titleId}
        className={cn('grid h-full scroll-mt-[calc(var(--site-header-h)+1rem)] content-start', portrait && 'sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]')}
      >
        <div className={cn('relative', portrait && 'mx-auto w-full max-w-[18rem] sm:max-w-none')}>
          <ClipPlayer item={item} sizes={sizes} {...(portrait ? {} : { aspect: CARD_ASPECT })} className={portrait ? 'rounded-t-2xl sm:rounded-tr-none sm:rounded-l-2xl' : 'rounded-t-2xl'} />
          <MediaBadge item={item} />
          {item.frames && item.fps && item.seconds ? (
            <span lang="en" className="machine pointer-events-none absolute bottom-3 left-3 inline-flex min-h-6 items-center rounded-full border border-[rgb(255_255_255_/_0.14)] bg-[rgb(7_11_20_/_0.72)] px-2.5 text-[11px] text-fg backdrop-blur-sm">
              {item.seconds.toFixed(2)} s · {item.frames} f
            </span>
          ) : null}
        </div>

        <div className="grid content-start gap-4 p-4 md:p-5">
          <header className="grid gap-1">
            <p className="text-caption text-fg-tertiary">{copy.kind[item.kind]}</p>
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <h3 id={titleId} className="text-section font-semibold text-balance-cjk text-fg">
                {item.title[locale]}
              </h3>
              <PipelineChip pipeline={item.pipeline} />
            </div>
          </header>

          <dl className="grid grid-cols-3 gap-3 text-caption">
            <Fact label={copy.endToEnd} value={secondsText(item.endToEndSeconds, item.endToEndApprox)} strong />
            <Fact label={copy.resolution} value={`${item.width}×${item.height}`} />
            <Fact label={copy.seed} value={item.seed === null ? '–' : String(item.seed)} />
          </dl>

          <StepLanes item={item} className="sc-lanes-grow" />

          {ff ? (
            <div className="grid gap-2 text-caption">
              <p className="text-fg-tertiary">
                <span className="text-fg-secondary">{gallery.firstFrame}</span> · {gallery.firstFrameMeta(ff.seed === null ? '–' : String(ff.seed), `${ff.width}×${ff.height}`, secondsText(ff.endToEndSeconds))}
              </p>
              <details className="group/ff rounded-lg border border-line-subtle bg-sunken/60">
                <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 font-semibold text-fg-secondary hover:text-fg [&::-webkit-details-marker]:hidden">
                  {gallery.showFirstFrame}
                  <span aria-hidden className="text-fg-tertiary transition-transform group-open/ff:rotate-45">
                    +
                  </span>
                </summary>
                <div className="grid gap-3 border-t border-line-subtle p-3">
                  <BadgedImage image={ff.image} alt={`${gallery.firstFrame}: ${item.title[locale]}`} />
                  <StepLanes item={{ ...item, steps: ff.steps, endToEndSeconds: ff.endToEndSeconds, endToEndApprox: false }} />
                  {ff.prompt ? (
                    <p lang="en" className="max-h-56 overflow-auto font-mono text-[12px] leading-relaxed whitespace-pre-line text-fg-secondary">
                      {ff.prompt}
                    </p>
                  ) : null}
                  <p lang="en" className="machine text-[11px] text-fg-tertiary">
                    t2i‑pc · {ff.ditEngine} · {copy.run} {shortRun(ff.runId)}
                  </p>
                </div>
              </details>
            </div>
          ) : null}

          {reference || item.extraReferences.length ? (
            <div className="grid gap-2 text-caption">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-fg-tertiary">
                <span className="text-fg-secondary">{item.kind === 'fl2va' ? copy.firstFrame : copy.referenceImage}</span>
                {reference ? (
                  <a href={`#${cardId(reference.slug)}`} className="text-fg-secondary underline-offset-2 hover:text-fg hover:underline">
                    {reference.title[locale]}
                  </a>
                ) : null}
                {item.extraReferences.map((extra, index) => (
                  <span key={index}>+ {gallery.faceReference(extra.mirrored)}</span>
                ))}
              </p>
              {item.extraReferences.length ? (
                <details className="group/refs rounded-lg border border-line-subtle bg-sunken/60">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 font-semibold text-fg-secondary hover:text-fg [&::-webkit-details-marker]:hidden">
                    {gallery.showReferences}
                    <span aria-hidden className="text-fg-tertiary transition-transform group-open/refs:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="grid grid-cols-2 gap-3 border-t border-line-subtle p-3">
                    {item.extraReferences.map((extra, index) => (
                      <figure key={index} className="grid gap-1.5">
                        <BadgedImage image={extra.image} alt={gallery.faceReference(extra.mirrored)} />
                        <figcaption className="text-[11px] text-fg-tertiary">
                          {gallery.faceReference(extra.mirrored)}
                          {extra.runId ? (
                            <span lang="en" className="machine">
                              {' '}
                              · t2i‑pc · {copy.run} {extra.runId}
                              {extra.seed !== null ? ` · ${copy.seed} ${extra.seed}` : ''}
                            </span>
                          ) : null}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </details>
              ) : null}
            </div>
          ) : null}

          {usedIn.length ? (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-fg-tertiary">
              <span className="text-fg-secondary">{gallery.usedIn}</span>
              {usedIn.map((edit, index) => (
                <span key={edit.slug}>
                  {index ? <span aria-hidden>· </span> : null}
                  {FILMS.includes(edit) ? (
                    <a href={`#film-${edit.slug}`} className="text-fg-secondary underline-offset-2 hover:text-fg hover:underline">
                      {edit.title[locale]}
                    </a>
                  ) : (
                    edit.title[locale]
                  )}
                </span>
              ))}
            </p>
          ) : null}

          <PromptDisclosure prompt={item.prompt} summary={copy.showPrompt} />

          <p className="machine flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-fg-tertiary">
            {[item.model, item.ditEngine].filter(Boolean).map((part) => (
              <span key={part} lang="en" className="after:ml-2 after:content-['·']">
                {part}
              </span>
            ))}
            <span className="whitespace-nowrap">
              {copy.run} <span lang="en">{shortRun(item.runId)}</span>
            </span>
            {item.createdAt ? <span className="whitespace-nowrap before:mr-2 before:content-['·']">{jstDate(item.createdAt)}</span> : null}
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

