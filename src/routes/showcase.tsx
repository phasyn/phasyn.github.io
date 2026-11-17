import type { Route } from './+types/showcase';
import { ShowcasePage } from '../features/showcase/ShowcasePage.tsx';
import { SHOWCASE_META } from '../features/showcase/meta.ts';
import { pageMeta } from '../lib/meta.ts';
import { isLocale } from '../site/config.ts';

export function meta({ params }: Route.MetaArgs) {
  const locale = isLocale(params.lang) ? params.lang : 'en';
  return pageMeta({ locale, page: 'showcase', ...SHOWCASE_META[locale] });
}

export default function ShowcaseRoute() {
  return <ShowcasePage />;
}
