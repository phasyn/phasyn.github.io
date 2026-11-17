import type { Route } from './+types/about';
import { AboutPage } from '../features/about/AboutPage.tsx';
import { ABOUT_META } from '../features/about/meta.ts';
import { pageMeta } from '../lib/meta.ts';
import { isLocale } from '../site/config.ts';

export function meta({ params }: Route.MetaArgs) {
  const locale = isLocale(params.lang) ? params.lang : 'en';
  return pageMeta({ locale, page: 'about', ...ABOUT_META[locale] });
}

export default function AboutRoute() {
  return <AboutPage />;
}
