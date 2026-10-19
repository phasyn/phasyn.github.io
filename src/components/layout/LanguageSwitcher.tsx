import { Link, useLocation } from 'react-router';
import { cn } from '../../lib/cn.ts';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { HTML_LANG, LOCALES, LOCALE_STORAGE_KEY, pageFromPath, pagePath, type Locale } from '../../site/config.ts';

const SHORT: Record<Locale, string> = { 'zh-hant': '繁中', ja: '日本語', en: 'EN' };

function remember(locale: Locale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Private mode or blocked storage: the link still switches language.
  }
}

/**
 * Plain links to the same page in each locale; works without JavaScript. `label` names the landmark when the page has more
 * than one switcher (header and footer must not both be called 語言 / 言語 / Language).
 */
export function LanguageSwitcher({ className, full = false, label }: { className?: string; full?: boolean; label?: string }) {
  const current = useLocale();
  const page = pageFromPath(useLocation().pathname);
  return (
    <nav aria-label={label ?? commonCopy(current).languageLabel} className={cn('flex items-center gap-0.5 rounded-full border border-line bg-sunken/70 p-0.5', className)}>
      {LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            to={pagePath(locale, page)}
            lang={HTML_LANG[locale]}
            hrefLang={HTML_LANG[locale]}
            aria-current={active ? 'true' : undefined}
            onClick={() => remember(locale)}
            className={cn(
              'pressable inline-flex items-center rounded-full text-caption font-medium no-underline',
              // The full switcher (mobile menu, footer) is a touch target: 44 px tall (FE-14). The header's short one stays compact.
              full ? 'min-h-11 px-4' : 'min-h-7 px-2.5',
              active ? 'bg-overlay text-fg shadow-edge' : 'text-fg-tertiary hover:text-fg',
            )}
          >
            {full ? commonCopy(locale).languageName : SHORT[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
