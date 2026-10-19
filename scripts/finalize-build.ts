import { copyFileSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HTML_LANG, LOCALES, PAGES, pageUrl } from '../src/site/config.ts';

// Post-process the prerendered output for GitHub Pages.
const output = join(process.cwd(), 'build/client');

// GitHub Pages serves /404.html for unknown paths.
const prerendered404 = join(output, '404/index.html');
if (existsSync(prerendered404)) {
  copyFileSync(prerendered404, join(output, '404.html'));
  rmSync(join(output, '404'), { recursive: true, force: true });
}

// Media during review lives in public/media (git-ignored) and must never ship in the Pages artifact.
rmSync(join(output, 'media'), { recursive: true, force: true });

// Sitemap with hreflang alternates for every locale page.
const today = new Date().toISOString().slice(0, 10);
const entries = LOCALES.flatMap((locale) =>
  PAGES.map((page) => {
    const alternates = LOCALES.map((alt) => `    <xhtml:link rel="alternate" hreflang="${HTML_LANG[alt]}" href="${pageUrl(alt, page)}"/>`).join('\n');
    return `  <url>\n    <loc>${pageUrl(locale, page)}</loc>\n    <lastmod>${today}</lastmod>\n${alternates}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${pageUrl('en', page)}"/>\n  </url>`;
  }),
);
writeFileSync(
  join(output, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`,
);

// Report the artifact size so oversized media is caught before deploy.
function size(dir: string): number {
  return readdirSync(dir).reduce((total, name) => {
    const path = join(dir, name);
    const info = statSync(path);
    return total + (info.isDirectory() ? size(path) : info.size);
  }, 0);
}
const bytes = size(output);
console.log(`finalize-build: ${(bytes / 1024 / 1024).toFixed(1)} MB in build/client`);
if (bytes > 200 * 1024 * 1024) {
  console.error('finalize-build: artifact exceeds 200 MB; move large media to the Hugging Face dataset.');
  process.exit(1);
}
