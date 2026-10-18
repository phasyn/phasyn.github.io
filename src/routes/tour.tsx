import type { Route } from './+types/tour';
import { TourPage } from '../features/tour/TourPage.tsx';
import { TOUR_META } from '../features/tour/meta.ts';
import { pageMeta } from '../lib/meta.ts';
import { isLocale } from '../site/config.ts';

export function meta({ params }: Route.MetaArgs) {
  const locale = isLocale(params.lang) ? params.lang : 'en';
  return pageMeta({ locale, page: 'tour', ...TOUR_META[locale] });
}

export default function TourRoute() {
  return <TourPage />;
}
