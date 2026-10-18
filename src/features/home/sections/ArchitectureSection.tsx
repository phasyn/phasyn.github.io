import { ArrowRight, Boxes, CloudCog, Network } from 'lucide-react';
import { useState } from 'react';
import { useMockPlayback } from '../../../components/mock/index.ts';
import { Chip } from '../../../components/ui/Chip.tsx';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { ArtImage } from '../components/ArtImage.tsx';
import { MotionToggle } from '../components/MotionToggle.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';
import { ArchitectureDiagram } from './architecture/ArchitectureDiagram.tsx';

/** Distributed architecture: animated diagram, what it means, and the honest "rent a machine" direction. */
export function ArchitectureSection() {
  const locale = useLocale();
  const t = useCopy(HOME).architecture;
  const common = commonCopy(locale);
  const play = useMockPlayback<HTMLDivElement>({ threshold: 0.15 });
  const [userPaused, setUserPaused] = useState(false);

  return (
    <section aria-labelledby="architecture-title" className="site-section relative">
      <div className="site-container">
        <SectionHeading id="architecture-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <figure ref={play.ref} className="reveal relative mt-14 overflow-hidden rounded-3xl border border-line-subtle bg-surface p-4 shadow-edge sm:p-8">
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_40%,rgb(62_137_255_/_0.08),transparent_70%)]" />
          <div className="relative">
            <ArchitectureDiagram copy={t.diagram} paused={userPaused || !play.visible} />
          </div>
          <figcaption className="relative mt-6 flex flex-wrap items-start gap-x-6 gap-y-3 border-t border-line-subtle pt-5">
            <span className="max-w-[80ch] flex-1 text-caption leading-relaxed text-fg-tertiary">{t.diagram.caption}</span>
            <span aria-hidden className="flex shrink-0 items-center gap-4 text-caption text-fg-tertiary">
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

        <p className="reveal mt-5 text-caption text-fg-tertiary">{t.setup}</p>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <article className="reveal flex flex-col gap-4 rounded-3xl border border-line-subtle bg-surface p-6 shadow-edge sm:p-8">
            <ArtImage art="nodes" size={112} fallback={Boxes} className="-mt-2 -ml-2" />
            <h3 className="text-[1.375rem] leading-tight font-semibold text-fg">{t.process.title}</h3>
            <p className="text-reading text-fg-secondary">{t.process.body}</p>
          </article>
          <article className="reveal flex flex-col gap-4 rounded-3xl border border-line-subtle bg-surface p-6 shadow-edge sm:p-8">
            <span aria-hidden className="grid size-14 place-items-center rounded-2xl border border-action/25 bg-brand-gradient-soft text-brand-cyan">
              <Network className="size-6" />
            </span>
            <h3 className="text-[1.375rem] leading-tight font-semibold text-fg">{t.direct.title}</h3>
            <p className="text-reading text-fg-secondary">{t.direct.body}</p>
          </article>
          <article className="reveal relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-dashed border-line-strong bg-canvas p-6 sm:p-8 md:col-span-2 lg:col-span-1">
            <div className="flex items-start justify-between gap-3">
              <ArtImage art="rent" size={112} fallback={CloudCog} className="-mt-2 -ml-2" />
              <Chip>{common.planned}</Chip>
            </div>
            <h3 className="text-[1.375rem] leading-tight font-semibold text-fg">{t.rent.title}</h3>
            <p className="text-reading text-fg-secondary">{t.rent.body}</p>
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2">
              {t.rent.steps.map((step, index) => (
                <li key={step} className="inline-flex items-center gap-1.5">
                  {index > 0 ? <ArrowRight className="size-3.5 text-fg-tertiary" aria-hidden /> : null}
                  <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-caption text-fg-secondary">{step}</span>
                </li>
              ))}
            </ol>
            <p className="text-caption leading-relaxed text-fg-tertiary">{t.rent.today}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
