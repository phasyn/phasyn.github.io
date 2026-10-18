import { ArrowRight, Boxes, CloudCog, Network } from 'lucide-react';
import { useState } from 'react';
import { HudFrame } from '../../../components/fx/index.ts';
import { Chip } from '../../../components/ui/Chip.tsx';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { ArtImage } from '../components/ArtImage.tsx';
import { MotionToggle } from '../components/MotionToggle.tsx';
import { RealScreen } from '../components/RealScreen.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { usePlayback } from '../components/usePlayback.ts';
import { HOME } from '../copy.ts';
import { ArchitectureDiagram } from './architecture/ArchitectureDiagram.tsx';

/**
 * Distributed architecture: the animated diagram, then the proof on real screens — the fl2va-pc pipeline graph in Components and
 * the Step Timeline of one real render of it in Records (three GPUs on two machines) — the component inspector, and the honest
 * "rent a machine" design goal.
 */
export function ArchitectureSection() {
  const locale = useLocale();
  const t = useCopy(HOME).architecture;
  const common = commonCopy(locale);
  const play = usePlayback<HTMLDivElement>({ threshold: 0.15 });
  const [userPaused, setUserPaused] = useState(false);

  return (
    <section aria-labelledby="architecture-title" className="site-section relative">
      <div className="site-container">
        <SectionHeading id="architecture-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <HudFrame label="TOPOLOGY · 2 MACHINES · 3 GPUS" orbit className="reveal mt-14" innerClassName="rounded-[1.4rem]">
          <figure ref={play.ref} className="relative overflow-hidden rounded-[1.4rem] border border-line-subtle bg-surface p-4 shadow-edge sm:p-8">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_40%,rgb(62_137_255_/_0.08),transparent_70%)]" />
            <div className="relative">
              <ArchitectureDiagram copy={t.diagram} paused={userPaused || !play.visible} />
            </div>
            <figcaption className="relative mt-6 flex flex-col-reverse gap-3 border-t border-line-subtle pt-5 md:flex-row md:items-start md:gap-6">
              <span className="max-w-[80ch] min-w-0 flex-1 text-caption leading-relaxed text-fg-tertiary">{t.diagram.caption}</span>
              <span aria-hidden className="flex shrink-0 flex-wrap items-center gap-4 text-caption text-fg-tertiary">
                <span className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-6 rounded-full bg-brand-gradient" />
                  {t.diagram.data}
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="w-6 border-t border-dashed border-line-control" />
                  {t.diagram.control}
                </span>
              </span>
            </figcaption>
            {play.armed ? (
              <MotionToggle
                paused={userPaused}
                onToggle={() => setUserPaused((value) => !value)}
                pauseLabel={t.pause}
                playLabel={t.play}
                className="absolute top-4 right-4"
              />
            ) : null}
          </figure>
        </HudFrame>

        <p className="reveal mt-5 text-caption text-fg-tertiary">{t.setup}</p>

        <div className="mt-12 grid gap-10">
          <figure className="reveal grid gap-3">
            <RealScreen
              screen="components-pipeline-graph"
              crop="graph"
              hotspots={['graph.te', 'graph.dit', 'graph.audio']}
              hud="REAL UI · COMPONENTS · PIPELINE fl2va-pc"
              displayWidth="min(76rem, 94vw)"
            />
            <figcaption className="max-w-[90ch] text-caption leading-relaxed text-fg-tertiary">{t.real.graph}</figcaption>
          </figure>
          <figure className="reveal grid gap-3">
            <RealScreen
              screen="records-run-steps"
              crop="timeline"
              hotspots={['run.te', 'run.audio', 'run.mux']}
              hud="REAL UI · RECORDS · STEP TIMELINE"
              badge="top-right"
              orbit
              displayWidth="min(76rem, 94vw)"
            />
            <figcaption className="max-w-[90ch] text-caption leading-relaxed text-fg-tertiary">{t.real.timeline}</figcaption>
          </figure>
        </div>

        <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:gap-5">
          <article className="reveal grid gap-6 rounded-3xl border border-line-subtle bg-surface p-6 shadow-edge sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)] lg:col-span-2">
            <div className="flex flex-col gap-4">
              <ArtImage art="nodes" size={112} fallback={Boxes} className="-mt-2 -ml-2" />
              <h3 className="text-[1.375rem] leading-tight font-semibold text-fg">{t.process.title}</h3>
              <p className="text-reading text-fg-secondary">{t.process.body}</p>
            </div>
            <figure className="grid content-start gap-3">
              <RealScreen screen="component-inspector-precision" crop="inspector" hud="REAL UI · INSPECTOR" badge="top-right" displayWidth="16rem" />
              <figcaption className="text-caption leading-relaxed text-fg-tertiary">{t.real.inspector}</figcaption>
            </figure>
          </article>
          <article className="reveal flex flex-col gap-4 rounded-3xl border border-line-subtle bg-surface p-6 shadow-edge sm:p-8">
            <span aria-hidden className="grid size-14 place-items-center rounded-2xl border border-action/25 bg-brand-gradient-soft text-brand-cyan">
              <Network className="size-6" />
            </span>
            <h3 className="text-[1.375rem] leading-tight font-semibold text-fg">{t.direct.title}</h3>
            <p className="text-reading text-fg-secondary">{t.direct.body}</p>
          </article>
          <article className="reveal relative grid gap-6 overflow-hidden rounded-3xl border border-dashed border-line-strong bg-canvas p-6 sm:p-8 lg:col-span-3 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-10">
            <div className="flex items-start justify-between gap-3 lg:flex-col lg:justify-start">
              <ArtImage art="rent" size={112} fallback={CloudCog} className="-mt-2 -ml-2" />
              <Chip>{common.designGoal}</Chip>
            </div>
            <div className="grid content-start gap-4">
              <h3 className="text-[1.375rem] leading-tight font-semibold text-fg">{t.rent.title}</h3>
              <p className="max-w-[70ch] text-reading text-fg-secondary">{t.rent.body}</p>
              <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
                {t.rent.steps.map((step, index) => (
                  <li key={step} className="inline-flex items-center gap-1.5">
                    {index > 0 ? <ArrowRight className="size-3.5 text-fg-tertiary" aria-hidden /> : null}
                    <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-caption text-fg-secondary">{step}</span>
                  </li>
                ))}
              </ol>
              <p className="max-w-[80ch] text-caption leading-relaxed text-fg-tertiary">{t.rent.today}</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
