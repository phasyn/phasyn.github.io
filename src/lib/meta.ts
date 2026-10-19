import type { MetaDescriptor } from 'react-router';
import { COMMON } from '../i18n/common.ts';
import { HTML_LANG, LOCALES, OG_LOCALE, SITE_URL, pageUrl, type Locale, type Page } from '../site/config.ts';

interface PageMeta {
  locale: Locale;
  page: Page;
  title: string;
  description: string;
  /** Site-relative image path (1200×630); defaults to the page's own card, public/og/<page>-<locale>.jpg (scripts/og). */
  image?: string;
}

/**
 * Structured data for the site itself (FE-22): a WebSite by its author. Deliberately no offers, prices or ratings —
 * Phasyn Studio is a personal, non-commercial project.
 */
function websiteJsonLd(locale: Locale): MetaDescriptor {
  return {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Phasyn Studio',
      url: `${SITE_URL}/`,
      inLanguage: LOCALES.map((alt) => HTML_LANG[alt]),
      description: COMMON[locale].footerMadeBy,
      creator: { '@type': 'Person', name: 'DennySORA' },
    },
  };
}

/** Title, description, canonical, hreflang alternates, social cards and site JSON-LD for one prerendered page. */
export function pageMeta({ locale, page, title, description, image = `/og/${page}-${locale}.jpg` }: PageMeta): MetaDescriptor[] {
  const url = pageUrl(locale, page);
  const imageUrl = `${SITE_URL}${image}`;
  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    ...LOCALES.map((alt) => ({ tagName: 'link', rel: 'alternate', hrefLang: HTML_LANG[alt], href: pageUrl(alt, page) })),
    { tagName: 'link', rel: 'alternate', hrefLang: 'x-default', href: pageUrl('en', page) },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Phasyn Studio' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: title },
    { property: 'og:locale', content: OG_LOCALE[locale] },
    ...LOCALES.filter((alt) => alt !== locale).map((alt) => ({ property: 'og:locale:alternate', content: OG_LOCALE[alt] })),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: title },
    websiteJsonLd(locale),
  ];
}
