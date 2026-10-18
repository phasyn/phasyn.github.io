import { ArrowRight, Coins, Gauge, ImageOff, RefreshCcw, TriangleAlert, type LucideIcon } from 'lucide-react';
import { Fragment, type ComponentType } from 'react';
import { Link } from 'react-router';
import { BrandMark } from '../../../../components/brand/BrandMark.tsx';
import { useLocale } from '../../../../i18n/locale.tsx';
import { cn } from '../../../../lib/cn.ts';
import { pagePath } from '../../../../site/config.ts';
import type { HomeCopy } from '../../copy.ts';
import { AccelGauge, CreditMeter, GlitchThumbs, QualityPrice, RerollQueue, type VisualProps } from './PainVisuals.tsx';

export type ManifestoCopy = HomeCopy['manifesto'];
export type Tone = 'danger' | 'warning';

export interface BeatMeta {
  /** Latin HUD tag (decorative). */
  tag: string;
  tone: Tone;
  Icon: LucideIcon;
  Visual: ComponentType<VisualProps>;
}

/** One HUD visual per pain point, in the order of copy.manifesto.beats. */
export const BEATS: readonly BeatMeta[] = [
  { tag: 'MARKET · QUALITY / PRICE', tone: 'danger', Icon: TriangleAlert, Visual: QualityPrice },
  { tag: 'CREDITS · DRAIN', tone: 'danger', Icon: Coins, Visual: CreditMeter },
  { tag: 'RE-ROLL · QUEUE', tone: 'warning', Icon: RefreshCcw, Visual: RerollQueue },
  { tag: 'OUTPUT · ARTIFACTS', tone: 'danger', Icon: ImageOff, Visual: GlitchThumbs },
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

/** A manifesto line with its pain words tinted (danger or warning). */
export function BeatText({ text, hot, tone }: { text: string; hot: readonly string[]; tone: Tone }) {
  return (
    <>
      {splitHot(text, hot).map((part, index) =>
        part.hot ? (
          <em key={index} className={cn('home-hot not-italic', tone === 'danger' ? 'home-hot-danger' : 'home-hot-warning')}>
            {part.text}
          </em>
        ) : (
          <Fragment key={index}>{part.text}</Fragment>
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
