import { BrandMark } from '../brand/BrandMark.tsx';
import { Wordmark } from '../brand/Wordmark.tsx';
import { cn } from '../../lib/cn.ts';
import { COMMON } from '../../i18n/common.ts';
import { HTML_LANG, LOCALES, LOCALE_STORAGE_KEY, PAGES, pagePath, type Locale } from '../../site/config.ts';

const LOCALIZED = Object.fromEntries(LOCALES.map((locale) => [locale, [HTML_LANG[locale], `${COMMON[locale].notFoundTitle} — Phasyn Studio`]]));

/*
 * The 404 page ships without client scripts (FE-22). This inline script runs before paint: it picks the visitor's locale
 * (path prefix → saved choice → browser language → English), localises <html lang> and the title, and sets
 * <html data-locale> so the CSS below shows that locale's navigation and puts its message first.
 */
const LOCALIZE = `(function(){try{var d=document.documentElement,t=${JSON.stringify(LOCALIZED)},ok={'zh-hant':1,ja:1,en:1},l=location.pathname.split('/')[1];if(ok[l]!==1){l=null;try{l=localStorage.getItem('${LOCALE_STORAGE_KEY}')}catch(e){}if(ok[l]!==1){var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();l=n.indexOf('zh')===0?'zh-hant':n.indexOf('ja')===0?'ja':'en'}}d.lang=t[l][0];d.setAttribute('data-locale',l);document.title=t[l][1]}catch(e){}})();`;

// One navigation per locale; only the visitor's shows (English without JavaScript). Literal class names: Tailwind scans source.
const NAV_SHOWN: Record<Locale, string> = {
  'zh-hant': '[:root[data-locale=zh-hant]_&]:block',
  ja: '[:root[data-locale=ja]_&]:block',
  en: '[:root[data-locale=en]_&]:block [:root:not([data-locale])_&]:block',
};
const MESSAGE_FIRST: Record<Locale, string> = {
  'zh-hant': '[:root[data-locale=zh-hant]_&]:-order-1',
  ja: '[:root[data-locale=ja]_&]:-order-1',
  en: '[:root[data-locale=en]_&]:-order-1',
};

/**
 * Shared by the static /404 route (GitHub Pages' 404.html), the catch-all route and invalid locales. Plain links only, so
 * it works as static HTML: a header with the site navigation, then the message in all three languages.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <script dangerouslySetInnerHTML={{ __html: LOCALIZE }} />
      <header className="border-b border-[rgb(255_255_255_/_0.06)] bg-[rgb(7_11_20_/_0.55)]">
        <div className="site-container flex min-h-(--site-header-h) flex-wrap items-center gap-x-6 gap-y-1 py-1.5">
          <a href="/" className="pressable flex min-h-11 items-center gap-2.5 text-fg no-underline" aria-label="Phasyn Studio">
            <BrandMark size={28} glow />
            <Wordmark width={92} short decorative />
          </a>
          {LOCALES.map((locale) => (
            <nav key={locale} lang={HTML_LANG[locale]} aria-label={COMMON[locale].navLabel} className={cn('ml-auto hidden', NAV_SHOWN[locale])}>
              <ul className="flex flex-wrap items-center gap-1">
                {PAGES.map((page) => (
                  <li key={page}>
                    <a
                      href={pagePath(locale, page)}
                      className="inline-flex min-h-11 items-center rounded-md px-3 text-data font-medium text-fg-secondary no-underline hover:bg-raised/60 hover:text-fg"
                    >
                      {COMMON[locale].nav[page]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </header>
      <main className="grid flex-1 place-items-center p-6">
        <div className="grid max-w-xl justify-items-center gap-6 text-center">
          <BrandMark size={64} glow />
          <p className="eyebrow text-fg-tertiary" lang="en">
            404 · Phasyn Studio
          </p>
          <div className="flex flex-col gap-4">
            {LOCALES.map((locale) => (
              <section key={locale} lang={HTML_LANG[locale]} className={cn('grid gap-1', MESSAGE_FIRST[locale])}>
                <h1 className="text-section font-semibold text-fg">{COMMON[locale].notFoundTitle}</h1>
                <p className="text-body text-fg-secondary">
                  {COMMON[locale].notFoundBody} <a href={pagePath(locale, 'home')}>{COMMON[locale].notFoundBack}</a>
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
