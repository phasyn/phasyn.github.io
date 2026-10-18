import { createElement, useEffect, useMemo, useRef, type ElementType } from 'react';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { HTML_LANG } from '../../site/config.ts';

const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;
const graphemeSegmenter = hasSegmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

function graphemes(text: string): string[] {
  return graphemeSegmenter ? Array.from(graphemeSegmenter.segment(text), (s) => s.segment) : Array.from(text);
}

/** Word groups that must not break internally; closing punctuation sticks to the word before it (kinsoku). */
function wordGroups(text: string, lang: string): string[] {
  if (!hasSegmenter) return Array.from(text);
  const groups: string[] = [];
  for (const { segment } of new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)) {
    if (/^[、。，．！？：；）」』】〉》’”…ー・,.!?:;)\]]+$/.test(segment) && groups.length) groups[groups.length - 1] += segment;
    else groups.push(segment);
  }
  return groups;
}

const CJK = /[　-鿿가-힯＀-￯]/;

export interface RevealTextProps {
  text: string;
  as?: ElementType;
  /** `load` plays on first paint with pure CSS (use above the fold); `view` plays when scrolled into view. */
  on?: 'load' | 'view';
  /** Delay before the first character, ms. */
  delay?: number;
  /** Per-character step, ms (total stagger is capped at ~1 s). */
  step?: number;
  className?: string;
}

/**
 * Headline reveal: characters rise out of a blur with a cyan→iris glow that settles, staggered. The final text is in the
 * prerendered HTML; the heading keeps its accessible name; reduced motion shows it statically.
 */
export function RevealText({ text, as = 'span', on = 'view', delay = 0, step, className }: RevealTextProps) {
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

  return createElement(
    as,
    {
      ref,
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
              <span key={i} className="fx-char" style={{ ['--d' as string]: `${delay + Math.min(i, parts.cap) * parts.stride}ms` }}>
                {ch}
              </span>
            ))}
          </span>
        ),
      )}
    </span>,
  );
}
