import { useEffect, useRef } from 'react';
import { useLocale } from '../../i18n/locale.tsx';
import { HTML_LANG } from '../../site/config.ts';
import { useReducedMotion } from '../../lib/hooks.ts';

/**
 * A measured number that counts up once when it scrolls into view. The final value is what the HTML contains; the
 * count is decoration only (the value never animates through wrong units or rounding).
 */
export function CountUp({ value, decimals = 0, duration = 1300, className }: { value: number; decimals?: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const locale = HTML_LANG[useLocale()];
  const format = (n: number) => n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;
    let frame = 0;
    element.textContent = format(0);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        element.textContent = format(value * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = format(value);
    };
  }, [value, decimals, duration, reducedMotion, locale]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {format(value)}
    </span>
  );
}
