import type { Locale } from '../../site/config.ts';

/**
 * The Showcase page (/{locale}/showcase/) lands in main separately. Until `showcase` joins PAGES in site/config.ts this mirrors
 * pagePath()'s layout; switch to `pagePath(locale, 'showcase')` then.
 */
export function showcasePath(locale: Locale): string {
  return `/${locale}/showcase/`;
}
