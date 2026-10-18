import { Check, Image as ImageIcon, Type, Video } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DecodeText, HudFrame, RevealText } from '../../../components/fx/index.ts';
import { useMockPlayback } from '../../../components/mock/index.ts';
import { useCopy } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';
import { ImagePane, PromptPane, VideoPane } from './pipeline/PipelinePanes.tsx';

const STEP_ICONS = [Type, ImageIcon, Video] as const;
/** Decorative HUD tags (Latin, aria-hidden by the frame). */
const STEP_TAGS = ['TEXT', 'IMAGE · QWEN-IMAGE 2.1', 'VIDEO · H3 FL2VA'] as const;

/** Decorative step rail above the sticky window (the ordered list on the left carries the semantics). */
function StepRail({ labels, active }: { labels: string[]; active: number }) {
  return (
    <div aria-hidden className="flex items-center gap-2">
      {labels.map((label, index) => {
        const state = index < active ? 'done' : index === active ? 'current' : 'pending';
        const Icon = state === 'done' ? Check : STEP_ICONS[index]!;
        return (
          <div key={label} className="flex items-center gap-2">
            {index > 0 ? <span className={cn('h-px w-6 sm:w-10', index <= active ? 'bg-brand-gradient' : 'bg-line-strong')} /> : null}
            <span
              className={cn(
                'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-data font-medium transition-[background-color,border-color,color,box-shadow] duration-(--duration-spring-snappy) ease-(--ease-spring-snappy)',
                state === 'current' && 'border-transparent bg-action-gradient text-[#fff] shadow-glow-sm',
                state === 'done' && 'border-line bg-surface text-fg-secondary',
                state === 'pending' && 'border-line-subtle text-fg-tertiary',
              )}
            >
              <Icon className={cn('size-3.5', state === 'done' && 'text-action-fg')} aria-hidden />
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Pane({ index, active, armed, labels }: { index: number; active: boolean; armed: boolean; labels: ReturnType<typeof usePipelineLabels> }) {
  const label = labels.mockLabels[index] ?? '';
  if (index === 0) return <PromptPane active={active} armed={armed} label={label} />;
  if (index === 1) return <ImagePane active={active} armed={armed} label={label} realBadge={labels.realBadge} />;
  return <VideoPane active={active} armed={armed} label={label} realBadge={labels.realBadge} labels={labels} />;
}

function usePipelineLabels() {
  const t = useCopy(HOME).pipeline;
  return { mockLabels: t.mockLabels, realBadge: t.realBadge, sound: t.sound, mute: t.mute, play: t.play, replay: t.replay };
}

/** Inline pane for narrow layouts: runs when it is on screen. */
function InlinePane({ index, labels }: { index: number; labels: ReturnType<typeof usePipelineLabels> }) {
  const play = useMockPlayback<HTMLDivElement>({ threshold: 0.45 });
  return (
    <div ref={play.ref} className="mt-8">
      <HudFrame label={`0${index + 1} · ${STEP_TAGS[index]}`}>
        <Pane index={index} active={play.visible} armed={play.armed} labels={labels} />
      </HudFrame>
    </div>
  );
}

/**
 * Text → Image → Video as a scroll-told story. Wide layouts: the step texts scroll on the left while one sticky app window on
 * the right swaps panes (prompt typing → GeneratingFrame → the real clip with a linear playhead). Narrow layouts: each step shows
 * its own pane inline. The active step comes from an IntersectionObserver band in the middle of the viewport.
 */
export function PipelineSection() {
  const t = useCopy(HOME).pipeline;
  const labels = usePipelineLabels();
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const windowPlay = useMockPlayback<HTMLDivElement>({ threshold: 0.25 });

  useEffect(() => {
    const steps = stepRefs.current.filter((node): node is HTMLLIElement => node !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveStep(Number((entry.target as HTMLElement).dataset.step ?? 0));
        }
      },
      { rootMargin: '-42% 0px -42% 0px' },
    );
    for (const step of steps) observer.observe(step);
    return () => observer.disconnect();
  }, []);

  return (
    <section aria-labelledby="pipeline-title" className="site-section relative">
      <div className="site-container">
        <SectionHeading id="pipeline-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <div className="mt-14 grid gap-10 md:mt-6 md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] md:gap-12 lg:gap-20">
          <ol aria-label={t.stepsLabel} className="home-steps relative grid gap-16 md:gap-0 md:pl-10">
            <li aria-hidden className="pointer-events-none absolute top-[12vh] bottom-[12vh] left-3 hidden w-px bg-line md:block">
              <span className="home-rail-fill absolute inset-0 block bg-linear-to-b from-brand-cyan via-brand-iris to-brand-violet shadow-[0_0_12px_rgb(73_207_255_/_0.6)]" />
            </li>
            {t.steps.map((step, index) => {
              const Icon = STEP_ICONS[index]!;
              return (
                <li
                  key={step.label}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  data-step={index}
                  {...(index === activeStep ? {} : { 'data-dim': '' })}
                  className="home-step md:flex md:min-h-[82vh] md:flex-col md:justify-center"
                >
                  <div className="reveal grid justify-items-start gap-4">
                    <span className="inline-flex items-center gap-2 text-data font-semibold text-brand-cyan">
                      <span className="grid size-8 place-items-center rounded-lg border border-action/25 bg-brand-gradient-soft">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <DecodeText text={`0${index + 1}`} className="machine text-fg-tertiary" />
                      {step.label}
                    </span>
                    <RevealText as="h3" text={step.title} on="view" className="max-w-[18ch] text-headline tracking-display text-balance-cjk text-fg" />
                    <p className="max-w-[40ch] text-reading text-fg-secondary md:text-[1.0625rem] md:leading-[1.7]">{step.body}</p>
                    <ul className="flex flex-wrap gap-2">
                      {step.points.map((point) => (
                        <li key={point} className="rounded-full border border-line bg-surface px-3 py-1 text-caption text-fg-secondary">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="md:hidden">
                    <InlinePane index={index} labels={labels} />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="relative hidden md:block">
            <div
              ref={windowPlay.ref}
              className="sticky grid gap-5"
              style={{ top: 'calc(var(--site-header-h) + max(1.5rem, (100dvh - var(--site-header-h) - 38rem) / 2))' } as CSSProperties}
            >
              <StepRail labels={t.steps.map((step) => step.label)} active={activeStep} />
              <HudFrame label={`PIPELINE · 0${activeStep + 1}/03 · ${STEP_TAGS[activeStep]}`} orbit scan>
                <div className="relative grid">
                  {t.steps.map((step, index) => {
                    const shown = index === activeStep;
                    return (
                      <div
                        key={step.label}
                        className="home-pane [grid-area:1/1]"
                        {...(shown ? {} : { 'data-inactive': '', inert: true, 'aria-hidden': true })}
                      >
                        <Pane index={index} active={shown && windowPlay.visible} armed={windowPlay.armed} labels={labels} />
                      </div>
                    );
                  })}
                  <span key={activeStep} aria-hidden className="home-pane-sweep" {...(windowPlay.armed ? { 'data-run': '' } : {})} />
                </div>
              </HudFrame>
            </div>
          </div>
        </div>

        <p className="reveal mt-12 max-w-[86ch] text-caption leading-relaxed text-fg-tertiary md:mt-6">{t.caption}</p>
      </div>
    </section>
  );
}
