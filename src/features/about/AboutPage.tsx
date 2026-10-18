import { ArrowRight } from 'lucide-react';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { pagePath } from '../../site/config.ts';
import { AboutHero } from './AboutHero.tsx';
import { ArtAside, CUTOUTS } from './art.tsx';
import { ContactPanel } from './ContactPanel.tsx';
import { ABOUT } from './copy.ts';
import { CapabilityGrid, PipelineFigure, RentalFigure, SetupFigure } from './figures.tsx';
import { cn } from '../../lib/cn.ts';
import { AreaArt, Lead, Prose, Statement, StorySection, useBodyClass, useDisplayBreak } from './parts.tsx';
import { Roadmap } from './Roadmap.tsx';
import { SectionIndex } from './SectionIndex.tsx';
import { StatusChip } from './status.tsx';

/**
 * About: the author's story of why Phasyn Studio exists, as an editorial long-read.
 * Everything is in the prerendered HTML; motion is CSS only (rise-in on the hero, scroll `reveal`
 * on figures) and disappears under prefers-reduced-motion. The only script-driven detail is the
 * current-chapter marker in the index.
 */
export function AboutPage() {
  const locale = useLocale();
  const copy = ABOUT[locale];
  const common = commonCopy(locale);
  const display = useDisplayBreak();
  const body = useBodyClass();

  return (
    <>
      <AboutHero copy={copy.hero} personalProject={common.personalProject} />

      <div className="site-container">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,42.5rem)_minmax(0,1fr)] lg:gap-x-12">
          <SectionIndex
            heading={copy.index.heading}
            titles={copy.titles}
            className="mx-auto mt-6 w-full max-w-[42.5rem] lg:col-start-1 lg:row-start-1 lg:mt-0 lg:max-w-none lg:pt-28"
          />

          <article aria-labelledby="about-title" className="mx-auto w-full max-w-[42.5rem] lg:col-start-2 lg:row-start-1">
            <StorySection id="why" title={copy.titles.why}>
              <Lead>{copy.why.lead}</Lead>
              <Prose paragraphs={copy.why.body} className="mt-6" />
              <Statement>{copy.why.statement}</Statement>
              <Prose paragraphs={copy.why.after} />
            </StorySection>

            <StorySection id="built" title={copy.titles.built}>
              <Lead>{copy.built.lead}</Lead>
              <Prose paragraphs={copy.built.body} className="mt-6" />
              <SetupFigure setup={copy.built.setup} />
              <Prose paragraphs={copy.built.after} />
            </StorySection>

            <StorySection id="today" title={copy.titles.today}>
              <Prose paragraphs={[copy.today.intro]} />
              <PipelineFigure label={copy.today.pipelineLabel} steps={copy.today.pipeline} />
              <CapabilityGrid ids={['images', 'references']} capabilities={copy.today.capabilities} />
              <Prose paragraphs={[copy.today.extraIntro]} className="mt-10" />
              <CapabilityGrid ids={['reverse', 'swap']} capabilities={copy.today.capabilities} className="mt-6" />
            </StorySection>

            <StorySection id="scale" title={copy.titles.scale}>
              <ArtAside slug={CUTOUTS.distributedNodes}>
                <Prose paragraphs={copy.scale.body} />
              </ArtAside>
              <Prose paragraphs={copy.scale.rentalText} className="mt-[1.1em]" />
              <RentalFigure rental={copy.scale.rental} />
              <ArtAside slug={CUTOUTS.diagnostics}>
                <Prose paragraphs={[copy.scale.diagnostics]} />
              </ArtAside>
              <ArtAside slug={CUTOUTS.agentSkill} className="mt-12 md:mt-16">
                <Statement className="my-0 md:my-0">{copy.scale.statement}</Statement>
              </ArtAside>
            </StorySection>

            <StorySection id="editing" title={copy.titles.editing}>
              <ArtAside slug={CUTOUTS.promptAdvisor}>
                <Prose paragraphs={copy.editing.body} />
              </ArtAside>
              <div className="mt-6 grid gap-3 rounded-xl border border-line bg-surface p-5 shadow-edge sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                <p className={cn('text-fg [text-wrap:pretty]', body, display)}>{copy.editing.artcraft}</p>
                <StatusChip status="planned" className="justify-self-start" />
              </div>
            </StorySection>

            <StorySection id="roadmap" title={copy.titles.roadmap}>
              <Prose paragraphs={[copy.roadmap.intro]} />
              <Roadmap roadmap={copy.roadmap} />
              <Lead className="mt-12 md:mt-14">{copy.roadmap.outro}</Lead>
            </StorySection>

            <StorySection id="benchmarks" title={copy.titles.benchmarks}>
              <Prose paragraphs={copy.benchmarks.body} />
              <div className="reveal mt-8 grid gap-5 rounded-xl border border-line bg-surface p-5 shadow-edge sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center md:p-6">
                <AreaArt area="records" size={52} />
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-6">
                  <p className={cn('text-body text-fg-secondary [text-wrap:pretty]', display)}>{copy.benchmarks.note}</p>
                  <ButtonLink to={pagePath(locale, 'benchmarks')} variant="primary" size="lg" className="justify-self-start">
                    {copy.benchmarks.cta}
                    <ArrowRight aria-hidden />
                  </ButtonLink>
                </div>
              </div>
            </StorySection>
          </article>
        </div>
      </div>

      <ContactPanel title={copy.titles.contact} contact={copy.contact} emailLabel={common.emailLabel} />
    </>
  );
}
