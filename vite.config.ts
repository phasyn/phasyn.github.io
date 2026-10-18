import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: { host: '127.0.0.1' },
  build: { sourcemap: false, target: 'es2022', assetsInlineLimit: 0 },
});
