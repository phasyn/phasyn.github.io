import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.ts';
import { useReducedMotion } from '../../lib/hooks.ts';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/\\[]{}';

/** Current `--fx-intro-delay` (first-visit splash) in ms; 0 when skipped. */
function introDelay(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--fx-intro-delay').trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? (raw.endsWith('ms') ? value : value * 1000) : 0;
}

interface DecodeTextProps {
  text: string;
  duration?: number;
  /** Extra delay before decoding, ms. */
  delay?: number;
  /** Wait for the first-visit splash before starting (use above the fold). */
  afterIntro?: boolean;
  className?: string;
}

/**
 * "Decoding" text for short Latin labels, IDs and readouts (`.machine`, eyebrows): random glyphs resolve left to right
 * when the text scrolls into view. The real text is in the HTML and in `aria-label`; reduced motion skips the effect.
 */
export function DecodeText({ text, duration = 900, delay = 0, afterIntro = false, className }: DecodeTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    let frame = 0;
    let timer = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const resolved = Math.floor(progress * text.length);
        let out = '';
        for (let i = 0; i < text.length; i += 1) {
          const ch = text[i] ?? '';
          out += i < resolved || ch === ' ' ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        element.textContent = out;
        if (progress < 1) frame = requestAnimationFrame(tick);
        else element.textContent = text;
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const wait = delay + (afterIntro ? introDelay() : 0);
      if (wait > 0) timer = window.setTimeout(run, wait);
      else run();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      element.textContent = text;
    };
  }, [text, duration, delay, afterIntro, reducedMotion]);

  return (
    <span className={cn('inline-block tabular-nums', className)} aria-label={text}>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}
