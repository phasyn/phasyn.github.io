import { ArrowRight, Coins, Gauge, type LucideIcon } from 'lucide-react';
import { Fragment, type ComponentType } from 'react';
import { Link } from 'react-router';
import { BrandMark } from '../../../../components/brand/BrandMark.tsx';
import { useLocale } from '../../../../i18n/locale.tsx';
import { cn } from '../../../../lib/cn.ts';
import { HTML_LANG, pagePath } from '../../../../site/config.ts';
import type { HomeCopy } from '../../copy.ts';
import { AccelGauge, CreditMeter, type VisualProps } from './PainVisuals.tsx';

export type ManifestoCopy = HomeCopy['manifesto'];
export type Tone = 'danger' | 'warning';

export interface BeatMeta {
  /** Latin HUD tag (decorative). */
  tag: string;
  tone: Tone;
  Icon: LucideIcon;
  Visual: ComponentType<VisualProps>;
}

/** One HUD visual per pain point, in the order of copy.manifesto.beats (condensed to two: credits, then local tools). */
export const BEATS: readonly BeatMeta[] = [
  { tag: 'CREDITS · DRAIN', tone: 'danger', Icon: Coins, Visual: CreditMeter },
  { tag: 'LOCAL TOOLS · ACCELERATION', tone: 'warning', Icon: Gauge, Visual: AccelGauge },
];

export const TONE_TEXT: Record<Tone, string> = { danger: 'text-danger', warning: 'text-warning' };

/** Splits `text` around the `hot` substrings (found in order). */
export function splitHot(text: string, hot: readonly string[]): { text: string; hot: boolean }[] {
  const parts: { text: string; hot: boolean }[] = [];
  let cursor = 0;
  for (const word of hot) {
    const at = text.indexOf(word, cursor);
    if (at < 0) continue;
    if (at > cursor) parts.push({ text: text.slice(cursor, at), hot: false });
    parts.push({ text: word, hot: true });
    cursor = at + word.length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), hot: false });
  return parts;
}

const CJK = /[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/;
const CLOSING = /^[、。，．！？：；）」』】〉》’”…ー・,.!?:;)\]]+$/;
/** Longest CJK phrase kept together; longer runs may break between words. */
const MAX_PHRASE = 10;
const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;
/** A part that starts with kana continues the word before it (particles such as も・は・が): no break at that seam. */
const KANA_START = /^[\u3040-\u309f]/;

/**
 * CJK lines break only between phrases (Intl word segments joined up to MAX_PHRASE characters, closing punctuation kept with the
 * phrase before it), so words such as 需求 or 仕上がり never split; Latin text is returned whole.
 */
function phrases(text: string, lang: string): string[] {
  if (!hasSegmenter || !CJK.test(text)) return [text];
  const words: string[] = [];
  for (const { segment } of new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)) {
    if (CLOSING.test(segment) && words.length) words[words.length - 1] += segment;
    else words.push(segment);
  }
  const out: string[] = [];
  let current = '';
  for (const word of words) {
    if (/^\s+$/.test(word)) {
      if (current) out.push(current);
      out.push(word);
      current = '';
      continue;
    }
    if (current && Array.from(current + word).length > MAX_PHRASE) {
      out.push(current);
      current = word;
    } else current += word;
    if (CLOSING.test(word.slice(-1))) {
      out.push(current);
      current = '';
    }
  }
  if (current) out.push(current);
  return out;
}

/** Text with a break opportunity (<wbr>) between phrases; CJK text otherwise keeps words whole (keep-all). */
function Phrased({ text, lang, first }: { text: string; lang: string; first: boolean }) {
  return (
    <>
      {phrases(text, lang).map((group, index) => (
        <Fragment key={index}>
          {(index > 0 || (!first && !KANA_START.test(group))) && !CLOSING.test(group.charAt(0)) ? <wbr /> : null}
          {group}
        </Fragment>
      ))}
    </>
  );
}

/** A manifesto line with its pain words tinted (danger or warning). */
export function BeatText({ text, hot, tone }: { text: string; hot: readonly string[]; tone: Tone }) {
  const lang = HTML_LANG[useLocale()];
  return (
    <>
      {splitHot(text, hot).map((part, index) =>
        part.hot ? (
          <em key={index} className={cn('home-hot not-italic', tone === 'danger' ? 'home-hot-danger' : 'home-hot-warning')}>
            <Phrased text={part.text} lang={lang} first={index === 0} />
          </em>
        ) : (
          <Phrased key={index} text={part.text} lang={lang} first={index === 0} />
        ),
      )}
    </>
  );
}

/** The turn — 「所以，我決定自己開發。」 — with its keyword in the brand gradient, the mark, the signature and the way to About. */
export function FinalStatement({ t, className, markSize = 84 }: { t: ManifestoCopy; className?: string; markSize?: number }) {
  const locale = useLocale();
  return (
    <div className={cn('relative grid justify-items-center gap-6 text-center', className)}>
      <span className="relative grid place-items-center">
        <span aria-hidden className="home-mark-halo absolute size-56 rounded-full" />
        <BrandMark size={markSize} glow loading="lazy" className="relative" />
      </span>
      <p className="max-w-[16ch] text-display font-semibold tracking-display text-balance-cjk text-fg">
        {splitHot(t.final.text, [t.final.hot]).map((part, index) =>
          part.hot ? (
            <span key={index} className="home-final-key text-brand-gradient">
              {part.text}
            </span>
          ) : (
            <Fragment key={index}>{part.text}</Fragment>
          ),
        )}
      </p>
      <p className="max-w-[44ch] text-body text-fg-secondary text-balance-cjk">{t.proof}</p>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <span className="text-body text-fg-secondary">— {t.signature}</span>
        <Link
          to={pagePath(locale, 'about')}
          viewTransition
          className="group inline-flex min-h-10 items-center gap-1.5 rounded-md text-body font-medium text-action-fg no-underline hover:text-fg"
        >
          {t.readMore}
          <ArrowRight className="size-4 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
