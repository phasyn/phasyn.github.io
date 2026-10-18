import { X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { HudFrame } from '../../../../components/fx/index.ts';
import { cn } from '../../../../lib/cn.ts';
import type { Updater } from './PainVisuals.tsx';
import { BEATS, BeatText, FinalStatement, TONE_TEXT, type ManifestoCopy } from './shared.tsx';

/** Scroll budget per beat in units of `--home-mf-unit` (home.css): five pain beats, then the longer turn. */
const PAIN = 5;
const FINAL_UNITS = 1.5;
const TOTAL = PAIN + FINAL_UNITS;
/** A beat's visual finishes at this share of its scroll, so the end state holds for a moment before the next beat. */
const HOLD = 0.82;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function Progress({ beat }: { beat: number }) {
  return (
    <div aria-hidden className="flex shrink-0 items-center gap-3">
      <span className="machine hidden text-[11px] tracking-[0.18em] text-fg-tertiary tabular-nums sm:inline">{beat < PAIN ? `0${beat + 1} / 0${PAIN}` : 'PHASYN'}</span>
      <span className="flex items-center gap-1">
        {BEATS.map((meta, index) => (
          <span key={index} className="home-mf-pip" data-tone={meta.tone} {...(index <= beat ? { 'data-on': '' } : {})} />
        ))}
        <span className="home-mf-pip home-mf-pip-final" {...(beat === PAIN ? { 'data-on': '' } : {})} />
      </span>
    </div>
  );
}

/**
 * The manifesto as a pinned, game-like scene: the stage sticks while the section scrolls through five pain beats. Each beat lands
 * with a hit (flash and a short HUD shake), its line rises with the pain words tinted, and its HUD visual plays out with the
 * scroll (credits drain per re-roll, the re-roll slot spins, the ETA bar keeps growing, outputs glitch, the acceleration needle
 * falls back to zero). Spent beats drop into a dim combat log. The last beat turns the scene: the heat clears, a burst of brand
 * light, the mark and 「所以，我決定自己開發。」, and a beam that hands off to the pipeline below.
 *
 * Only mounted with motion allowed on tall enough viewports (ManifestoSection); every line is in the DOM in reading order, the
 * HUD and the log are decorative.
 */
export function ManifestoScene({ t }: { t: ManifestoCopy }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLSpanElement>(null);
  const updaters = useRef<(Updater | undefined)[]>([]);
  const beatRef = useRef(0);
  const [beat, setBeat] = useState(0);

  const registers = useMemo(
    () =>
      BEATS.map((_, index) => (update: Updater) => {
        updaters.current[index] = update;
      }),
    [],
  );

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;
    let frame = 0;
    let listening = false;

    const update = () => {
      frame = 0;
      const distance = Math.max(1, section.offsetHeight - stage.offsetHeight);
      const progress = clamp(-section.getBoundingClientRect().top / distance);
      const units = progress * TOTAL;
      for (let index = 0; index < PAIN; index += 1) updaters.current[index]?.(clamp((units - index) / HOLD));
      stage.style.setProperty('--mf-final', clamp((units - PAIN) / (FINAL_UNITS * 0.7)).toFixed(3));
      const next = units >= PAIN ? PAIN : Math.floor(units);
      if (next !== beatRef.current) {
        beatRef.current = next;
        setBeat(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const listen = (on: boolean) => {
      if (on === listening) return;
      listening = on;
      stage.toggleAttribute('data-live', on);
      if (on) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };
    const observer = new IntersectionObserver(([entry]) => listen(entry?.isIntersecting ?? false), { rootMargin: '120px 0px' });
    observer.observe(section);
    update();
    return () => {
      observer.disconnect();
      listen(false);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Each new beat lands with a hit: a flash in the beat's tone and a short shake of the HUD (WAAPI, one-shot).
  const firstBeat = useRef(true);
  useEffect(() => {
    if (firstBeat.current) {
      firstBeat.current = false;
      return;
    }
    if (beat >= PAIN) return;
    hudRef.current?.animate(
      [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: 'translate3d(-5px, 2px, 0)' },
        { transform: 'translate3d(4px, -2px, 0)' },
        { transform: 'translate3d(-2px, 1px, 0)' },
        { transform: 'translate3d(0, 0, 0)' },
      ],
      { duration: 300, easing: 'ease-out' },
    );
    hitRef.current?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.18 }, { opacity: 0 }], { duration: 560, easing: 'ease-out' });
  }, [beat]);

  // Tabbing to the signature link while an earlier beat is shown: jump to the turn so the focused link is visible.
  const showFinal = () => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage || beatRef.current === PAIN) return;
    const top = window.scrollY + section.getBoundingClientRect().top;
    const distance = section.offsetHeight - stage.offsetHeight;
    window.scrollTo({ top: top + distance * ((PAIN + 0.9) / TOTAL), behavior: 'instant' });
  };

  const current = BEATS[Math.min(beat, PAIN - 1)]!;

  return (
    <section ref={sectionRef} aria-labelledby="manifesto-title" className="home-mf relative">
      <div ref={stageRef} className="home-mf-stage sticky top-0 isolate h-svh overflow-hidden" data-beat={beat} data-tone={beat < PAIN ? current.tone : 'brand'}>
        <div aria-hidden className="absolute inset-0 -z-10">
          <span className="home-mf-grid absolute inset-0" />
          <span className="home-mf-heat absolute inset-0" />
          <span ref={hitRef} className="home-mf-hit absolute inset-0 opacity-0" />
          <span className="home-mf-scan absolute inset-0" />
        </div>

        <div className="home-mf-play site-container relative grid h-full grid-cols-1 grid-rows-[auto_minmax(0,1fr)_auto] gap-5 pt-[calc(var(--site-header-h)+1.25rem)] pb-5 md:gap-6 md:pb-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <p aria-hidden lang="en" className="eyebrow flex shrink-0 items-center gap-3 text-brand-cyan">
                <span className="home-eyebrow-line w-8" />
                {t.eyebrow}
              </p>
              <h2 id="manifesto-title" className="truncate text-section font-semibold text-fg-tertiary">
                {t.heading}
              </h2>
            </div>
            <Progress beat={beat} />
          </div>

          <div className="home-mf-main grid min-h-0 grid-cols-1 content-center gap-6 md:gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:gap-14">
            <ol className="grid min-w-0 grid-cols-1">
              {t.beats.map((line, index) => {
                const meta = BEATS[index]!;
                const state = index === beat ? 'on' : index < beat ? 'past' : 'next';
                return (
                  <li key={index} className="home-mf-line min-w-0 [grid-area:1/1]" data-state={state}>
                    <span aria-hidden className="machine flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase">
                      <span className={cn('font-semibold', TONE_TEXT[meta.tone])}>{`0${index + 1}`}</span>
                      <span className="h-px w-6 bg-line-strong" />
                      <span className="truncate text-fg-tertiary">{meta.tag}</span>
                    </span>
                    <p className="home-beat-text mt-4 max-w-[19em] text-headline font-semibold tracking-display text-balance-cjk text-fg">
                      <BeatText text={line.text} hot={line.hot} tone={meta.tone} />
                    </p>
                  </li>
                );
              })}
            </ol>

            <div ref={hudRef} aria-hidden className="home-mf-hud mx-auto w-full min-w-0 max-w-[36rem]">
              <HudFrame label={current.tag} scan innerClassName="bg-sunken/80">
                <div className="grid p-5 sm:p-7">
                  {BEATS.map((meta, index) => (
                    <div key={index} className="home-mf-visual [grid-area:1/1]" data-state={index === beat ? 'on' : index < beat ? 'past' : 'next'}>
                      <meta.Visual register={registers[index]} />
                    </div>
                  ))}
                </div>
              </HudFrame>
            </div>
          </div>

          <div aria-hidden className="home-mf-log max-w-[32rem]">
            <p className="flex items-center gap-2">
              <span className="home-mf-caret" />
              <span className="home-pain-label">LOG</span>
            </p>
            <ol className="mt-2 grid gap-1.5">
              {t.beats.map((line, index) => {
                const meta = BEATS[index]!;
                return (
                  <li
                    key={index}
                    className="home-mf-log-item flex items-center gap-2.5 text-caption"
                    {...(index < beat ? { 'data-on': '' } : {})}
                    {...(index === beat - 1 ? { 'data-latest': '' } : {})}
                    {...(index >= beat - 2 ? { 'data-recent': '' } : {})}
                  >
                    <span className={cn('machine text-[11px]', TONE_TEXT[meta.tone])}>{`0${index + 1}`}</span>
                    <X className={cn('size-3 shrink-0', TONE_TEXT[meta.tone])} />
                    <span className="min-w-0 truncate">{line.text}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

        <div className="home-mf-final absolute inset-0 grid place-items-center px-4" data-state={beat === PAIN ? 'on' : 'off'} onFocus={showFinal}>
          <span aria-hidden className="home-mf-burst" />
          <span aria-hidden className="home-mf-rays" />
          <FinalStatement t={t} markSize={96} className="home-mf-turn" />
          <span aria-hidden className="home-mf-beam" />
        </div>
      </div>
    </section>
  );
}
