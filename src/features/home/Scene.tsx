import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { RevealText } from '../../components/fx/index.ts';
import { CaptureStage, type CaptureStep } from '../../components/media/CaptureStage.tsx';
import { useCopy } from '../../i18n/locale.tsx';
import { cn } from '../../lib/cn.ts';
import { useHydrated, useReducedMotion } from '../../lib/hooks.ts';
import type { CaptureKey } from '../../site/captures.ts';
import { HOME } from './copy.ts';

interface SceneProps {
  id: string;
  /** Running number of the scene among those shown ("01"). */
  index: number;
  /** Short Latin HUD tag (decorative). */
  tag: string;
  title: string;
  lead: string;
  /** Small print under the lead. */
  note?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/**
 * One keynote scene: a HUD index, one headline that rises out of a glow (RevealText), one sentence, one picture. Everything
 * is in the prerendered HTML; the motion is decorative and absent under reduced motion.
 */
export function Scene({ id, index, tag, title, lead, note, children, className }: SceneProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn('home-scene relative', className)}>
      <div className="site-container grid justify-items-center gap-5 text-center">
        <SceneHeading id={id} index={index} tag={tag} title={title} lead={lead} note={note} />
        {children}
      </div>
    </section>
  );
}

function SceneHeading({
  id,
  index,
  tag,
  title,
  lead,
  note,
}: Pick<SceneProps, 'id' | 'index' | 'tag' | 'title' | 'lead' | 'note'>) {
  return (
    <>
      <p aria-hidden lang="en" className="eyebrow home-tag text-on-fx flex items-center gap-3 text-brand-cyan">
        <span className="home-tag-line" />
        <span className="machine">{String(index).padStart(2, '0')}</span>
        <span className="text-fg-tertiary">·</span>
        {tag}
        <span className="home-tag-line [transform-origin:right_center]" />
      </p>
      <RevealText
        as="h2"
        id={`${id}-title`}
        text={title}
        on="view"
        className="home-title max-w-[18ch] tracking-display text-balance-cjk text-fg"
      />
      <p className="reveal text-on-fx max-w-[36em] text-lead text-balance-cjk text-fg-secondary">{lead}</p>
      {note ? <p className="reveal text-on-fx -mt-2 text-caption text-fg-secondary">{note}</p> : null}
    </>
  );
}

/**
 * The step a pinned scene is on, from how far the page has scrolled through it (the scene is taller than the screen and its
 * content sticks, see `.home-pin`). Without a pin (reduced motion) the visitor picks a step; `pick` scrolls to it otherwise.
 */
function useScrollSteps(count: number) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const driven = hydrated && !reduced && count > 1;

  useEffect(() => {
    const section = ref.current;
    if (!driven || !section) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel < window.innerHeight * 0.2) return;
      const progress = Math.min(Math.max(-rect.top / travel, 0), 0.999);
      setActive(Math.floor(progress * count));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [driven, count]);

  const pick = useCallback(
    (index: number) => {
      const section = ref.current;
      if (!driven || !section) {
        setActive(index);
        return;
      }
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      if (travel < window.innerHeight * 0.2) {
        setActive(index);
        return;
      }
      const top = window.scrollY + rect.top + ((index + 0.5) / count) * travel;
      window.scrollTo({ top, behavior: 'smooth' });
    },
    [driven, count],
  );

  return { ref, active, pick };
}

interface CaptureSceneProps extends Omit<SceneProps, 'children'> {
  capture: CaptureKey;
  alt: string;
  steps: readonly CaptureStep[];
}

/**
 * A scene whose picture is a real capture with one or more focus steps, one screen tall. With several steps it pins while it scrolls:
 * the camera and the spotlight move from step to step, one label at a time; the step buttons under it do the same.
 */
export function CaptureScene({ id, index, tag, title, lead, note, capture, alt, steps, className }: CaptureSceneProps) {
  const label = useCopy(HOME).stepsLabel;
  const { ref, active, pick } = useScrollSteps(steps.length);
  const many = steps.length > 1;
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('home-pin relative', className)}
      style={{ '--steps': steps.length }}
    >
      <div className="site-container home-pin-inner">
        <div className="grid w-full justify-items-center gap-5 text-center">
          <SceneHeading id={id} index={index} tag={tag} title={title} lead={lead} note={note} />
          <div className="home-stage relative mt-4 w-full max-w-[68rem] md:mt-8">
            <div
              aria-hidden
              className="glow-backdrop pointer-events-none absolute -inset-x-[6%] -inset-y-[10%] -z-10"
            />
            <CaptureStage capture={capture} alt={alt} steps={steps} active={active} displayWidth="min(100vw, 68rem)" />
          </div>
          {many ? (
            <div role="group" aria-label={label} className="flex max-w-full flex-wrap justify-center gap-2">
              {steps.map((step, i) => (
                <button
                  key={step.label}
                  type="button"
                  aria-pressed={i === active}
                  onClick={() => {
                    pick(i);
                  }}
                  className={cn(
                    'pressable inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-caption font-medium',
                    i === active
                      ? 'border-brand-cyan/60 bg-brand-gradient-soft text-fg'
                      : 'border-line bg-raised/60 text-fg-secondary hover:border-action/50 hover:text-fg',
                  )}
                >
                  <span aria-hidden className="machine text-[11px] text-fg-tertiary">
                    {String(i + 1)}
                  </span>
                  {step.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
