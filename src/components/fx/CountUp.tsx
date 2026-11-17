import { useEffect, useRef } from 'react';
import { useLocale } from '../../i18n/locale.tsx';
import { HTML_LANG } from '../../site/config.ts';
import { useReducedMotion } from '../../lib/hooks.ts';

function formatCount(n: number, locale: string, decimals: number): string {
  return n.toLocaleString(locale, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/**
 * A measured number that counts up once when it scrolls into view. The final value is what the HTML contains; the
 * count is decoration only (the value never animates through wrong units or rounding).
 */
export function CountUp({
  value,
  decimals = 0,
  duration = 1300,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const locale = HTML_LANG[useLocale()];

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion) return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;
    let frame = 0;
    element.textContent = formatCount(0, locale, decimals);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        element.textContent = formatCount(value * eased, locale, decimals);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      element.textContent = formatCount(value, locale, decimals);
    };
  }, [value, decimals, duration, reducedMotion, locale]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatCount(value, locale, decimals)}
    </span>
  );
}
