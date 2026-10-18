import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.ts';
import { useReducedMotion } from '../../lib/hooks.ts';

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/\\[]{}';

/**
 * "Decoding" text for short Latin labels, IDs and readouts (`.machine`, eyebrows): random glyphs resolve left to right
 * when the text scrolls into view. The real text is in the HTML and in `aria-label`; reduced motion skips the effect.
 */
export function DecodeText({ text, duration = 900, className }: { text: string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    let frame = 0;
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
      if (entry?.isIntersecting) {
        run();
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = text;
    };
  }, [text, duration, reducedMotion]);

  return (
    <span className={cn('inline-block tabular-nums', className)} aria-label={text}>
      <span ref={ref} aria-hidden>
        {text}
      </span>
    </span>
  );
}
