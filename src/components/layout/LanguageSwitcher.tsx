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

/** Plain links to the same page in each locale; works without JavaScript. */
export function LanguageSwitcher({ className, full = false }: { className?: string; full?: boolean }) {
  const current = useLocale();
  const page = pageFromPath(useLocation().pathname);
  return (
    <nav aria-label={commonCopy(current).languageLabel} className={cn('flex items-center gap-0.5 rounded-full border border-line bg-sunken/70 p-0.5', className)}>
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
              'pressable inline-flex min-h-7 items-center rounded-full px-2.5 text-caption font-medium no-underline',
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
