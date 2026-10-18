import { lazy, Suspense, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { cn } from '../../../lib/cn.ts';
import { supportsWebGL, useHydrated, useReducedMotion } from '../../../lib/hooks.ts';
import type { PointerState } from './FrameStackScene.tsx';
import type { PauseReason } from './quality.ts';
import { SceneBoundary } from './SceneBoundary.tsx';

// three.js, R3F and post-processing live only in this chunk; it is requested after hydration, when the browser is idle.
const HeroCanvas = lazy(() => import('./HeroCanvas.tsx'));

/** Static posters rendered from the live scene (wide for landscape viewports, tall for portrait ones). */
export const HERO_POSTER = {
  wide: { src: '/images/home/hero-poster-wide.webp', width: 1920, height: 1200 },
  tall: { src: '/images/home/hero-poster-tall.webp', width: 860, height: 1720 },
} as const;

const MAX_CONTEXT_LOSSES = 2;

export type HeroStageState = 'poster' | 'loading' | 'live' | 'lost';

interface HeroStageProps {
  /** The hero section: visibility and scroll progress are measured against it. */
  sectionRef: RefObject<HTMLElement | null>;
  /** User pressed pause. */
  userPaused: boolean;
  /** Reports whether a live (animating) scene is on screen, so the owner can show the pause control. */
  onLiveChange: (live: boolean) => void;
  className?: string;
}

function useIdleArm(enabled: boolean): boolean {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!enabled || armed) return;
    const win = window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (win.requestIdleCallback) {
      const id = win.requestIdleCallback(() => setArmed(true), { timeout: 1500 });
      return () => win.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(() => setArmed(true), 400);
    return () => window.clearTimeout(id);
  }, [enabled, armed]);
  return armed;
}

/**
 * Hero background: the poster is always in the HTML (first paint, no-JS, reduced motion, no WebGL, context loss); the live
 * frame-stack scene cross-fades over it once its first frames are drawn. Rendering stops while the hero is off screen, the tab
 * is hidden, the user paused it or the context is lost, and resumes only when no reason remains.
 */
export function HeroStage({ sectionRef, userPaused, onLiveChange, className }: HeroStageProps) {
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [lost, setLost] = useState(false);
  const losses = useRef(0);
  const [reasons, setReasons] = useState<ReadonlySet<PauseReason>>(() => new Set<PauseReason>(['offscreen']));
  const progressRef = useRef(0);
  const pointerRef = useRef<PointerState>({ x: 0, y: 0 });

  const capable = hydrated && !reduced && !failed && supportsWebGL();
  const armed = useIdleArm(capable);
  const live = capable && armed;

  const setReason = useCallback((reason: PauseReason, on: boolean) => {
    setReasons((current) => {
      if (current.has(reason) === on) return current;
      const next = new Set(current);
      if (on) next.add(reason);
      else next.delete(reason);
      return next;
    });
  }, []);

  useEffect(() => setReason('user', userPaused), [userPaused, setReason]);

  // Off screen, hidden tab, scroll progress and pointer — only while the live scene exists.
  useEffect(() => {
    const section = sectionRef.current;
    if (!live || !section) return;
    let top = 0;
    let height = 1;
    const measure = () => {
      const rect = section.getBoundingClientRect();
      top = rect.top + window.scrollY;
      height = Math.max(1, rect.height);
    };
    // Pinned hero (taller than the viewport, sticky stage): progress spans the pinned range; otherwise 80 % of the hero.
    const onScroll = () => {
      const pinned = height - window.innerHeight > 120;
      const span = pinned ? height - window.innerHeight : height * 0.8;
      progressRef.current = Math.min(1, Math.max(0, (window.scrollY - top) / span));
    };
    const onPointer = (event: PointerEvent) => {
      pointerRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };
    const onVisibility = () => setReason('hidden', document.visibilityState === 'hidden');
    const resize = new ResizeObserver(() => {
      measure();
      onScroll();
    });
    const intersection = new IntersectionObserver(([entry]) => setReason('offscreen', !(entry?.isIntersecting ?? false)), { rootMargin: '80px 0px' });
    measure();
    onScroll();
    onVisibility();
    resize.observe(section);
    intersection.observe(section);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      resize.disconnect();
      intersection.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [live, sectionRef, setReason]);

  // Leaving the live mode (reduced motion turned on, failure) resets the cross-fade.
  useEffect(() => {
    if (!live) setReady(false);
  }, [live]);

  const handleReady = useCallback(() => setReady(true), []);
  const handleLost = useCallback(() => {
    losses.current += 1;
    setLost(true);
    setReason('context-lost', true);
    if (losses.current > MAX_CONTEXT_LOSSES) setFailed(true);
  }, [setReason]);
  const handleRestored = useCallback(() => {
    setLost(false);
    setReason('context-lost', false);
  }, [setReason]);

  const showCanvas = live && ready && !lost;
  useEffect(() => onLiveChange(showCanvas), [showCanvas, onLiveChange]);

  const state: HeroStageState = !live ? 'poster' : lost ? 'lost' : ready ? 'live' : 'loading';

  return (
    <div aria-hidden data-hero-state={state} className={cn('home-hero-media pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <picture>
        <source media="(max-aspect-ratio: 1/1)" srcSet={HERO_POSTER.tall.src} width={HERO_POSTER.tall.width} height={HERO_POSTER.tall.height} />
        <img
          src={HERO_POSTER.wide.src}
          width={HERO_POSTER.wide.width}
          height={HERO_POSTER.wide.height}
          alt=""
          decoding="async"
          fetchPriority="high"
          className={cn(
            'absolute inset-0 size-full object-cover object-[72%_50%] transition-opacity duration-700 [@media(max-aspect-ratio:1/1)]:object-[50%_0%]',
            // Dim only while the scene boots; as a fallback (lost context, no WebGL, reduced motion) the poster is at full strength.
            live && !ready && !lost ? 'opacity-35' : 'opacity-100',
          )}
        />
      </picture>
      {live ? (
        <SceneBoundary onError={() => setFailed(true)}>
          <Suspense fallback={null}>
            <HeroCanvas
              className={cn('absolute! inset-0 transition-opacity duration-700 ease-(--ease-enter)', showCanvas ? 'opacity-100' : 'opacity-0')}
              running={reasons.size === 0}
              progressRef={progressRef}
              pointerRef={pointerRef}
              onReady={handleReady}
              onContextLost={handleLost}
              onContextRestored={handleRestored}
            />
          </Suspense>
        </SceneBoundary>
      ) : null}
    </div>
  );
}
