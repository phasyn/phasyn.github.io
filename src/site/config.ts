// Single source for locales, pages and public URLs. Imported by the build
// config (prerender list) and by the app, so it must stay free of React.

export const LOCALES = ['zh-hant', 'ja', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-hant';
export const LOCALE_STORAGE_KEY = 'phasyn.locale';

/** BCP 47 tag for `<html lang>` and `hreflang`. */
export const HTML_LANG: Record<Locale, string> = {
  'zh-hant': 'zh-Hant',
  ja: 'ja',
  en: 'en',
};

/** OpenGraph locale tags. */
export const OG_LOCALE: Record<Locale, string> = {
  'zh-hant': 'zh_TW',
  ja: 'ja_JP',
  en: 'en_US',
};

export const PAGES = ['home', 'tour', 'showcase', 'benchmarks', 'about'] as const;
export type Page = (typeof PAGES)[number];

const PAGE_SEGMENT: Record<Page, string> = {
  home: '',
  tour: 'tour/',
  showcase: 'showcase/',
  benchmarks: 'benchmarks/',
  about: 'about/',
};

export const SITE_URL = 'https://phasyn.dev';
export const LINKS = {
  github: 'https://github.com/phasyn',
  huggingface: 'https://huggingface.co/phasyn',
  email: 'phasyn@phasyn.dev',
} as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Site-relative path with a trailing slash, matching the static file layout. */
export function pagePath(locale: Locale, page: Page): string {
  return `/${locale}/${PAGE_SEGMENT[page]}`;
}

export function pageUrl(locale: Locale, page: Page): string {
  return `${SITE_URL}${pagePath(locale, page)}`;
}

/** Which page a pathname belongs to, ignoring the locale prefix. */
export function pageFromPath(pathname: string): Page {
  const rest = pathname.split('/').filter(Boolean).slice(1);
  const first = rest[0] ?? '';
  return (PAGES.find((page) => PAGE_SEGMENT[page] === `${first}/`) ?? 'home') as Page;
}

export function localeFromPath(pathname: string): Locale | undefined {
  const first = pathname.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : undefined;
}

export function prerenderPaths(): string[] {
  const paths = ['/', '/404'];
  for (const locale of LOCALES) for (const page of PAGES) paths.push(pagePath(locale, page));
  return paths;
}
