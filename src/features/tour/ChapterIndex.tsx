import { useEffect, useRef, type CSSProperties } from 'react';
import { HudFrame } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useReducedMotion } from '../../lib/hooks.ts';
import { CHAPTERS, TOTAL_LENGTH, chapterNumber, lengthText, type ChapterId } from './chapters.ts';
import type { TourCopy } from './copy.ts';

interface ChapterIndexProps {
  t: TourCopy;
  active: ChapterId | null;
}

/**
 * The chapter index as a HUD. Wide screens (lg): a sticky rail beside the chapters with the current chapter marked and a linear
 * reading-progress bar. Narrower: a sticky strip of chips under the site header that keeps the current chip in view. Both are
 * plain anchor lists without JavaScript.
 */
export function ChapterIndex({ t, active }: ChapterIndexProps) {
  const reducedMotion = useReducedMotion();
  const railBars = useRef(new Map<ChapterId, HTMLSpanElement>());
  const stripRef = useRef<HTMLOListElement>(null);
  const minutes = Math.round(TOTAL_LENGTH / 60);

  // Reading progress through the current chapter: written straight to the bar (no re-render per scroll frame).
  useEffect(() => {
    if (!active) return;
    const section = document.getElementById(active);
    const bar = railBars.current.get(active);
    if (!section || !bar) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const progress = (window.innerHeight * 0.45 - rect.top) / Math.max(1, rect.height);
      bar.style.setProperty('--tour-progress', String(Math.min(1, Math.max(0, progress))));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [active]);

  // Keep the current chip in view inside the strip (its own horizontal scroll, never the page).
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const chip = active ? strip.querySelector<HTMLElement>(`[data-chapter="${active}"]`) : null;
    // Above the first chapter the strip returns to its start.
    const left = chip ? chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2 : 0;
    strip.scrollTo({ left: Math.max(0, left), behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [active, reducedMotion]);

  const title = (id: ChapterId) => t.chapters[id].short;

  return (
    <>
      {/* Narrow screens: sticky chip strip under the site header. */}
      <nav aria-label={t.index.heading} className="sticky top-(--site-header-h) z-30 -mx-(--site-gutter) lg:hidden">
        <div className="border-b border-line-subtle bg-[rgb(7_11_20_/_0.84)] backdrop-blur-xl backdrop-saturate-150 supports-[not(backdrop-filter:blur(1px))]:bg-[rgb(7_11_20_/_0.97)]">
          <ol ref={stripRef} className="flex gap-2 overflow-x-auto px-(--site-gutter) py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CHAPTERS.map((spec) => {
              const current = spec.id === active;
              return (
                <li key={spec.id} data-chapter={spec.id} className="shrink-0">
                  <a
                    href={`#${spec.id}`}
                    aria-current={current ? 'location' : undefined}
                    className={cn(
                      'pressable inline-flex h-9 max-w-[15rem] items-center gap-2 rounded-full border px-3 text-data no-underline',
                      current ? 'border-action/50 bg-brand-gradient-soft text-fg shadow-glow-sm' : 'border-line-strong bg-raised/70 text-fg-secondary hover:text-fg',
                    )}
                  >
                    <span aria-hidden lang="en" className={cn('machine text-[11px]', current ? 'text-brand-cyan' : 'text-fg-tertiary')}>
                      {chapterNumber(spec)}
                    </span>
                    <span className="truncate">{title(spec.id)}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Wide screens: HUD rail. */}
      <aside className="hidden lg:col-start-1 lg:row-start-1 lg:block">
        <div className="sticky top-[calc(var(--site-header-h)+2.5rem)] pt-24">
          <HudFrame label={`CHAPTERS · ${String(CHAPTERS.length).padStart(2, '0')}`} innerClassName="bg-[rgb(7_11_20_/_0.74)] backdrop-blur-md">
            <nav aria-label={t.index.heading} className="grid gap-3 p-2.5 pt-4">
              <ol className="grid gap-1">
                {CHAPTERS.map((spec) => {
                  const current = spec.id === active;
                  return (
                    <li key={spec.id}>
                      <a
                        href={`#${spec.id}`}
                        aria-current={current ? 'location' : undefined}
                        className={cn(
                          'group relative grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 text-data no-underline transition-colors',
                          current ? 'bg-brand-gradient-soft text-fg' : 'text-fg-secondary hover:bg-raised/60 hover:text-fg',
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            'absolute inset-y-2 left-0 w-0.5 rounded-full bg-brand-gradient transition-opacity duration-(--duration-base)',
                            current ? 'opacity-100 shadow-[0_0_10px_rgb(73_207_255_/_0.7)]' : 'opacity-0',
                          )}
                        />
                        <span aria-hidden lang="en" className={cn('machine pt-px text-[11px]', current ? 'text-brand-cyan' : 'text-fg-tertiary')}>
                          {chapterNumber(spec)}
                        </span>
                        <span className="min-w-0 font-medium leading-snug [text-wrap:pretty]">{title(spec.id)}</span>
                        <span aria-hidden className="col-start-2 flex items-center gap-2">
                          <span className={cn('shrink-0 text-[11px] tabular-nums', spec.recorded ? 'text-success' : 'text-fg-tertiary')}>{lengthText(spec, t.chapter.planned)}</span>
                          <span className="relative h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line-subtle">
                            <span
                              ref={(element) => {
                                if (element) railBars.current.set(spec.id, element);
                                else railBars.current.delete(spec.id);
                              }}
                              className={cn('tour-rail-progress absolute inset-0 bg-brand-gradient', !current && 'opacity-0')}
                              style={{ '--tour-progress': 0 } as CSSProperties}
                            />
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
              <p className="border-t border-line-subtle px-3 pt-3 pb-1 text-caption text-fg-tertiary">{t.index.total(CHAPTERS.length, minutes)}</p>
            </nav>
          </HudFrame>
        </div>
      </aside>
    </>
  );
}
