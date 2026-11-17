import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { parseByteRange, resolveStatic, type StaticRoots } from './static-files.ts';

// Local preview that behaves like GitHub Pages: directory index.html, /404.html for misses,
// plus byte ranges so review media in public/media can be scrubbed.
const roots: StaticRoots = { site: resolve('build/client'), media: resolve('public/media') };
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

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const resolved = resolveStatic(url.pathname, url.search, roots);
  if (resolved.kind === 'redirect') {
    res.writeHead(301, { Location: resolved.location });
    res.end();
    return;
  }
  if (resolved.kind === 'bad-request') {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request.\n');
    return;
  }
  const found = resolved.kind === 'file';
  const target = found ? resolved.path : join(roots.site, '404.html');
  // A rebuild empties build/client for a moment: answer instead of crashing the preview.
  if (!existsSync(target)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '2' });
    res.end('Rebuilding, try again in a moment.\n');
    return;
  }
  const type = TYPES[extname(target)] ?? 'application/octet-stream';
  const { size } = statSync(target);
  const range = found ? parseByteRange(req.headers.range, size) : null;
  if (range === 'unsatisfiable') {
    res.writeHead(416, { 'Content-Range': `bytes */${String(size)}`, 'Accept-Ranges': 'bytes' });
    res.end();
    return;
  }
  if (range) {
    res.writeHead(206, {
      'Content-Type': type,
      'Content-Range': `bytes ${String(range.start)}-${String(range.end)}/${String(size)}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': range.end - range.start + 1,
    });
    createReadStream(target, range)
      .on('error', () => {
        res.destroy();
      })
      .pipe(res);
    return;
  }
  res.writeHead(found ? 200 : 404, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes' });
  createReadStream(target)
    .on('error', () => {
      res.destroy();
    })
    .pipe(res);
}).listen(port, '127.0.0.1', () => {
  console.log(`preview: http://127.0.0.1:${String(port)}/`);
});
