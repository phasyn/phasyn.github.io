import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type RefObject } from 'react';
import { useHydrated, useReducedMotion } from '../../../lib/hooks.ts';
import type { RowsFile, SpeedRow } from '../data/types.ts';

/** Width of an element (ResizeObserver); `fallback` is used for the prerendered HTML and the first client render. */
export function useElementWidth<T extends HTMLElement>(fallback: number): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.round(entry?.contentRect.width ?? 0);
      if (next > 0) setWidth(next);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

/*
 * Charts animate in once when they scroll into view: `armed` hides the marks (only after hydration and only when the
 * chart starts offscreen, so nothing ever flashes away), `play` transitions them to the final state. Reduced motion and
 * the prerendered HTML stay `static` — the final, readable state.
 */
export type RevealState = 'static' | 'armed' | 'play';

export function useReveal<T extends Element>(): [RefObject<T | null>, RevealState] {
  const ref = useRef<T>(null);
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<RevealState>('static');
  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) {
      setState('static');
      return;
    }
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
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [reducedMotion]);
  return [ref, state];
}

type MarkKind = 'bar-x' | 'bar-y' | 'dot' | 'fade' | 'rise';

/** Inline style for one mark in a revealing chart. Marks stay solid; only transform/opacity move. */
export function revealStyle(state: RevealState, kind: MarkKind, index = 0, step = 28): CSSProperties | undefined {
  if (state === 'static') return undefined;
  const delay = `${Math.min(index, 24) * step}ms`;
  const hidden = state === 'armed';
  switch (kind) {
    case 'bar-x':
      return {
        transformBox: 'fill-box',
        transformOrigin: 'left center',
        scale: hidden ? '0 1' : '1 1',
        transition: `scale var(--duration-spring-smooth) var(--ease-spring-smooth) ${delay}`,
      };
    case 'bar-y':
      return {
        transformBox: 'fill-box',
        transformOrigin: 'center bottom',
        scale: hidden ? '1 0' : '1 1',
        transition: `scale var(--duration-spring-smooth) var(--ease-spring-smooth) ${delay}`,
      };
    case 'dot':
      return {
        transformBox: 'fill-box',
        transformOrigin: 'center',
        scale: hidden ? '0' : '1',
        opacity: hidden ? 0 : 1,
        transition: `scale var(--duration-spring-bouncy) var(--ease-spring-bouncy) ${delay}, opacity 160ms linear ${delay}`,
      };
    case 'rise':
      return {
        translate: hidden ? '0 10px' : '0 0',
        opacity: hidden ? 0 : 1,
        transition: `translate var(--duration-spring-smooth) var(--ease-spring-smooth) ${delay}, opacity 320ms var(--ease-standard) ${delay}`,
      };
    case 'fade':
      return { opacity: hidden ? 0 : 1, transition: `opacity 420ms var(--ease-standard) ${delay}` };
  }
}

/** A path that draws itself (`pathLength={1}` on the element). */
export function drawStyle(state: RevealState, delayMs = 0, durationMs = 1200): CSSProperties | undefined {
  if (state === 'static') return undefined;
  return {
    strokeDasharray: 1,
    strokeDashoffset: state === 'armed' ? 1 : 0,
    transition: `stroke-dashoffset ${durationMs}ms var(--ease-standard) ${delayMs}ms`,
  };
}

/** Whether a horizontal scroller has more content to its right (drives an edge cue). False until mounted. */
export function useScrollEdge<T extends HTMLElement>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () => setMore(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, []);
  return [ref, more];
}

/*
 * Every speed-table row (with per-step detail and notes) lives in public/data/benchmarks/rows.json and loads after
 * hydration. One request per page; aborted on unmount; failures can be retried.
 */
export type RowsState = { status: 'idle' } | { status: 'loading' } | { status: 'ready'; rows: SpeedRow[] } | { status: 'error' };

const ROWS_URL = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/data/benchmarks/rows.json`;

export function useAllRows(): [RowsState, () => void] {
  const hydrated = useHydrated();
  const [state, setState] = useState<RowsState>({ status: 'idle' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!hydrated) return;
    const controller = new AbortController();
    let idle = 0;
    const start = () => {
      setState({ status: 'loading' });
      fetch(ROWS_URL, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) throw new Error(String(response.status));
          return response.json() as Promise<RowsFile>;
        })
        .then((file) => {
          if (!controller.signal.aborted) setState({ status: 'ready', rows: file.rows });
        })
        .catch(() => {
          if (!controller.signal.aborted) setState({ status: 'error' });
        });
    };
    // Prefetch when the browser is idle; a retry starts immediately.
    if (attempt === 0 && 'requestIdleCallback' in window) idle = window.requestIdleCallback(start, { timeout: 2500 });
    else start();
    return () => {
      controller.abort();
      if (idle) window.cancelIdleCallback(idle);
    };
  }, [hydrated, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return [state, retry];
}

/*
 * Roving focus for chart marks: the plot is one Tab stop; arrow keys move between marks; Home/End jump; Escape clears.
 * The focused (or hovered) mark index drives the tooltip.
 */
export function useRoving(count: number) {
  const [active, setActive] = useState<number | null>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<(SVGElement | HTMLElement | null)[]>([]);

  const move = (next: number) => {
    const index = Math.max(0, Math.min(count - 1, next));
    setFocusIndex(index);
    setActive(index);
    refs.current[index]?.focus();
  };

  const props = (index: number) => ({
    ref: (element: SVGElement | HTMLElement | null) => {
      refs.current[index] = element;
    },
    tabIndex: index === focusIndex ? 0 : -1,
    onFocus: () => {
      setFocusIndex(index);
      setActive(index);
    },
    onBlur: () => setActive((current) => (current === index ? null : current)),
    onPointerEnter: () => setActive(index),
    onPointerLeave: () => setActive((current) => (current === index ? null : current)),
    onKeyDown: (event: KeyboardEvent) => {
      const key = event.key;
      if (key === 'ArrowRight' || key === 'ArrowDown') move(index + 1);
      else if (key === 'ArrowLeft' || key === 'ArrowUp') move(index - 1);
      else if (key === 'Home') move(0);
      else if (key === 'End') move(count - 1);
      else if (key === 'Escape') setActive(null);
      else return;
      event.preventDefault();
    },
  });

  return { active, setActive, props };
}

/** Live media query; the prerendered HTML and hydration use `serverValue`, then the real value applies. */
export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
