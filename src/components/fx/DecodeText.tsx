import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.ts';
import { useReducedMotion } from '../../lib/hooks.ts';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/\\[]{}';

/**
 * Time left on the first-visit splash hold, ms: `--fx-intro-delay` (0 when skipped) counted from first paint, where the
 * CSS entrances start, so script-driven decodes line up with them.
 */
function introRemaining(): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--fx-intro-delay').trim();
  const value = Number.parseFloat(raw);
  const delay = Number.isFinite(value) ? (raw.endsWith('ms') ? value : value * 1000) : 0;
  if (delay <= 0) return 0;
  const paint = performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0;
  return Math.max(0, delay + paint - performance.now());
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
 * when the text scrolls into view. Assistive tech reads the real text from a visually hidden copy (the glyphs are
 * aria-hidden; no aria-label on a generic span, FE-20); reduced motion skips the effect.
 */
export function DecodeText({ text, duration = 900, delay = 0, afterIntro = false, className }: DecodeTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    let frame = 0;
    let timer = 0;
    let started = false;
    const run = () => {
      if (started) return;
      started = true;
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
    // The visitor skipped the splash: stop waiting for the rest of its hold.
    const onSkip = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(run, delay);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const intro = afterIntro ? introRemaining() : 0;
      if (intro > 0) window.addEventListener('fx-intro-skip', onSkip, { once: true });
      const wait = delay + intro;
      if (wait > 0) timer = window.setTimeout(run, wait);
      else run();
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      window.removeEventListener('fx-intro-skip', onSkip);
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      element.textContent = text;
    };
  }, [text, duration, delay, afterIntro, reducedMotion]);

  return (
    <span className={cn('inline-block tabular-nums', className)}>
      {/* select-none: copying the label yields the visible text once, not twice. */}
      <span className="sr-only select-none">{text}</span>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}
