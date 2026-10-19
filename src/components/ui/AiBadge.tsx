import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { useLocale, type Copy } from '../../i18n/locale.tsx';
import type { Locale } from '../../site/config.ts';

/**
 * Which disclosure a piece of media needs:
 * - `h3`: video generated with MiniMax H3 (its Community License asks for "Powered by MiniMax H3"; its acceptable-use
 *   policy asks that generated content be clearly marked as machine-generated);
 * - `qwen`: image generated with Qwen-Image 2.1;
 * - `mixed`: screen recordings and films that contain generated media from both;
 * - `screen`: a real still capture of the app that visibly shows generated media (which captures: src/site/captures.ts).
 */
export type AiBadgeVariant = 'h3' | 'qwen' | 'mixed' | 'screen';

/** "Powered by MiniMax H3" stays verbatim (English) in every locale. */
const POWERED = 'Powered by MiniMax H3';

export const AI_BADGE_TEXT: Copy<Record<AiBadgeVariant, string>> = {
  'zh-hant': {
    h3: `AI 生成 · ${POWERED}`,
    qwen: 'AI 生成 · Qwen-Image 2.1',
    mixed: '含 AI 生成內容（MiniMax H3、Qwen-Image 2.1）',
    screen: '實際畫面 · 含 AI 生成內容',
  },
  ja: {
    h3: `AI 生成 · ${POWERED}`,
    qwen: 'AI 生成 · Qwen-Image 2.1',
    mixed: 'AI 生成コンテンツを含みます（MiniMax H3・Qwen-Image 2.1）',
    screen: '実際の画面 · AI 生成コンテンツを含みます',
  },
  en: {
    h3: `AI-generated · ${POWERED}`,
    qwen: 'AI-generated · Qwen-Image 2.1',
    mixed: 'Contains AI-generated content (MiniMax H3, Qwen-Image 2.1)',
    screen: 'Real screen · contains AI-generated content',
  },
};

/** The badge text for a locale, e.g. for alt text, figcaptions or a page that renders its own label. */
export function aiBadgeText(variant: AiBadgeVariant, locale: Locale): string {
  return AI_BADGE_TEXT[locale][variant];
}

interface AiBadgeProps {
  variant: AiBadgeVariant;
  className?: string;
}

/**
 * Machine-generated content disclosure: a compact chip with an opaque dark backdrop, so it reads on any video frame or
 * image (light text on sunken ≈ 18:1). Text stays selectable and is read by assistive tech; the English "Powered by"
 * phrase is marked `lang="en"` inside zh-hant and ja text. Wraps on narrow players instead of overflowing.
 */
export function AiBadge({ variant, className }: AiBadgeProps) {
  const locale = useLocale();
  const text = AI_BADGE_TEXT[locale][variant];
  const at = locale === 'en' ? -1 : text.indexOf(POWERED);
  return (
    <span
      className={cn(
        'inline-flex max-w-full min-h-6 items-center gap-1.5 rounded-lg border border-[rgb(255_255_255_/_0.14)] bg-sunken px-2.5 py-0.5',
        'text-caption font-medium text-fg shadow-[0_2px_10px_rgb(2_4_9_/_0.6)] [text-wrap:balance]',
        className,
      )}
    >
      <Sparkles aria-hidden className="size-3.5 shrink-0 text-brand-cyan" />
      <span>
        {at < 0 ? (
          text
        ) : (
          <>
            {text.slice(0, at)}
            <span lang="en">{POWERED}</span>
            {text.slice(at + POWERED.length)}
          </>
        )}
      </span>
    </span>
  );
}
