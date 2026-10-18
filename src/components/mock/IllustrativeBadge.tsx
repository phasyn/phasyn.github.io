import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { cn } from '../../lib/cn.ts';
import { HTML_LANG } from '../../site/config.ts';

/**
 * The required visible label on every illustrative UI re-creation (BRIEF §5): 「介面示意」/「UI イメージ」/"Illustrative UI".
 * Real text in the page language (tagged with `lang`, because mock windows themselves are `lang="en"`), never hidden.
 */
export function IllustrativeBadge({ className }: { className?: string }) {
  const locale = useLocale();
  return (
    <span
      lang={HTML_LANG[locale]}
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-sunken/90 px-2 text-[11px] leading-none font-medium whitespace-nowrap text-fg-secondary',
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-warning" />
      {commonCopy(locale).illustrative}
    </span>
  );
}
