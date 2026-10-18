import './tour.css';
import { useLocale } from '../../i18n/locale.tsx';
import { ChapterIndex } from './ChapterIndex.tsx';
import { ChapterSection } from './ChapterSection.tsx';
import { CHAPTERS, CHAPTER_IDS } from './chapters.ts';
import { TOUR } from './copy.ts';
import { useActiveChapter } from './hooks.ts';
import { AgentSection, ClosingSection, NotesSection, TourSeam } from './sections.tsx';
import { TourHero } from './TourHero.tsx';

/**
 * Tour: hero (local nebula, real capture) → five recorded chapters beside a HUD index → the agent skill → honest notes →
 * closing. Every section renders complete in the prerendered HTML; motion is layered on top and collapses to the same content
 * under prefers-reduced-motion. Recordings drop in by file name (chapters.ts).
 */
export function TourPage() {
  const t = TOUR[useLocale()];
  const active = useActiveChapter(CHAPTER_IDS);
  return (
    <>
      <TourHero t={t} />
      <TourSeam />
      {/*
       * Reading veil: the layout's living nebula frames the chapters but never sits under body text (BRIEF §4.1 guardrail).
       * `isolate` keeps the veil above the fixed backdrop.
       */}
      <div className="relative isolate before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(180deg,rgb(7_11_20_/_0),rgb(7_11_20_/_0.78)_6rem,rgb(7_11_20_/_0.78)_calc(100%_-_6rem),rgb(7_11_20_/_0))]">
        <div className="site-container lg:grid lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16">
          <ChapterIndex t={t} active={active} />
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            {CHAPTERS.map((spec) => (
              <ChapterSection key={spec.id} spec={spec} t={t} active={active === spec.id} />
            ))}
          </div>
        </div>
      </div>
      <TourSeam />
      <AgentSection t={t} />
      <NotesSection t={t} />
      <ClosingSection t={t} />
    </>
  );
}
