import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../../components/ui/Button.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { pagePath } from '../../../site/config.ts';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';

/**
 * Three traceable numbers, each with the machine that produced it (57–76 s fl2va on 2026-10-18; the 33.2 s DiT stage on a cold
 * first call; 37/40 variants), and the way to the full tables. Final values only — nothing counts up, so no screenshot can catch
 * a number that was never measured.
 */
export function BenchmarksSection() {
  const locale = useLocale();
  const t = useCopy(HOME).benchmarks;
  return (
    <section aria-labelledby="benchmarks-title" className="home-section relative">
      <div className="site-container">
        <SectionHeading id="benchmarks-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <dl className="mt-14 grid gap-4 md:grid-cols-3 lg:gap-5">
          {t.stats.map((stat) => (
            <div
              key={stat.label}
              className="reveal relative flex flex-col overflow-hidden rounded-3xl border border-line-subtle bg-surface p-6 shadow-edge before:absolute before:inset-x-8 before:top-0 before:h-px before:bg-brand-gradient before:opacity-60 sm:p-8"
            >
              <dt className="text-body font-medium text-fg-secondary">{stat.label}</dt>
              <dd className="mt-5 flex items-baseline gap-2">
                <span className="text-[clamp(2.75rem,2rem+2.4vw,4.25rem)] leading-none font-semibold tracking-[-0.03em] whitespace-nowrap text-fg tabular-nums">{stat.value}</span>
                {stat.unit ? <span className="text-[1.5rem] font-medium text-fg-tertiary">{stat.unit}</span> : null}
              </dd>
              <dd className="mt-5 text-caption leading-relaxed text-fg-secondary">{stat.detail}</dd>
            </div>
          ))}
        </dl>
        <div className="reveal mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-[70ch] text-caption text-fg-tertiary">{t.footnote}</p>
          <ButtonLink to={pagePath(locale, 'benchmarks')} variant="secondary" size="lg">
            {t.cta}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
