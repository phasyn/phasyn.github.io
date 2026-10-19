import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Live `prefers-reduced-motion`; the server snapshot assumes reduced motion so prerendered HTML is static. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

/** True after hydration; use to mount client-only work (WebGL, media) without hydration mismatches. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** Whether the element intersects the viewport (with margin); stays false on the server. */
export function useInView<T extends Element>(options: IntersectionObserverInit = { rootMargin: '200px 0px' }): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const { root, rootMargin, threshold } = options;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), {
      root: root ?? null,
      ...(rootMargin === undefined ? {} : { rootMargin }),
      ...(threshold === undefined ? {} : { threshold }),
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [root, rootMargin, threshold]);
  return [ref, inView];
}

/**
 * Pauses CSS animations in page blocks far from the viewport (FE-05): the top-level children of the element `rootId` and
 * every <section> inside it carry `data-offscreen` while more than half a viewport away, and site.css pauses animations
 * under that attribute. Pass the pathname as `key` so each page is observed after navigation.
 */
export function useOffscreenPause(rootId: string, key: unknown): void {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>(':scope > *, section'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) entry.target.removeAttribute('data-offscreen');
          else entry.target.setAttribute('data-offscreen', '');
        }
      },
      { rootMargin: '50% 0px' },
    );
    for (const target of targets) observer.observe(target);
    return () => {
      observer.disconnect();
      for (const target of targets) target.removeAttribute('data-offscreen');
    };
  }, [rootId, key]);
}

/** Can this browser create a WebGL2 context? Checked once, client-side. */
let webglSupport: boolean | undefined;
export function supportsWebGL(): boolean {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement('canvas');
    webglSupport = Boolean(canvas.getContext('webgl2'));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
