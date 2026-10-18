import { createElement, useEffect, useMemo, useRef, type ElementType } from 'react';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { HTML_LANG } from '../../site/config.ts';

const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;
const graphemeSegmenter = hasSegmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

function graphemes(text: string): string[] {
  return graphemeSegmenter ? Array.from(graphemeSegmenter.segment(text), (s) => s.segment) : Array.from(text);
}

const CJK = /[　-鿿가-힯＀-￯]/;
const CLOSING = /^[、。，．！？：；）」』】〉》’”…ー・,.!?:;)\]]+$/;
const NO_BREAK = /^[\u00a0\u202f\u2060]+$/;
/** Longest CJK phrase kept on one line; longer runs fall back to word boundaries so nothing overflows. */
const MAX_PHRASE = 10;

/**
 * Groups that must not break internally. Closing punctuation sticks to the group before it (kinsoku). In CJK text,
 * words between two punctuation marks are joined into one phrase (so 產品 or 哪台 never split), unless that phrase
 * would exceed MAX_PHRASE characters.
 */
function wordGroups(text: string, lang: string): string[] {
  if (!hasSegmenter) return Array.from(text);
  const words: string[] = [];
  let glue = false;
  for (const { segment } of new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)) {
    const last = words.length - 1;
    // A no-break space (or word joiner) binds both neighbours into one group: "RTX 5080", "1 枚" stay together.
    if (NO_BREAK.test(segment) && last >= 0) {
      words[last] += segment;
      glue = true;
    } else if ((glue || CLOSING.test(segment)) && last >= 0) {
      words[last] += segment;
      glue = false;
    } else words.push(segment);
  }
  if (!CJK.test(text)) return words;
  const phrases: string[] = [];
  let current = '';
  for (const word of words) {
    const ends = CLOSING.test(word.slice(-1));
    if (/^\s+$/.test(word)) {
      if (current) phrases.push(current);
      phrases.push(word);
      current = '';
    } else if (current && graphemes(current + word).length > MAX_PHRASE) {
      phrases.push(current);
      current = word;
    } else current += word;
    if (ends && current) {
      phrases.push(current);
      current = '';
    }
  }
  if (current) phrases.push(current);
  return phrases;
}

export interface RevealTextProps {
  text: string;
  as?: ElementType;
  id?: string;
  /**
   * `load` plays on first paint with pure CSS (above the fold) and automatically waits for the first-visit splash
   * (`--fx-intro-delay`, 0 when the splash is skipped); `view` plays when scrolled into view.
   */
  on?: 'load' | 'view';
  /** Extra delay before the first character, ms (after the splash for `load`). */
  delay?: number;
  /** Per-character step, ms (total stagger is capped at ~1 s). */
  step?: number;
  className?: string;
}

/**
 * Headline reveal: characters rise out of a blur with a cyan→iris glow that settles, staggered. The final text is in the
 * prerendered HTML; the heading keeps its accessible name; reduced motion shows it statically.
 */
export function RevealText({ text, as = 'span', id, on = 'view', delay = 0, step, className }: RevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const lang = HTML_LANG[useLocale()];
  const parts = useMemo(() => {
    const cjk = CJK.test(text);
    const stride = step ?? (cjk ? 42 : 18);
    const cap = Math.max(1, Math.floor(1000 / stride));
    // Lines break only between word groups (whitespace for Latin, Intl word segments for CJK), never inside one.
    const words: { chars: { ch: string; i: number }[]; space: boolean }[] = [];
    let index = 0;
    for (const group of wordGroups(text, lang)) {
      if (/^\s+$/.test(group)) {
        words.push({ chars: [{ ch: group, i: index }], space: true });
        index += 1;
        continue;
      }
      const chars = graphemes(group).map((ch) => ({ ch, i: index++ }));
      words.push({ chars, space: false });
    }
    return { words, stride, cap };
  }, [text, step, lang]);

  useEffect(() => {
    const element = ref.current;
    if (!element || on === 'load') return;
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return; // already on screen: stay static
    element.dataset.fxState = 'armed';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          element.dataset.fxState = 'play';
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [on, text]);

  const charDelay = (i: number) => {
    const ms = delay + Math.min(i, parts.cap) * parts.stride;
    return on === 'load' ? `calc(var(--fx-intro-delay, 0ms) + ${ms}ms)` : `${ms}ms`;
  };

  return createElement(
    as,
    {
      ref,
      id,
      className: cn('fx-chars', className),
      'aria-label': text,
      ...(on === 'load' ? { 'data-fx-state': 'play' } : {}),
    },
    <span aria-hidden>
      {parts.words.map((word, w) =>
        word.space ? (
          ' '
        ) : (
          <span key={w} className="inline-block whitespace-nowrap">
            {word.chars.map(({ ch, i }) => (
              <span key={i} className="fx-char" style={{ ['--d' as string]: charDelay(i) }}>
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </span>,
  );
}
