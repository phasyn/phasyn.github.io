import { ArrowRight, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { HudFrame } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useReducedMotion } from '../../lib/hooks.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { ClipPlayer } from './ClipPlayer.tsx';
import { SHOWCASE } from './copy.ts';
import { BREAKDOWN, MACHINE_HOST, MACHINE_HOST_LABEL, MACHINE_ORDER, formatSeconds, itemBySlug, laneOf, shortRun, type MachineKey, type ShowcaseItem } from './data.ts';
import { useViewTrigger } from './hooks.ts';
import { AiBadge, MachineDot, MachineName, PromptDisclosure, SectionHeading, useSecondsText, useStepName } from './parts.tsx';

/** Seconds of animation for the whole run (the playhead moves linearly; DESIGN_GUIDE §11.5). */
const PLAY_SECONDS = 5.2;

/**
 * "One prompt → still → clip with sound": the rain still becomes the rain clip's first frame, then the clip's run is laid
 * out machine by machine as it happened (positions from the run's Step Timeline in Records), with the real capture.
 */
export function Breakdown() {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const still = itemBySlug(BREAKDOWN.still);
  const clip = itemBySlug(BREAKDOWN.clip);
  const secondsText = useSecondsText();
  if (!still || !clip) return null;

  return (
    <section id="breakdown" aria-labelledby="breakdown-title" className="relative isolate overflow-hidden border-y border-line-subtle bg-[rgb(4_6_12_/_0.82)] py-[clamp(4rem,2.5rem+6vw,8rem)]">
      <div className="site-container">
        <SectionHeading id="breakdown-title" eyebrow={copy.breakdown.eyebrow} title={copy.breakdown.title} lead={copy.breakdown.lead} />

        <ol className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-5">
          <li className="grid gap-4">
            <StageLabel index={1} label={copy.breakdown.stages.still} />
            <div className="relative overflow-hidden rounded-2xl border border-line shadow-raised">
              <ClipPlayer item={still} sizes="(min-width: 1024px) 44vw, 100vw" />
              <AiBadge className="absolute top-3 left-3" />
            </div>
            <p className="machine text-caption text-fg-secondary">{copy.breakdown.stillMeta(still.seed, formatSeconds(still.endToEndSeconds ?? 0))}</p>
            <PromptDisclosure prompt={still.prompt} summary={copy.breakdown.stillPrompt} />
          </li>

          <li aria-hidden className="hidden h-full flex-col items-center justify-center gap-3 pt-10 lg:flex">
            <span className="sc-flow-arrow grid size-12 place-items-center rounded-full border border-brand-cyan/50 bg-[rgb(7_11_20_/_0.8)] text-brand-cyan shadow-glow-sm">
              <ArrowRight className="size-5" />
            </span>
          </li>

          <li className="grid gap-4">
            <StageLabel index={2} label={copy.breakdown.stages.clip} />
            <div className="relative overflow-hidden rounded-2xl border border-line shadow-raised">
              <ClipPlayer item={clip} sizes="(min-width: 1024px) 44vw, 100vw" variant="full" />
              <AiBadge className="absolute top-3 left-3" />
              <span className="pointer-events-none absolute top-3 right-3 inline-flex min-h-6 items-center rounded-full border border-[rgb(255_255_255_/_0.14)] bg-[rgb(7_11_20_/_0.72)] px-2.5 text-caption text-fg-secondary backdrop-blur-sm">
                {copy.breakdown.stages.frame}: {copy.breakdown.frameMeta}
              </span>
            </div>
            <p className="machine text-caption text-fg-secondary">{copy.breakdown.clipMeta(clip.seed, clip.frames ?? 0, formatSeconds(clip.endToEndSeconds ?? 0))}</p>
            <PromptDisclosure prompt={clip.prompt} summary={copy.breakdown.clipPrompt} />
          </li>
        </ol>

        <MachineTimeline item={clip} title={copy.breakdown.timelineTitle(formatSeconds(clip.endToEndSeconds ?? 0))} />

        <figure className="mt-12 grid gap-3">
          <HudFrame label={`RECORDS · RUN ${shortRun(clip.runId)}`} innerClassName="bg-stage">
            <img
              src={BREAKDOWN.capture.src}
              srcSet={`${BREAKDOWN.capture.src} 1920w, ${BREAKDOWN.capture.src2x} 3840w`}
              sizes="(min-width: 1280px) 1200px, 100vw"
              width={BREAKDOWN.capture.width}
              height={BREAKDOWN.capture.height}
              alt={copy.breakdown.capture}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full"
            />
          </HudFrame>
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-fg-tertiary">
            <span>{copy.breakdown.capture}</span>
            <span aria-hidden>·</span>
            <span className="machine">
              {copy.card.endToEnd} {secondsText(clip.endToEndSeconds)}
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function StageLabel({ index, label }: { index: number; label: string }) {
  return (
    <p className="flex items-center gap-3 text-caption font-semibold text-fg-secondary">
      <span lang="en" className="machine grid size-7 place-items-center rounded-full border border-brand-cyan/50 text-[11px] text-brand-cyan">
        {String(index).padStart(2, '0')}
      </span>
      {label}
    </p>
  );
}

const TICK = 10;

/**
 * The run, machine by machine: one lane per machine, each step a bar at its start and length, a linear playhead and a
 * T+ readout. Bars fill as the playhead passes; video and audio decode visibly run side by side on two GPUs. Static
 * (complete) under reduced motion and before the chart scrolls into view without JavaScript.
 */
function MachineTimeline({ item, title }: { item: ShowcaseItem; title: string }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale];
  const stepName = useStepName();
  const secondsText = useSecondsText();
  const reducedMotion = useReducedMotion();
  const [ref, state] = useViewTrigger<HTMLDivElement>(reducedMotion);
  const [round, setRound] = useState(0);
  const clockRef = useRef<HTMLSpanElement>(null);
  const total = item.endToEndSeconds ?? item.steps.reduce((sum, step) => sum + (step.seconds ?? 0), 0);
  const k = PLAY_SECONDS / total;
  const machines = MACHINE_ORDER.filter((machine) => item.steps.some((step) => laneOf(step) === machine));
  const ticks = Array.from({ length: Math.floor(total / TICK) + 1 }, (_, i) => i * TICK);
  const steps = item.steps.map((step) => ({ step, start: BREAKDOWN.starts[step.id] ?? 0, seconds: step.seconds ?? 0 }));

  // T+ readout follows the playhead (text only; the final value is in the HTML).
  useEffect(() => {
    const clock = clockRef.current;
    if (!clock || state !== 'play') return;
    const started = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / 1000 / PLAY_SECONDS);
      clock.textContent = (t * total).toFixed(1);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      clock.textContent = total.toFixed(1);
    };
  }, [state, round, total]);

  return (
    <figure className="mt-16 grid gap-5" aria-labelledby="sc-timeline-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h3 id="sc-timeline-title" className="text-headline tracking-display text-balance-cjk text-fg">
          {title}
        </h3>
        <div className="flex items-center gap-3">
          <p lang="en" className="machine text-data text-fg-secondary" aria-hidden>
            T+ <span ref={clockRef} className="inline-block min-w-[4ch] text-right font-semibold text-fg tabular-nums">{total.toFixed(1)}</span> s
          </p>
          {state ? (
            <button
              type="button"
              onClick={() => setRound((value) => value + 1)}
              className="pressable inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-raised px-4 text-caption font-semibold text-fg hover:border-action/60"
            >
              <RotateCcw aria-hidden className="size-3.5" />
              {copy.breakdown.replay}
            </button>
          ) : null}
        </div>
      </div>

      <HudFrame label={`RUN ${shortRun(item.runId)} · ${item.pipeline}`} innerClassName="bg-[rgb(7_11_20_/_0.9)]">
        <div ref={ref} data-state={state ?? undefined} className="sc-timeline p-4 md:p-6" aria-hidden style={{ '--sc-total': `${PLAY_SECONDS}s` } as CSSProperties}>
          <div key={round} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 md:gap-x-5">
            <div className="grid content-start gap-3 pt-7">
              {machines.map((machine) => (
                <LaneLabel key={machine} machine={machine} />
              ))}
            </div>
            <div className="sc-track relative">
              <div className="relative mb-2 h-5 text-[11px] text-fg-tertiary">
                {ticks.map((t) => (
                  <span key={t} lang="en" className={cn('machine absolute top-0 tabular-nums', t === 0 ? '' : '-translate-x-1/2')} style={{ left: `${(t / total) * 100}%` }}>
                    {t}s
                  </span>
                ))}
              </div>
              <div className="grid gap-3">
                {machines.map((machine) => {
                  const own = steps.filter(({ step }) => laneOf(step) === machine);
                  return (
                    <div key={machine} className="relative min-h-10 rounded-lg bg-[rgb(255_255_255_/_0.035)] [background-image:repeating-linear-gradient(90deg,rgb(255_255_255_/_0.05)_0_1px,transparent_1px_calc(100%/6))]">
                      {own.map(({ step, start, seconds }) => {
                        const left = (start / total) * 100;
                        const width = Math.max(0.7, (seconds / total) * 100);
                        const inside = width > 9;
                        // A short bar alone in its lane is labelled beside it (towards the open side); short bars next to a
                        // long one stay unlabelled here — the list below names every step.
                        const beside = !inside && own.length === 1;
                        const style = { left: `${left}%`, width: `${width}%`, '--sc-d': `${(start * k).toFixed(3)}s`, '--sc-len': `${Math.max(0.12, seconds * k).toFixed(3)}s` } as CSSProperties;
                        return (
                          <span key={step.id} className="absolute inset-y-1.5" style={style}>
                            <span className={cn('sc-bar absolute inset-0 rounded-md', `sc-seg-${machine}`)} />
                            {inside || beside ? (
                              <span
                                className={cn(
                                  'sc-bar-label absolute top-1/2 -translate-y-1/2 text-[11px] font-semibold whitespace-nowrap',
                                  inside ? 'left-2 text-[#fff]' : left > 70 ? 'right-full mr-2 text-fg-secondary' : 'left-full ml-2 text-fg-secondary',
                                )}
                              >
                                {stepName(step)} <span className="machine tabular-nums">{formatSeconds(seconds)}s</span>
                              </span>
                            ) : null}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <span className="sc-playhead pointer-events-none absolute top-6 bottom-0 left-0 w-0.5 rounded-full bg-playhead shadow-[0_0_12px_var(--color-playhead)]" />
            </div>
          </div>
        </div>
      </HudFrame>

      <ol className="grid gap-x-8 gap-y-2 text-caption sm:grid-cols-2 lg:grid-cols-3">
        {steps.map(({ step, start, seconds }) => (
          <li key={step.id} className="flex items-baseline gap-2">
            <MachineDot machine={laneOf(step)} className="translate-y-[-1px]" />
            <span className="font-medium text-fg">{stepName(step)}</span>
            <span className="text-fg-tertiary">
              <MachineName machine={laneOf(step)} />
            </span>
            <span className="machine ml-auto text-fg-secondary tabular-nums">
              {secondsText(seconds)} <span className="text-fg-tertiary">@ {formatSeconds(start)}s</span>
            </span>
          </li>
        ))}
      </ol>
      <figcaption className="max-w-[75ch] text-caption text-fg-tertiary">{copy.breakdown.timelineNote}</figcaption>
    </figure>
  );
}

function LaneLabel({ machine }: { machine: MachineKey }) {
  const host = machine === 'unknown' ? null : MACHINE_HOST[machine];
  return (
    <span className="flex min-h-10 items-center gap-2 text-caption">
      <MachineDot machine={machine} />
      <span className="grid leading-tight">
        <span className="font-semibold whitespace-nowrap text-fg">
          <MachineName machine={machine} />
        </span>
        {host ? (
          <span lang="en" className="text-[11px] text-fg-tertiary">
            {MACHINE_HOST_LABEL[host]}
          </span>
        ) : null}
      </span>
    </span>
  );
}
