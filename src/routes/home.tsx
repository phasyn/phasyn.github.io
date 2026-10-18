import type { Route } from './+types/home';
import { HomePage } from '../features/home/HomePage.tsx';
import { HOME_META } from '../features/home/meta.ts';
import { pageMeta } from '../lib/meta.ts';
import { isLocale } from '../site/config.ts';

export function meta({ params }: Route.MetaArgs) {
  const locale = isLocale(params.lang) ? params.lang : 'en';
  return pageMeta({ locale, page: 'home', ...HOME_META[locale] });
}

export default function HomeRoute() {
  return <HomePage />;
}
