import { useEffect, useRef, useState, type RefObject } from 'react';
import { useHydrated, useReducedMotion } from '../../../lib/hooks.ts';

export interface Playback<T extends Element> {
  ref: RefObject<T | null>;
  /**
   * Motion is allowed and the page has hydrated. Only then may a block hide content before it plays; the server render,
   * no-JS readers and reduced motion always get the complete, static end state.
   */
  armed: boolean;
  /** The element has been on screen at least once (latched). */
  seen: boolean;
  /** The element is on screen right now; loops pause while this is false. */
  visible: boolean;
}

/** Viewport and motion gate for an animated block on Home. Attach `ref` to the block's root element. */
export function usePlayback<T extends Element>({ threshold = 0.3, rootMargin = '0px' }: { threshold?: number; rootMargin?: string } = {}): Playback<T> {
  const ref = useRef<T>(null);
  const hydrated = useHydrated();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const on = entry?.isIntersecting ?? false;
        setVisible(on);
        if (on) setSeen(true);
      },
      { threshold, rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, armed: hydrated && !reduced, seen, visible };
}
