import type { CSSProperties, ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import type { Locale } from '../../site/config.ts';
import { SECTION_IDS, SECTION_TAGS, type SectionId } from './copy.ts';

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

export function SectionHeading({ id, title, align = 'start' }: { id: SectionId; title: string; align?: 'start' | 'center' }) {
  const display = useDisplayBreak();
  return (
    <div className={cn('grid gap-4', align === 'center' && 'justify-items-center text-center')}>
      <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
        <span className="tabular-nums">{sectionNumber(id)}</span>
        <span className="h-px w-8 bg-brand-gradient" />
        <span>{SECTION_TAGS[id]}</span>
      </p>
      <h2 id={`${id}-title`} className={withBalance(cn('text-headline tracking-display text-fg', display))}>
        {title}
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
 * The author's strongest lines, set large with a thin brand-gradient rule. They are part of the
 * reading flow (not repeated elsewhere), so they stay plain paragraphs for assistive tech.
 */
export function Statement({ children, className }: { children: ReactNode; className?: string }) {
  const locale = useLocale();
  return (
    <div className={cn('reveal my-12 md:my-16', className)}>
      <span aria-hidden className="block h-px w-14 bg-brand-gradient" />
      <p className={withBalance(cn('mt-6 text-headline tracking-display text-fg', STATEMENT_LEADING[locale], DISPLAY_BREAK[locale]))}>{children}</p>
    </div>
  );
}

/**
 * Brand area glass icon (Codex art, 160 px + @2x, 7–20 KB). Only at ≥ 28 px per DESIGN_GUIDE §10;
 * decorative. Loaded eagerly: it is tiny, and a lazy image never appears in a capture that does not scroll.
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
      decoding="async"
      draggable={false}
      className={cn('shrink-0 select-none', className)}
      style={{ width: size, height: size }}
    />
  );
}
