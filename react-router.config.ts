import type { Config } from '@react-router/dev/config';
import { prerenderPaths } from './src/site/config.ts';

// Static site for GitHub Pages: every locale route is prerendered to HTML,
// and the route manifest ships whole because there is no server to ask.
export default {
  appDirectory: 'src',
  ssr: false,
  prerender: () => prerenderPaths(),
  routeDiscovery: { mode: 'initial' },
} satisfies Config;
