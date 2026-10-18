import { useEffect, useId, useState } from 'react';
import { cn } from '../../lib/cn.ts';
import { SECTION_IDS, type SectionId } from './copy.ts';
import { sectionNumber, useDisplayBreak, withBalance } from './parts.tsx';

// Reading line: a section is "current" while it crosses the band 38–42 % down the viewport.
const READING_BAND = '-38% 0px -58% 0px';

/**
 * Which chapter is under the reading line. Progressive: null on the server and before hydration
 * (the index is then a plain list of anchor links). Between chapters the last one stays current;
 * above the first chapter (the hero) nothing is.
 */
function useActiveSection(ids: readonly SectionId[]): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);
  useEffect(() => {
    const targets = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const first = targets[0];
    if (!first) return;
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const current = ids.find((id) => crossing.has(id));
        if (current) setActive(current);
        else if (first.getBoundingClientRect().top > window.innerHeight * 0.4) setActive(null);
      },
      { rootMargin: READING_BAND },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/**
 * Chapter list. Wide screens (lg): a sticky rail beside the reading column with the current chapter
 * marked by the brand line (the page's single "current" marker). Narrower: a compact contents block.
 */
export function SectionIndex({ heading, titles, className }: { heading: string; titles: Record<SectionId, string>; className?: string }) {
  const headingId = useId();
  const active = useActiveSection(SECTION_IDS);
  const display = useDisplayBreak();
  return (
    <nav aria-labelledby={headingId} className={className}>
      {/* On wide screens the rail floats over the living backdrop, so it keeps a light canvas tint under its small text. */}
      <div className="rounded-xl border border-line bg-surface p-4 sm:p-5 lg:sticky lg:top-[calc(var(--site-header-h)+3rem)] lg:-ml-4 lg:border-0 lg:bg-[rgb(7_11_20_/_0.66)] lg:p-4">
        <p id={headingId} className="text-caption font-semibold text-fg-tertiary">
          {heading}
        </p>
        <ol className="mt-3 grid grid-cols-1 gap-x-6 min-[22rem]:grid-cols-2 lg:mt-4 lg:grid-cols-1 lg:border-l lg:border-line">
          {SECTION_IDS.map((id) => {
            const current = id === active;
            return (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={current ? 'location' : undefined}
                  className={cn(
                    'relative flex min-h-9 items-baseline gap-2.5 py-1.5 text-data no-underline lg:min-h-8 lg:pl-4',
                    current ? 'text-fg' : 'text-fg-secondary hover:text-fg',
                  )}
                >
                  <span aria-hidden lang="en" className="machine shrink-0 text-[11px] whitespace-nowrap text-fg-tertiary">
                    {sectionNumber(id)}
                  </span>
                  <span className={withBalance(cn('min-w-0', display))}>{titles[id]}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-y-1.5 -left-px hidden w-0.5 rounded-full bg-brand-gradient transition-opacity duration-(--duration-base) lg:block',
                      current ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
