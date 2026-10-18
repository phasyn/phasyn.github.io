import { BrandMark } from '../components/brand/BrandMark.tsx';
import { Wordmark } from '../components/brand/Wordmark.tsx';
import { HOME_META } from '../features/home/meta.ts';
import { pageMeta } from '../lib/meta.ts';
import { HTML_LANG, LOCALES, LOCALE_STORAGE_KEY, SITE_URL, pagePath } from '../site/config.ts';
import { COMMON } from '../i18n/common.ts';

// `/` picks a locale before first paint: saved choice → browser language → English.
const chooser = `(function(){try{var ok={'zh-hant':1,ja:1,en:1},l=null;try{l=localStorage.getItem('${LOCALE_STORAGE_KEY}')}catch(e){}if(!ok[l]){var n=((navigator.languages&&navigator.languages[0])||navigator.language||'').toLowerCase();l=n.indexOf('zh')===0?'zh-hant':n.indexOf('ja')===0?'ja':'en'}location.replace('/'+l+'/'+location.search+location.hash)}catch(e){}})();`;

// `/` shares the English home page's title, description and social card, so a bare phasyn.dev link gets a preview.
export function meta() {
  const { title, description } = HOME_META.en;
  return pageMeta({ locale: 'en', page: 'home', title, description }).map((tag) => {
    if ('rel' in tag && tag.rel === 'canonical') return { ...tag, href: `${SITE_URL}/` };
    if ('property' in tag && tag.property === 'og:url') return { ...tag, content: `${SITE_URL}/` };
    return tag;
  });
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
