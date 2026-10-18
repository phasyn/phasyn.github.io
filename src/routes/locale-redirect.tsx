import { BrandMark } from '../components/brand/BrandMark.tsx';
import { Wordmark } from '../components/brand/Wordmark.tsx';
import { HTML_LANG, LOCALES, LOCALE_STORAGE_KEY, pagePath, pageUrl } from '../site/config.ts';
import { COMMON } from '../i18n/common.ts';

// `/` picks a locale before first paint: saved choice → browser language → English.
const chooser = `(function(){try{var ok={'zh-hant':1,ja:1,en:1},l=null;try{l=localStorage.getItem('${LOCALE_STORAGE_KEY}')}catch(e){}if(!ok[l]){var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();l=n.indexOf('zh')===0?'zh-hant':n.indexOf('ja')===0?'ja':'en'}location.replace('/'+l+'/'+location.search+location.hash)}catch(e){}})();`;

export function meta() {
  return [
    { title: 'Phasyn Studio — AI-Native Filmmaking Platform' },
    { name: 'description', content: 'Phasyn Studio: a personal AI filmmaking workbench — text, image and video in one controllable pipeline.' },
    ...LOCALES.map((locale) => ({ tagName: 'link', rel: 'alternate', hrefLang: HTML_LANG[locale], href: pageUrl(locale, 'home') })),
    { tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: pageUrl('en', 'home') },
  ];
}

export default function LocaleRedirect() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6 text-center">
      <script dangerouslySetInnerHTML={{ __html: chooser }} />
      <div className="grid justify-items-center gap-6">
        <BrandMark size={72} glow />
        <Wordmark width={180} tagline />
        <ul className="flex flex-wrap justify-center gap-3">
          {LOCALES.map((locale) => (
            <li key={locale}>
              <a href={pagePath(locale, 'home')} lang={HTML_LANG[locale]} className="text-body text-action-fg">
                {COMMON[locale].languageName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
