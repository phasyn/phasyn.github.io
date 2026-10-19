import type { Route } from './+types/benchmarks';
import { BenchmarksPage } from '../features/benchmarks/BenchmarksPage.tsx';
import { BENCHMARKS_META } from '../features/benchmarks/meta.ts';
import { pageMeta } from '../lib/meta.ts';
import { isLocale } from '../site/config.ts';

export function meta({ params }: Route.MetaArgs) {
  const locale = isLocale(params.lang) ? params.lang : 'en';
  return pageMeta({ locale, page: 'benchmarks', ...BENCHMARKS_META[locale] });
}

export default function BenchmarksRoute() {
  return <BenchmarksPage />;
}
