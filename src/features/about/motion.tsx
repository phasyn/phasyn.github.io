import { useEffect, useRef, useState, type RefObject } from 'react';
import { DecodeText } from '../../components/fx/index.ts';

/*
 * Page-local timing around the shared FX kit (src/components/fx, lead-owned, not edited here).
 *
 * The layout shows a first-visit splash for ~1.7 s (IntroSplash). Hero entrances wait for it on a first visit; when
 * the splash is skipped (later visits, reduced motion) its inline script puts `fx-intro-skip` on <html> before paint,
 * and the same entrances start almost at once. CSS reads that class directly (see AboutHero), so the timing is right
 * on first paint without JavaScript.
 */

/** Milliseconds the hero waits on a first visit, so its entrances start as the splash fades. */
export const SPLASH_MS = 1500;

function splashSkipped(): boolean {
  return document.documentElement.classList.contains('fx-intro-skip');
}

/**
 * DecodeText for the hero eyebrow: mounted once the splash has gone, so the decode is actually seen (it would
 * otherwise run, unseen, under the splash). Before that, and without JavaScript, the plain label is shown.
 */
export function HeroDecode({ text }: { text: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), splashSkipped() ? 0 : SPLASH_MS);
    return () => window.clearTimeout(timer);
  }, []);
  return ready ? <DecodeText text={text} /> : <span>{text}</span>;
}

/**
 * One-shot "armed → play" state for an element that animates when it scrolls into view. Static (null) on the
 * server, without JavaScript, under reduced motion, and when the element is already on screen at mount, so content
 * is never hidden by default and nothing replays.
 */
export function useViewTrigger<T extends Element>(reducedMotion: boolean): [RefObject<T | null>, 'armed' | 'play' | null] {
  const ref = useRef<T>(null);
  const [state, setState] = useState<'armed' | 'play' | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;
    setState('armed');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState('play');
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -18% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);
  return [ref, state];
}
