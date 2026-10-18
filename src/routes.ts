import { index, route, type RouteConfig } from '@react-router/dev/routes';
import { STATIC_404_ROUTE_ID } from './site/config.ts';

export default [
  index('routes/locale-redirect.tsx'),
  // The prerendered /404 page (404.html): a static path, so "404" is never taken for a locale by `:lang`.
  route('404', 'routes/not-found.tsx', { id: STATIC_404_ROUTE_ID }),
  route(':lang', 'routes/locale-layout.tsx', [
    index('routes/home.tsx'),
    route('tour', 'routes/tour.tsx'),
    route('benchmarks', 'routes/benchmarks.tsx'),
    route('about', 'routes/about.tsx'),
  ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
