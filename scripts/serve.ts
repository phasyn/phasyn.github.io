import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

// Local preview that behaves like GitHub Pages: directory index.html, /404.html for misses,
// plus byte ranges so review media in public/media can be scrubbed.
const root = resolve('build/client');
const mediaRoot = resolve('public/media');
const port = Number(process.env.PORT ?? 4173);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
};

function resolveFile(urlPath: string): string | undefined {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, '');
  const base = clean.startsWith('/media/') ? mediaRoot : root;
  const rel = clean.startsWith('/media/') ? clean.slice('/media'.length) : clean;
  let file = join(base, rel);
  if (!file.startsWith(base)) return undefined;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  return existsSync(file) ? file : undefined;
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  // GitHub Pages redirects a directory without its trailing slash.
  const asDir = join(root, decodeURIComponent(url.pathname));
  if (!url.pathname.endsWith('/') && !extname(url.pathname) && existsSync(asDir) && statSync(asDir).isDirectory()) {
    res.writeHead(301, { Location: `${url.pathname}/${url.search}` });
    res.end();
    return;
  }
  const file = resolveFile(url.pathname);
  const target = file ?? join(root, '404.html');
  const status = file ? 200 : 404;
  const type = TYPES[extname(target)] ?? 'application/octet-stream';
  const { size } = statSync(target);
  const range = req.headers.range?.match(/bytes=(\d*)-(\d*)/);
  if (range && status === 200) {
    const start = range[1] ? Number(range[1]) : 0;
    const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    createReadStream(target, { start, end }).pipe(res);
    return;
  }
  res.writeHead(status, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  createReadStream(target).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`preview: http://127.0.0.1:${port}/`));
