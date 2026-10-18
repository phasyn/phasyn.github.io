import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { useHydrated, useReducedMotion } from '../../lib/hooks.ts';

export interface MockPlayback<T extends Element> {
  ref: RefObject<T | null>;
  /**
   * Motion is allowed and the page has hydrated. Only then may a primitive hide content before it plays; the server render,
   * no-JS readers and reduced motion always get the complete, static end state.
   */
  armed: boolean;
  /** The element has been on screen at least once (latched). */
  seen: boolean;
  /** The element is on screen right now; loops pause while this is false. */
  visible: boolean;
}

/**
 * Viewport and motion gate for an illustrative UI block. Attach `ref` to the block's root element.
 * One IntersectionObserver per block; it is disconnected on unmount.
 */
export function useMockPlayback<T extends Element>({ threshold = 0.3, rootMargin = '0px' }: { threshold?: number; rootMargin?: string } = {}): MockPlayback<T> {
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

/**
 * Number of visible characters of `text` for a typing effect.
 * - Not armed (server, reduced motion): the whole text.
 * - Armed but not running: nothing yet (the block is off screen, so nothing visibly disappears).
 * - Running: one character per tick; stopping resets, so the next run types again from the start.
 * Characters are counted as code points, so CJK and surrogate pairs never split.
 */
export function useTypewriter(text: string, { run, armed, cps = 30, delay = 280 }: { run: boolean; armed: boolean; cps?: number; delay?: number }): number {
  const total = useMemo(() => Array.from(text).length, [text]);
  const [count, setCount] = useState(Number.POSITIVE_INFINITY);

  useEffect(() => {
    if (!armed) {
      setCount(Number.POSITIVE_INFINITY);
      return;
    }
    setCount(0);
    if (!run) return;
    let shown = 0;
    let timer = 0;
    const tick = () => {
      shown += 1;
      setCount(shown);
      if (shown < total) timer = window.setTimeout(tick, 1000 / cps);
    };
    timer = window.setTimeout(tick, delay);
    return () => window.clearTimeout(timer);
  }, [armed, run, total, cps, delay]);

  return Math.min(count, total);
}

/** Slice by code points (pairs with useTypewriter). */
export function sliceChars(text: string, count: number): string {
  return count >= text.length ? text : Array.from(text).slice(0, count).join('');
}
