import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * One-shot "armed → play" state for an element that animates when it scrolls into view. Null (static) on the server,
 * without JavaScript and under reduced motion, so content is never hidden by default.
 */
export function useViewTrigger<T extends Element>(reducedMotion: boolean, rootMargin = '0px 0px -20% 0px'): [RefObject<T | null>, 'armed' | 'play' | null] {
  const ref = useRef<T>(null);
  const [state, setState] = useState<'armed' | 'play' | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    setState('armed');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setState('play');
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion, rootMargin]);
  return [ref, state];
}
