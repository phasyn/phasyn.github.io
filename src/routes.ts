import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  index('routes/locale-redirect.tsx'),
  route(':lang', 'routes/locale-layout.tsx', [
    index('routes/home.tsx'),
    route('tour', 'routes/tour.tsx'),
    route('showcase', 'routes/showcase.tsx'),
    route('benchmarks', 'routes/benchmarks.tsx'),
    route('about', 'routes/about.tsx'),
  ]),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
