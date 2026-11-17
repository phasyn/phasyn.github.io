import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { AboutHero } from './AboutHero.tsx';
import { ArtAside, CUTOUTS } from './art.tsx';
import { ContactPanel } from './ContactPanel.tsx';
import { ABOUT } from './copy.ts';
import { CapabilityGrid, PipelineFigure, RentalFigure, SetupFigure } from './figures.tsx';
import { cn } from '../../lib/cn.ts';
import { Lead, Prose, Statement, StorySection, useBodyClass, useDisplayBreak } from './parts.tsx';
import { SectionIndex } from './SectionIndex.tsx';
import { StatusChip } from './status.tsx';

/**
 * About: the author's story of why Phasyn Studio exists, as an editorial long-read.
 * Everything is in the prerendered HTML; motion is CSS only (rise-in on the hero, scroll `reveal`
 * on figures) and disappears under prefers-reduced-motion. The only script-driven detail is the
 * current-chapter marker in the index.
 */
/** The reading veil's gradient (see the article below): solid 84 % canvas under the text, eased fades in the bleeds. */
const READING_VEIL = [
  'linear-gradient(90deg',
  'rgb(7 11 20 / 0)',
  'rgb(7 11 20 / 0.5) calc(var(--veil-left) * 0.55)',
  'rgb(7 11 20 / 0.84) var(--veil-left)',
  'rgb(7 11 20 / 0.84) calc(100% - var(--veil-right))',
  'rgb(7 11 20 / 0.62) calc(100% - var(--veil-right) * 0.7)',
  'rgb(7 11 20 / 0.32) calc(100% - var(--veil-right) * 0.4)',
  'rgb(7 11 20 / 0.1) calc(100% - var(--veil-right) * 0.15)',
  'rgb(7 11 20 / 0) 100%)',
].join(', ');

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

          {/*
           * Reading veil: the layout's living nebula frames the column but never sits under body text (BRIEF §4.1
           * guardrail). A canvas-coloured band behind the article, solid under the text and fading only in a bleed
           * outside it (the page gutter on narrow screens, so it never passes the viewport). On wide screens the right
           * side fades over 12rem of the empty third column on an eased curve, so it has no hard vertical edge (FE-18);
           * the left keeps 3rem so it never reaches the chapter index. Its top and bottom fade in over 5rem (mask), so the
           * band never starts or ends in a hard horizontal edge. `isolate` keeps it above the fixed backdrop.
           */}
          <article
            aria-labelledby="about-title"
            className="relative isolate mx-auto w-full max-w-[42.5rem] [--veil-left:var(--site-gutter)] [--veil-right:var(--site-gutter)] before:pointer-events-none before:absolute before:inset-y-0 before:-right-(--veil-right) before:-left-(--veil-left) before:-z-10 before:[background-image:var(--veil)] before:[mask-image:linear-gradient(to_bottom,transparent,#000_5rem,#000_calc(100%-5rem),transparent)] lg:col-start-2 lg:row-start-1 lg:[--veil-left:3rem] lg:[--veil-right:12rem]"
            style={{ '--veil': READING_VEIL }}
          >
            <StorySection id="why" title={copy.titles.why}>
              <Lead>{copy.why.lead}</Lead>
              <Prose paragraphs={copy.why.body} className="mt-6" />
              <Statement text={copy.why.statement} />
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
                <Statement text={copy.scale.statement} className="my-0 md:my-0" />
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
          </article>
        </div>
      </div>

      <ContactPanel title={copy.titles.contact} contact={copy.contact} emailLabel={common.emailLabel} />
    </>
  );
}
