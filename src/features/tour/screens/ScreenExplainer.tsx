import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useEffect, useId, useState, useSyncExternalStore, type CSSProperties, type FocusEvent } from 'react';
import { CountUp, DecodeText, HudFrame, RevealText, SpotlightCard } from '../../../components/fx/index.ts';
import { cn } from '../../../lib/cn.ts';
import { useHydrated, useInView, useReducedMotion } from '../../../lib/hooks.ts';
import type { ExplainerCopy, TourCopy } from '../copy.ts';
import { RichText, plainText } from '../RichText.tsx';
import { DEVICE_DOT, DEVICE_LABEL } from '../runs.ts';
import type { ExplainerSpec } from '../screens.ts';
import { ScreenViewer } from './ScreenViewer.tsx';

const DWELL_MS = 5200;

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange);
  return () => document.removeEventListener('visibilitychange', onChange);
}

/** Whether the tab is visible (true on the server). */
function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true,
  );
}

interface ScreenExplainerProps {
  spec: ExplainerSpec;
  copy: ExplainerCopy;
  screens: TourCopy['screens'];
  /** Put the step panel on the left on wide screens (alternating rows). */
  flip?: boolean;
}

/**
 * A step-through over real captures: each step moves the camera to the part being explained and highlights it. Autoplay runs one
 * cycle while the explainer is on screen and pauses on hover, focus, a hidden tab or the user's Pause; picking a step takes over.
 * Reduced motion: no autoplay, the camera jumps. Without JavaScript every step is listed in full under the capture.
 */
export function ScreenExplainer({ spec, copy, screens, flip = false }: ScreenExplainerProps) {
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const pageVisible = usePageVisible();
  const [rootRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px', threshold: 0.4 });
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(true);
  const [hold, setHold] = useState(false);
  const [announce, setAnnounce] = useState(false);
  const panelId = useId();

  const total = spec.steps.length;
  const step = spec.steps[index] ?? spec.steps[0]!;
  const text = copy.steps[index] ?? copy.steps[0]!;
  const running = hydrated && !reducedMotion && auto && inView && !hold && pageVisible;

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setAnnounce(false);
      if (index + 1 >= total) setAuto(false);
      else setIndex(index + 1);
    }, DWELL_MS);
    return () => window.clearTimeout(timer);
  }, [running, index, total]);

  const go = (next: number) => {
    setIndex((next + total) % total);
    setAuto(false);
    setAnnounce(true);
  };

  const togglePlay = () => {
    if (auto) {
      setAuto(false);
      return;
    }
    if (index + 1 >= total) setIndex(0);
    setAnnounce(false);
    setAuto(true);
  };

  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHold(false);
  };

  const caption = screens.captures[step.key];

  return (
    <div
      ref={rootRef}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setHold(true)}
      onPointerLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={onBlur}
      className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:gap-10"
    >
      <figure className={cn('reveal grid min-w-0 gap-3', flip && 'lg:order-2')}>
        <HudFrame label={`REAL CAPTURE · ${spec.hud}`} orbit={running} innerClassName="rounded-[0.9rem]">
          <ScreenViewer
            key={step.key}
            capture={step.key}
            alt={caption}
            focus={step.focus}
            drift
            pending={{ title: screens.pendingTitle, body: screens.pendingBody }}
            className="motion-safe:animate-fade-in"
          />
        </HudFrame>
        <figcaption className="text-caption text-fg-tertiary [text-wrap:pretty]">
          <span className="text-fg-secondary">{caption}</span> · <RichText text={copy.caption} />
        </figcaption>
      </figure>

      <SpotlightCard tilt={0} className={cn('reveal min-w-0 rounded-3xl border-line-subtle bg-[rgb(11_17_32_/_0.82)]', flip && 'lg:order-1')}>
        <div className="grid gap-5 p-5 sm:p-7">
          <div className="grid gap-3">
            <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
              <span className="tour-eyebrow-line w-8" />
              <DecodeText text={spec.eyebrow} />
            </p>
            <RevealText as="h3" text={copy.title} on="view" className="text-[1.5rem] leading-tight font-semibold tracking-display text-balance-cjk text-fg sm:text-[1.75rem]" />
            <p className="text-body text-fg-secondary [text-wrap:pretty]">
              <RichText text={copy.intro} />
            </p>
          </div>

          <ol id={panelId} aria-label={screens.controls.steps} className="grid gap-1.5">
            {copy.steps.map((item, i) => {
              const current = i === index;
              const expanded = !hydrated || current;
              const readout = spec.steps[i]?.readout;
              return (
                <li key={item.title} className={cn('tour-step rounded-xl border', current && hydrated ? 'border-action/40 bg-brand-gradient-soft' : 'border-transparent')}>
                  <button
                    type="button"
                    onClick={() => go(i)}
                    aria-current={current && hydrated ? 'step' : undefined}
                    className="pressable flex w-full min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-left text-data font-medium text-fg hover:bg-raised/50"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'machine grid size-6 shrink-0 place-items-center rounded-full border text-[11px]',
                        current && hydrated ? 'border-brand-cyan/70 text-brand-cyan shadow-[0_0_10px_rgb(73_207_255_/_0.45)]' : 'border-line-strong text-fg-tertiary',
                      )}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">{item.title}</span>
                  </button>
                  <div className={cn('grid transition-[grid-template-rows] duration-(--duration-spring-smooth) ease-(--ease-spring-smooth)', expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
                    <div className="overflow-hidden" {...(expanded ? {} : { inert: true })}>
                      <div className="grid gap-2 px-3 pb-3 pl-12 text-body text-fg-secondary [text-wrap:pretty]">
                        <p>
                          <RichText text={item.body} />
                        </p>
                        {readout ? (
                          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-fg-tertiary">
                            <span aria-hidden className={cn('size-1.5 rounded-full', DEVICE_DOT[readout.device])} />
                            <span className="machine text-data font-semibold text-fg">
                              <CountUp value={readout.seconds} decimals={1} /> s
                            </span>
                            <span lang="en">{DEVICE_LABEL[readout.device]}</span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {hydrated ? (
            <div className="grid gap-3 border-t border-line-subtle pt-4">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => go(index - 1)} aria-controls={panelId} aria-label={screens.controls.prev} title={screens.controls.prev} className="pressable inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-raised text-fg-secondary hover:border-action/60 hover:text-fg">
                  <ChevronLeft className="size-4" aria-hidden />
                </button>
                {!reducedMotion ? (
                  <button type="button" onClick={togglePlay} aria-pressed={auto} aria-label={auto ? screens.controls.pause : screens.controls.play} title={auto ? screens.controls.pause : screens.controls.play} className="pressable inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-raised text-fg-secondary hover:border-action/60 hover:text-fg">
                    {auto ? <Pause className="size-3.5 fill-current" aria-hidden /> : <Play className="ml-px size-3.5 fill-current" aria-hidden />}
                  </button>
                ) : null}
                <button type="button" onClick={() => go(index + 1)} aria-controls={panelId} aria-label={screens.controls.next} title={screens.controls.next} className="pressable inline-flex size-9 items-center justify-center rounded-full border border-line-strong bg-raised text-fg-secondary hover:border-action/60 hover:text-fg">
                  <ChevronRight className="size-4" aria-hidden />
                </button>
                <span className="machine ml-auto text-[11px] tracking-[0.18em] text-fg-tertiary" lang="en" aria-hidden>
                  STEP {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
              </div>
              <span aria-hidden className="relative h-0.5 overflow-hidden rounded-full bg-line-subtle">
                <span
                  key={`${index}-${auto}`}
                  className={cn('tour-reel-dwell absolute inset-0 bg-brand-gradient', !running && '[animation-play-state:paused]', !auto && 'opacity-0')}
                  style={{ '--tour-dwell': `${DWELL_MS}ms` } as CSSProperties}
                />
              </span>
              <p className="sr-only" aria-live={announce ? 'polite' : 'off'}>
                {screens.controls.step(index + 1, total)}: {text.title}. {plainText(text.body)}
              </p>
            </div>
          ) : null}
        </div>
      </SpotlightCard>
    </div>
  );
}
