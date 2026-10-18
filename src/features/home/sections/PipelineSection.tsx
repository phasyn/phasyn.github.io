import { Check, Image as ImageIcon, Type, Video } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DecodeText, HudFrame, RevealText } from '../../../components/fx/index.ts';
import { useCopy } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { usePlayback } from '../components/usePlayback.ts';
import { HOME } from '../copy.ts';
import type { HotspotId, ScreenKey } from '../screens.ts';
import { ClipPane, ScreenPane, type ClipLabels } from './pipeline/PipelinePanes.tsx';

const STEP_ICONS = [Type, ImageIcon, Video] as const;
/** Decorative HUD tags (Latin, aria-hidden by the frame). */
const STEP_TAGS = ['TEXT · REAL UI', 'IMAGE · REAL UI', 'VIDEO · REAL OUTPUT'] as const;

/** The real screens of steps 1 and 2 (step 3 is the real clip). */
const STEP_SCREENS: readonly { screen: ScreenKey; hotspots: readonly HotspotId[] }[] = [
  { screen: 'image-studio-generating', hotspots: ['generating.flow', 'generating.te', 'generating.take'] },
  { screen: 'image-studio-takes', hotspots: ['takes.video', 'takes.inUse', 'takes.strip'] },
];

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

interface PaneProps {
  index: number;
  active: boolean;
  armed: boolean;
  notes: string[];
  clip: Omit<ClipLabels, 'note'>;
  /** Narrow layouts: the screen's focused crop in its own HUD frame. */
  inline?: boolean;
}

function Pane({ index, active, armed, notes, clip, inline = false }: PaneProps) {
  const note = notes[index] ?? '';
  const step = STEP_SCREENS[index];
  if (!step) return <ClipPane active={active} armed={armed} labels={{ ...clip, note }} />;
  return inline ? (
    <ScreenPane screen={step.screen} crop="panel" hotspots={step.hotspots} note={note} active={active} framed hud={`0${index + 1} · ${STEP_TAGS[index]}`} displayWidth="min(92vw, 40rem)" />
  ) : (
    <ScreenPane screen={step.screen} hotspots={step.hotspots} note={note} active={active} displayWidth="min(41rem, 52vw)" />
  );
}

/** Inline pane for narrow layouts: runs when it is on screen. */
function InlinePane(props: Omit<PaneProps, 'active' | 'armed' | 'inline'>) {
  const play = usePlayback<HTMLDivElement>({ threshold: 0.45 });
  const content = <Pane {...props} active={play.visible} armed={play.armed} inline />;
  return (
    <div ref={play.ref} className="mt-8">
      {STEP_SCREENS[props.index] ? content : <HudFrame label={`0${props.index + 1} · ${STEP_TAGS[props.index]}`}>{content}</HudFrame>}
    </div>
  );
}

/**
 * Text → Image → Video as a scroll-told story, shown with the real product: the real Image Studio while a prompt is text-encoded,
 * the real Image Studio with the finished take, then a real fl2va clip made from a real still. Wide layouts: the step texts scroll
 * on the left while one sticky HUD window on the right swaps panes. Narrow layouts: each step shows its own pane inline (the
 * screen's focused crop). The active step comes from an IntersectionObserver band in the middle of the viewport.
 */
export function PipelineSection() {
  const t = useCopy(HOME).pipeline;
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const windowPlay = usePlayback<HTMLDivElement>({ threshold: 0.25 });
  const clip = { firstFrame: t.firstFrame, clipLabel: t.clipLabel, realBadge: t.realBadge, sound: t.sound, mute: t.mute, play: t.play, replay: t.replay };

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
                    <InlinePane index={index} notes={t.notes} clip={clip} />
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="relative hidden md:block">
            <div
              ref={windowPlay.ref}
              className="sticky grid gap-5"
              style={{ top: 'calc(var(--site-header-h) + max(1.5rem, (100dvh - var(--site-header-h) - 35rem) / 2))' } as CSSProperties}
            >
              <StepRail labels={t.steps.map((step) => step.label)} active={activeStep} />
              <HudFrame label={`PIPELINE · 0${activeStep + 1}/03 · ${STEP_TAGS[activeStep]}`} orbit>
                <div className="relative grid p-2 sm:p-3">
                  {t.steps.map((step, index) => {
                    const shown = index === activeStep;
                    return (
                      <div
                        key={step.label}
                        className="home-pane [grid-area:1/1]"
                        {...(shown ? {} : { 'data-inactive': '', inert: true, 'aria-hidden': true })}
                      >
                        <Pane index={index} active={shown && windowPlay.visible} armed={windowPlay.armed} notes={t.notes} clip={clip} />
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
