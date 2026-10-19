import { useState } from 'react';
import { DecodeText, HudFrame, RevealText } from '../../components/fx/index.ts';
import type { Cue } from '../../components/media/captions.ts';
import { FilmPlayer } from '../../components/media/FilmPlayer.tsx';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { HTML_LANG } from '../../site/config.ts';
import { useInView, useReducedMotion } from '../../lib/hooks.ts';
import { CircleCheck } from 'lucide-react';
import { chapterCaptions, chapterNumber, chapterSource, chapterTimingPath, lengthText, type ChapterSpec } from './chapters.ts';
import type { TourCopy } from './copy.ts';
import { useFilmControl, useStepTimes } from './hooks.ts';
import { RichText } from './RichText.tsx';
import { ChapterScreens } from './screens/ChapterScreens.tsx';
import { StepList } from './StepList.tsx';

interface ChapterSectionProps {
  spec: ChapterSpec;
  t: TourCopy;
  /** The chapter under the reading line: its player frame gets the orbiting light. */
  active: boolean;
}

/** Index of the step that is playing: the last step whose start is at or before `time`. */
function currentStep(times: readonly (number | null)[] | null, time: number | null): number | null {
  if (!times || time === null) return null;
  let found: number | null = null;
  times.forEach((start, index) => {
    if (start !== null && start <= time + 0.05) found = index;
  });
  return found;
}

/**
 * One chapter: number, title (character reveal on view), summary, the recorded session in a HUD frame, then "What you'll see"
 * beside the chapter's real screens. Complete in the prerendered HTML.
 */
export function ChapterSection({ spec, t, active }: ChapterSectionProps) {
  const copy = t.chapters[spec.id];
  const locale = useLocale();
  const lang = HTML_LANG[locale];
  // English pages reuse the cues FilmPlayer loads for its subtitles; other locales fetch the English timing file.
  const [playerCues, setPlayerCues] = useState<Cue[] | null>(null);
  const reducedMotion = useReducedMotion();
  const film = useFilmControl(reducedMotion);
  const [nearRef, near] = useInView<HTMLElement>({ rootMargin: '600px 0px' });
  const anchors = spec.steps.map((step) => step.anchor);
  // Unrecorded chapters have no timing file yet: never request it.
  const times = useStepTimes(chapterTimingPath(spec), anchors, near && spec.recorded === true, locale === 'en' ? playerCues : undefined);
  const current = film.time === null ? null : currentStep(times, film.time);
  const number = chapterNumber(spec);
  const label = t.chapter.label(spec.number);
  const hasScreens = spec.screens.length > 0;

  return (
    <section
      ref={nearRef}
      id={spec.id}
      aria-labelledby={`${spec.id}-title`}
      className="tour-heading scroll-mt-[calc(var(--site-header-h)+4.25rem)] py-16 first:pt-10 md:py-24 lg:scroll-mt-[calc(var(--site-header-h)+1.5rem)] lg:first:pt-24"
    >
      <header className="grid gap-4">
        <p aria-hidden className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span lang="en" className="eyebrow text-brand-cyan">
            <DecodeText text={`CH ${number}`} duration={600} />
          </span>
          <span className="tour-eyebrow-line w-10" />
          {/* Length, planned until the cut exists (no letter-spacing: the label is CJK in two locales). */}
          <span lang={lang} className="text-caption font-medium text-fg-tertiary tabular-nums">
            {lengthText(spec, t.chapter.planned)}
          </span>
          {spec.recorded ? (
            <span lang={lang} className="inline-flex h-6 items-center gap-1 rounded-full border border-success/30 bg-success/12 px-2 text-[11px] font-medium text-success">
              <CircleCheck className="size-3" aria-hidden />
              {t.chapter.recorded}
            </span>
          ) : null}
        </p>
        <h2 id={`${spec.id}-title`} tabIndex={-1} aria-label={`${label}: ${copy.title}`} className="max-w-[24ch] text-headline tracking-display text-balance-cjk text-fg outline-none">
          <RevealText text={copy.title} on="view" />
        </h2>
        <p className="reveal max-w-[62ch] text-lead text-balance-cjk text-fg-secondary">
          <RichText text={copy.summary} />
        </p>
      </header>

      <div className="reveal mt-9 md:mt-11">
        <HudFrame label={`REC · ${number}`} orbit={active} innerClassName="rounded-[1.15rem]">
          <div ref={film.wrapRef}>
            <FilmPlayer
              ref={film.playerRef}
              onTimeUpdate={film.onTimeUpdate}
              {...(locale === 'en' ? { onCues: setPlayerCues } : {})}
              src={chapterSource(spec)}
              captions={chapterCaptions(spec)}
              poster={spec.poster}
              title={t.chapter.playerTitle(spec.number, copy.title)}
              // Screen recordings of the app show generated images and clips (licence-required disclosure).
              badge="mixed"
              available={spec.recorded === true}
              className="rounded-[1.15rem]"
            />
          </div>
        </HudFrame>
      </div>

      <div className={cn('mt-9 grid gap-10 md:mt-11', hasScreens ? 'lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,21rem)]' : 'max-w-[46rem]')}>
        <StepList spec={spec} copy={copy} t={t.chapter} times={times} current={current} onSeek={film.seek} />
        {hasScreens ? <ChapterScreens keys={spec.screens} title={t.chapter.screensTitle} screens={t.screens} layout="column" /> : null}
      </div>
    </section>
  );
}
