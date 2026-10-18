import { HTML_LANG, type Locale } from '../../../site/config.ts';

// Number formatting for the benchmark page. Seconds always carry one decimal (0.3 s, 32.0 s, 1,515.5 s); GiB two.

const cache = new Map<string, Intl.NumberFormat>();

function formatter(locale: Locale, min: number, max: number): Intl.NumberFormat {
  const key = `${locale}|${min}|${max}`;
  let nf = cache.get(key);
  if (!nf) {
    nf = new Intl.NumberFormat(HTML_LANG[locale], { minimumFractionDigits: min, maximumFractionDigits: max });
    cache.set(key, nf);
  }
  return nf;
}

export function fmtNumber(locale: Locale, value: number, max = 1, min = 0): string {
  return formatter(locale, min, max).format(value);
}

/** Seconds without the unit, always with one decimal (32.0, 5.3, 1,515.5), so values in one column read alike. */
export function fmtSec(locale: Locale, value: number): string {
  return fmtNumber(locale, value, 1, 1);
}

/** Seconds with the unit, e.g. "37.8 s" (joined by a no-break space so the unit never wraps alone). */
export function fmtSeconds(locale: Locale, value: number, approx = false): string {
  return `${approx ? '≈' : ''}${fmtSec(locale, value)} s`;
}

/** GiB with two decimals (no unit). */
export function fmtGiB(locale: Locale, value: number): string {
  return fmtNumber(locale, value, 2, 2);
}

export function fmtCount(locale: Locale, value: number): string {
  return fmtNumber(locale, value, 0);
}

/** Decimal places a measured value was given with (for count-up animations that must land on the same text). */
export function decimalsOf(value: number): number {
  const text = String(value);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : Math.min(2, text.length - dot - 1);
}
