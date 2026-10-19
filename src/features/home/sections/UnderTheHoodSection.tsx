import { ArrowRight, Bot, Boxes, ChevronDown, Cpu, Gauge, Info, Network, Scale } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { HudFrame } from '../../../components/fx/index.ts';
import { ButtonLink } from '../../../components/ui/Button.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { pagePath } from '../../../site/config.ts';
import { ArtImage } from '../components/ArtImage.tsx';
import { MotionToggle } from '../components/MotionToggle.tsx';
import { RealScreen } from '../components/RealScreen.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { usePlayback } from '../components/usePlayback.ts';
import { HOME, type HomeCopy } from '../copy.ts';
import { RUN } from '../data.ts';
import { ArchitectureDiagram } from './architecture/ArchitectureDiagram.tsx';

function Card({ icon, title, children, className }: { icon: ReactNode; title: string; children: ReactNode; className?: string }) {
  return (
    <article className={`reveal flex min-w-0 flex-col gap-4 rounded-3xl border border-line-subtle bg-surface p-6 shadow-edge sm:p-8 ${className ?? ''}`}>
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-[1.25rem] leading-tight font-semibold text-fg sm:text-[1.375rem]">{title}</h3>
      </div>
      {children}
    </article>
  );
}

const ICON = 'grid size-11 shrink-0 place-items-center rounded-2xl border border-action/25 bg-brand-gradient-soft text-brand-cyan';

function Code({ line }: { line: HomeCopy['hood']['agents']['script'] }) {
  return (
    <p className="text-reading text-fg-secondary">
      {line.before}
      <code translate="no" className="machine rounded-md border border-line-subtle bg-sunken px-1.5 py-0.5 text-[0.875em] whitespace-nowrap text-fg">
        {line.code}
      </code>
      {line.after}
    </p>
  );
}

/** The schematic and the other real screens, folded away so the chapter stays short for people who are not engineers. */
function EngineeringDetails({ t }: { t: HomeCopy['hood'] }) {
  const play = usePlayback<HTMLDivElement>({ threshold: 0.15 });
  const [userPaused, setUserPaused] = useState(false);
  return (
    <details className="home-details group/details reveal rounded-3xl border border-line-subtle bg-surface/70">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-3xl px-6 text-data font-semibold text-fg sm:px-8 [&::-webkit-details-marker]:hidden">
        <ChevronDown className="size-4 shrink-0 text-action-fg transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-open/details:rotate-180" aria-hidden />
        {t.details}
      </summary>
      <div className="grid gap-10 px-4 pt-2 pb-6 sm:px-8 sm:pb-8">
        <HudFrame label="TOPOLOGY · 2 MACHINES · 3 GPUS" innerClassName="rounded-[1.4rem]">
          <figure ref={play.ref} className="relative overflow-hidden rounded-[1.4rem] border border-line-subtle bg-surface p-4 sm:p-8">
            <ArchitectureDiagram copy={t.diagram} paused={userPaused || !play.visible} />
            <figcaption className="mt-6 border-t border-line-subtle pt-5 text-data leading-relaxed text-fg-secondary">{t.diagram.caption}</figcaption>
            {play.armed ? (
              <MotionToggle paused={userPaused} onToggle={() => setUserPaused((value) => !value)} pauseLabel={t.pause} playLabel={t.play} className="absolute top-4 right-4" />
            ) : null}
          </figure>
        </HudFrame>
        <figure className="grid gap-3">
          <RealScreen screen="components-pipeline-graph" crop="graph" hotspots={['graph.te', 'graph.dit', 'graph.audio']} hud="PIPELINE GRAPH" displayWidth="min(72rem, 90vw)" pan="15rem" />
          <figcaption className="max-w-[90ch] text-data leading-relaxed text-fg-secondary">{t.graphCaption}</figcaption>
        </figure>
        <figure className="grid gap-3">
          <RealScreen screen="records-run-steps" crop="main" pan="22rem" hotspots={['run.elapsed', 'run.slowest', 'run.timeline']} hud={`RECORDS · RUN ${RUN.id}`} displayWidth="min(72rem, 90vw)" />
          <figcaption className="max-w-[90ch] text-data leading-relaxed text-fg-secondary">{t.runCaption}</figcaption>
        </figure>
        <figure className="grid max-w-[30rem] gap-3">
          <RealScreen screen="component-inspector-precision" crop="inspector" hud="INSPECTOR" displayWidth="min(30rem, 90vw)" />
          <figcaption className="text-data leading-relaxed text-fg-secondary">{t.inspectorCaption}</figcaption>
        </figure>
      </div>
    </details>
  );
}

/**
 * "Under the hood": one chapter for the architecture and the diagnostics. The proof leads — the real Step Timeline of run
 * cfa759df, one track per machine — then four short cards (process per component, node to node, 102 metrics, built for agents),
 * how it differs, what it runs on, and the schematic plus the other real screens folded under "engineering details".
 */
export function UnderTheHoodSection() {
  const locale = useLocale();
  const t = useCopy(HOME).hood;
  return (
    <section aria-labelledby="hood-title" className="home-section relative">
      <div className="site-container">
        <SectionHeading id="hood-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <figure className="reveal mt-10 grid gap-3">
          <RealScreen
            screen="records-run-steps"
            crop="timeline"
            hotspots={['run.te', 'run.audio', 'run.mux']}
            hud="STEP TIMELINE · ONE TRACK PER MACHINE"
            orbit
            displayWidth="min(76rem, 94vw)"
            pan="15rem"
          />
          <figcaption className="text-on-fx max-w-[90ch] text-data leading-relaxed text-fg-secondary">{t.caption}</figcaption>
        </figure>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:gap-5">
          <Card icon={<ArtImage art="nodes" size={44} fallback={Boxes} className="size-11" />} title={t.process.title}>
            <p className="text-reading text-fg-secondary">{t.process.body}</p>
          </Card>
          <Card icon={<span aria-hidden className={ICON}><Network className="size-5" /></span>} title={t.direct.title}>
            <p className="text-reading text-fg-secondary">{t.direct.body}</p>
          </Card>
          <Card icon={<span aria-hidden className={ICON}><Gauge className="size-5" /></span>} title={t.metrics.title}>
            <p className="text-reading text-fg-secondary">{t.metrics.body}</p>
          </Card>
          <Card icon={<ArtImage art="agent" size={44} fallback={Bot} className="size-11" />} title={t.agents.title}>
            <p className="text-reading text-fg-secondary">{t.agents.body}</p>
            <p lang="en" translate="no" className="machine rounded-xl border border-line-subtle bg-sunken px-3.5 py-2.5 text-[12px] leading-relaxed text-fg-secondary">
              {t.agents.tools}
            </p>
            <Code line={t.agents.dryRun} />
            <Code line={t.agents.script} />
            <p className="flex items-start gap-2 text-data text-fg">
              <Scale className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
              {t.agents.evidence}
            </p>
          </Card>
        </div>

        <div className="reveal mt-12 grid gap-4">
          <h3 className="text-[1.25rem] font-semibold text-fg">{t.differs.title}</h3>
          <ul className="grid gap-x-8 gap-y-4 lg:grid-cols-3">
            {t.differs.items.map((item) => (
              <li key={item} className="text-on-fx flex items-start gap-3 text-body leading-relaxed text-fg-secondary">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-cyan shadow-[0_0_8px_rgb(73_207_255_/_0.7)]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            <p className="flex items-start gap-2.5 rounded-2xl border border-line-subtle bg-surface px-4 py-3 text-body text-fg-secondary">
              <Cpu className="mt-0.5 size-4 shrink-0 text-action-fg" aria-hidden />
              {t.runtimes}
            </p>
            <p className="flex items-start gap-2.5 rounded-2xl border border-line-subtle bg-surface px-4 py-3 text-body text-fg-secondary">
              <Info className="mt-0.5 size-4 shrink-0 text-action-fg" aria-hidden />
              {t.multi}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <EngineeringDetails t={t} />
          <ButtonLink to={pagePath(locale, 'tour')} variant="quiet" icon={null} className="justify-self-start">
            {t.tour}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
