import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { scanSiteAssets } from './scripts/site-assets.ts';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: { host: '127.0.0.1' },
  build: { sourcemap: false, target: 'es2022', assetsInlineLimit: 0 },
  // Optional captures and stills present in public/ (src/lib/assets.ts). Read at startup: restart `pnpm dev` after adding one.
  define: { __SITE_ASSETS__: JSON.stringify(scanSiteAssets('public')) },
});
