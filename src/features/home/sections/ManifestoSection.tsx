import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from '../../../components/brand/BrandMark.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import { pagePath } from '../../../site/config.ts';
import { HOME } from '../copy.ts';

/**
 * The author's reasons, condensed in his own voice: large lines that brighten one by one as they reach the reading zone
 * (CSS view timelines; all lines fully visible without support or with reduced motion). Links to the full statement on About.
 */
export function ManifestoSection() {
  const locale = useLocale();
  const t = useCopy(HOME).manifesto;
  const lines = [...t.beats.map((beat) => beat.text), t.final.text];
  const last = lines.length - 1;
  return (
    <section aria-labelledby="manifesto-title" className="site-section relative">
      <div className="site-container">
        <div className="mx-auto max-w-[60rem]">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="h-px w-8 bg-brand-gradient" />
            {t.eyebrow}
          </p>
          <h2 id="manifesto-title" className="mt-5 text-section font-semibold text-fg-tertiary">
            {t.heading}
          </h2>
          <div className="mt-10 grid gap-[0.6em] text-[clamp(1.75rem,0.95rem+2.7vw,3.6rem)] leading-[1.16] font-semibold tracking-display text-fg md:mt-14">
            {lines.map((line, index) => (
              <p
                key={index}
                className={cn(
                  'home-manifesto-line text-balance-cjk',
                  index === last ? 'mt-[0.5em] text-[1.18em] text-brand-gradient' : 'max-w-[24ch]',
                )}
              >
                {line}
              </p>
            ))}
          </div>
          <div className="reveal mt-14 flex flex-wrap items-center gap-x-5 gap-y-3">
            <span className="inline-flex items-center gap-3 text-body text-fg-secondary">
              <BrandMark size={28} />
              <span>— {t.signature}</span>
            </span>
            <Link
              to={pagePath(locale, 'about')}
              viewTransition
              className="group inline-flex min-h-10 items-center gap-1.5 rounded-md text-body font-medium text-action-fg no-underline hover:text-fg"
            >
              {t.readMore}
              <ArrowRight className="size-4 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
