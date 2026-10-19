import { Check } from 'lucide-react';
import { HudFrame } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SHOWCASE } from './copy.ts';
import { CHARACTER, RESULTS, itemBySlug, shortRun, strongestFirst } from './data.ts';
import { ResultGroup } from './Gallery.tsx';
import { MediaBadge, SectionHeading, useSecondsText } from './parts.tsx';

/** The prompt's `subject_definitions` block (H3 Ref2VA six-section format), or nothing. */
function subjectDefinition(prompt: string): string | undefined {
  const match = /subject_definitions:\s*\n([\s\S]*?)(?:\n\s*\n|$)/.exec(prompt);
  return match?.[1]?.trim();
}

/**
 * Character consistency: the t2i-pc character sheet (picked from three seeds) next to every Ref2VA clip that used it as
 * its only reference. The scene count and every time come from the items.
 */
export function CharacterSection() {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const secondsText = useSecondsText();
  const sheet = itemBySlug(CHARACTER.sheet);
  // Ref2VA scenes that used the sheet (the native 9:16 one sits with the verticals), strongest first.
  const scenes = strongestFirst(RESULTS.filter((item) => item.kind === 'ref2va' && item.reference?.slug === CHARACTER.sheet && item.media.clip));
  if (!sheet || !scenes.length) return null;
  const subject = scenes.map((scene) => subjectDefinition(scene.prompt)).find(Boolean);

  return (
    <section id="character" aria-labelledby="character-title" className="site-container py-[clamp(4rem,2.5rem+6vw,8rem)]">
      <SectionHeading id="character-title" eyebrow={copy.character.eyebrow} title={copy.character.title} lead={copy.character.lead} />

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
        <figure className="grid gap-4 lg:sticky lg:top-[calc(var(--site-header-h)+1.5rem)]">
          <HudFrame label={`REF · RUN ${shortRun(sheet.runId)} · SEED ${sheet.seed}`} orbit innerClassName="bg-[#fff]">
            <img
              src={sheet.media.image.src}
              srcSet={sheet.media.image.srcSet}
              sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 90vw"
              width={sheet.media.image.width}
              height={sheet.media.image.height}
              alt={sheet.title[locale]}
              loading="lazy"
              decoding="async"
              className="mx-auto block h-auto w-full max-w-[24rem]"
            />
            <MediaBadge item={sheet} />
          </HudFrame>
          <figcaption className="grid gap-1 text-caption">
            <span className="font-semibold text-fg">
              {copy.character.sheet} · {sheet.width}×{sheet.height}
            </span>
            <span lang="en" className="machine text-fg-tertiary">
              {sheet.pipeline} · {sheet.model} · {copy.card.endToEnd} {secondsText(sheet.endToEndSeconds, sheet.endToEndApprox)}
            </span>
          </figcaption>

          <div className="grid gap-2">
            <p className="text-caption text-fg-secondary">{copy.character.candidates}</p>
            <ul className="grid grid-cols-3 gap-2">
              {CHARACTER.candidates.map((candidate) => {
                const picked = 'picked' in candidate && candidate.picked;
                return (
                  <li key={candidate.seed} className={cn('relative overflow-hidden rounded-lg border bg-[#fff]', picked ? 'border-brand-cyan shadow-glow-sm' : 'border-line opacity-80')}>
                    <img src={candidate.src} width={384} height={512} alt={`${copy.card.seed} ${candidate.seed}`} loading="lazy" decoding="async" className="block h-auto w-full" />
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-[rgb(7_11_20_/_0.82)] px-2 py-1 text-[11px] text-fg">
                      <span className="machine">{candidate.seed}</span>
                      {picked ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-brand-cyan">
                          <Check aria-hidden className="size-3" />
                          {copy.character.picked}
                        </span>
                      ) : null}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </figure>

        <div className="grid gap-6">
          <ResultGroup id="character" title={copy.character.scenes(scenes.length)} lead={copy.character.scenesLead} items={scenes} columns="sm:grid-cols-2" />

          {subject ? (
            <figure className="grid gap-2 rounded-xl border border-line-subtle bg-sunken/70 p-4 md:p-5">
              <figcaption className="text-caption font-semibold text-fg-secondary">{copy.character.subject}</figcaption>
              <blockquote lang="en" className="font-mono text-[12.5px] leading-relaxed text-fg-secondary">
                {subject}
              </blockquote>
            </figure>
          ) : null}
        </div>
      </div>
    </section>
  );
}
