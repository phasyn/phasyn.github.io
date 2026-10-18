import { Activity, Bot, CircleSlash, Gauge, ListChecks } from 'lucide-react';
import { useCopy } from '../../../i18n/locale.tsx';
import { ArtImage } from '../components/ArtImage.tsx';
import { RealScreen } from '../components/RealScreen.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';
import { RUN } from '../data.ts';

/**
 * "Find the slow step — or let your agent find it": the real Records run page of one fl2va render (with callouts on the numbers it
 * shows), the real Compare page, and the agent skill in a real terminal capture. Screens without a capture yet show the neutral
 * "real capture pending" frame.
 */
export function DiagnosticsSection() {
  const t = useCopy(HOME).diagnostics;
  const factIcons = [Gauge, CircleSlash, ListChecks];
  return (
    <section aria-labelledby="diagnostics-title" className="site-section relative">
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading id="diagnostics-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <ArtImage art="diagnostics" size={168} fallback={Activity} className="reveal hidden lg:block" />
        </div>
        <ul className="reveal mt-10 grid gap-3 md:grid-cols-3">
          {t.facts.map((fact, index) => {
            const Icon = factIcons[index] ?? Gauge;
            return (
              <li key={fact} className="flex items-start gap-3 rounded-2xl border border-line-subtle bg-surface px-4 py-3.5 text-body text-fg-secondary">
                <Icon className="mt-0.5 size-4 shrink-0 text-action-fg" aria-hidden />
                {fact}
              </li>
            );
          })}
        </ul>

        <figure className="reveal mt-12 grid gap-3">
          <RealScreen
            screen="records-run-steps"
            crop="main"
            pan="22rem"
            hotspots={['run.elapsed', 'run.slowest', 'run.timeline']}
            hud={`REAL UI · RECORDS · RUN ${RUN.id}`}
            orbit
            displayWidth="min(76rem, 94vw)"
          />
          <figcaption className="max-w-[90ch] text-caption leading-relaxed text-fg-tertiary">{t.runCaption}</figcaption>
        </figure>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12">
          <figure className="reveal grid content-start gap-3">
            <RealScreen screen="records-compare" displayWidth="min(37rem, 94vw)" />
            <figcaption className="text-caption leading-relaxed text-fg-tertiary">{t.compareCaption}</figcaption>
          </figure>
          <div className="reveal grid content-start gap-5">
            <div className="flex items-center gap-4">
              <ArtImage art="agent" size={88} fallback={Bot} className="-ml-2" />
              <h3 className="text-headline tracking-display text-balance-cjk text-fg">{t.agentTitle}</h3>
            </div>
            <p className="text-reading text-fg-secondary">{t.agentBody}</p>
            <p className="text-reading text-fg-secondary">
              {t.agentScript.before}
              <code translate="no" className="machine rounded-md border border-line-subtle bg-sunken px-1.5 py-0.5 text-[0.875em] whitespace-nowrap text-fg">
                {t.agentScript.code}
              </code>
              {t.agentScript.after}
            </p>
            <figure className="grid gap-3">
              <RealScreen screen="terminal-phasynctl" displayWidth="min(37rem, 94vw)" />
              <figcaption className="text-caption leading-relaxed text-fg-tertiary">{t.terminalCaption}</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
