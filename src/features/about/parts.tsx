import type { CSSProperties, ReactNode } from 'react';
import { DecodeText, RevealText } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useReducedMotion } from '../../lib/hooks.ts';
import { useLocale } from '../../i18n/locale.tsx';
import type { Locale } from '../../site/config.ts';
import { SECTION_IDS, SECTION_TAGS, type SectionId } from './copy.ts';
import { useViewTrigger } from './motion.tsx';

/*
 * Long-read typography. CJK reads best at ~40 characters per line with
 * generous leading; English gets a slightly larger size and tighter leading
 * so the same 42.5rem column holds ~70 characters.
 */
const BODY: Record<Locale, string> = {
  'zh-hant': 'text-[clamp(1rem,0.96rem+0.18vw,1.0625rem)] leading-[1.95]',
  ja: 'text-[clamp(1rem,0.96rem+0.18vw,1.0625rem)] leading-[1.95]',
  en: 'text-[clamp(1.0625rem,1.02rem+0.18vw,1.125rem)] leading-[1.7]',
};

const LEAD_LEADING: Record<Locale, string> = { 'zh-hant': 'leading-[1.8]', ja: 'leading-[1.8]', en: 'leading-[1.55]' };
const STATEMENT_LEADING: Record<Locale, string> = { 'zh-hant': 'leading-[1.5]', ja: 'leading-[1.5]', en: 'leading-[1.22]' };

/*
 * Line breaking for display text (titles, standfirst, leads, statements). Chinese may otherwise break
 * between any two characters, splitting words (「這／篇」, 「優／化」): keep-all limits breaks to
 * punctuation, spaces and the U+200B marks in the copy, with `anywhere` as the overflow fallback.
 * Japanese uses phrase-aware breaking where the browser supports it. Body paragraphs keep normal
 * CJK breaking.
 */
const DISPLAY_BREAK: Record<Locale, string> = {
  'zh-hant': '[word-break:keep-all] [overflow-wrap:anywhere]',
  ja: '[word-break:auto-phrase]',
  en: '',
};

/**
 * Appends the site's `text-balance-cjk` outside cn(): tailwind-merge (src/lib/cn.ts) does not know that
 * utility and files it under text colour, so cn() either drops it (when `text-fg…` follows) or drops the
 * colour (when it follows `text-fg…`).
 */
export function withBalance(className: string): string {
  return `${className} text-balance-cjk`;
}

export function useBodyClass(): string {
  return BODY[useLocale()];
}

export function useDisplayBreak(): string {
  return DISPLAY_BREAK[useLocale()];
}

/** `--i` drives the brand `animate-rise-in` / `stagger` delay (index × 24 ms, max 10). */
export function stagger(index: number): CSSProperties {
  return { '--i': index } as CSSProperties;
}

export function sectionNumber(id: SectionId): string {
  return String(SECTION_IDS.indexOf(id) + 1).padStart(2, '0');
}

/**
 * Eyebrow (decoding Latin label, decorative) and the chapter title, which reveals character by character when it
 * scrolls into view (RevealText groups words, so CJK titles still break between phrases only). The heading keeps
 * its own id and accessible name; RevealText does not pass an id through.
 */
export function SectionHeading({ id, title, align = 'start' }: { id: SectionId; title: string; align?: 'start' | 'center' }) {
  return (
    <div className={cn('grid gap-4', align === 'center' && 'justify-items-center text-center')}>
      <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
        <DecodeText text={sectionNumber(id)} duration={500} />
        <span className="h-px w-8 bg-brand-gradient" />
        <DecodeText text={SECTION_TAGS[id]} />
      </p>
      <h2 id={`${id}-title`} aria-label={title} className={withBalance('text-headline tracking-display text-fg')}>
        <RevealText text={title} on="view" />
      </h2>
    </div>
  );
}

/** One chapter of the essay. Sections are contiguous so the index always has a current chapter while reading. */
export function StorySection({ id, title, children }: { id: SectionId; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="border-t border-line-subtle py-16 first:border-t-0 md:py-24 lg:first:pt-28">
      <SectionHeading id={id} title={title} />
      <div className="mt-9 md:mt-11">{children}</div>
    </section>
  );
}

export function Prose({ paragraphs, className }: { paragraphs: readonly string[]; className?: string }) {
  const body = useBodyClass();
  return (
    <div className={cn('grid gap-[1.1em] text-fg-secondary', body, className)}>
      {paragraphs.map((text) => (
        <p key={text} className="[text-wrap:pretty]">
          {text}
        </p>
      ))}
    </div>
  );
}

export function Lead({ children, className }: { children: ReactNode; className?: string }) {
  const locale = useLocale();
  return <p className={cn('text-lead text-fg [text-wrap:pretty]', LEAD_LEADING[locale], DISPLAY_BREAK[locale], className)}>{children}</p>;
}

/**
 * The author's strongest lines, set large under a thin brand-gradient rule. They are part of the reading flow (not
 * repeated elsewhere), so they stay plain paragraphs for assistive tech. When one scrolls into view the rule draws in
 * with a glow and a single light sweep crosses the words: an identical, aria-hidden copy laid exactly over the text
 * with the kit's `fx-sweep-text` (it ends transparent). Static under reduced motion and without JavaScript.
 */
export function Statement({ text, className }: { text: string; className?: string }) {
  const locale = useLocale();
  const reducedMotion = useReducedMotion();
  const [ref, state] = useViewTrigger<HTMLDivElement>(reducedMotion);
  // Base and sweep copy must wrap identically: same classes, with `text-balance-cjk` appended outside cn() for both.
  const type = cn('text-headline tracking-display', STATEMENT_LEADING[locale], DISPLAY_BREAK[locale]);
  return (
    <div ref={ref} data-fx={state ?? undefined} className={cn('group/stmt my-12 md:my-16', className)}>
      <span
        aria-hidden
        className="block h-px w-20 origin-left bg-brand-gradient transition-[scale,box-shadow] duration-[900ms] ease-(--ease-enter) group-data-[fx=armed]/stmt:scale-x-0 group-data-[fx=play]/stmt:shadow-[0_0_6px_rgb(73_207_255_/_0.95),0_0_22px_rgb(114_125_255_/_0.6)]"
      />
      <div className="relative mt-6">
        <p className={withBalance(cn(type, 'text-fg'))}>{text}</p>
        {state === 'play' ? (
          // The kit's band is white: over near-white type it only shows with a glow. drop-shadow follows the painted
          // band alone (the rest of this copy is transparent); an even ease lets the light cross at a readable pace.
          <p
            aria-hidden
            className={withBalance(
              cn(
                type,
                'fx-sweep-text pointer-events-none absolute inset-0 [filter:drop-shadow(0_0_10px_rgb(73_207_255_/_0.85))_drop-shadow(0_0_2px_rgb(255_255_255_/_0.6))] [[data-fx=play]_&]:[animation-timing-function:cubic-bezier(0.45,0,0.25,1)]',
              ),
            )}
          >
            {text}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Brand area glass icon (Codex art, 160 px + @2x, 7–20 KB). Only at ≥ 28 px per DESIGN_GUIDE §10; decorative.
 * Lazy (all of them sit below the hero; React would otherwise preload every eager image in the HTML head).
 */
export function AreaArt({ area, size = 48, className }: { area: 'image' | 'video' | 'inference' | 'components' | 'records'; size?: number; className?: string }) {
  return (
    <img
      src={`/brand/areas/${area}.webp`}
      srcSet={`/brand/areas/${area}.webp 1x, /brand/areas/${area}@2x.webp 2x`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn('shrink-0 select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}
