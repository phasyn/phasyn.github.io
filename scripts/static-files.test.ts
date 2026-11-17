import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, expect, test } from 'vitest';
import { resolveStatic, type StaticRoots } from './static-files.ts';

// The preview serves files by request path: nothing may resolve outside the two roots, and a path that cannot be decoded
// is answered instead of crashing the server.
const base = mkdtempSync(join(tmpdir(), 'phasyn-static-'));
const roots: StaticRoots = { site: join(base, 'site'), media: join(base, 'media') };
mkdirSync(join(roots.site, 'en'), { recursive: true });
mkdirSync(roots.media);
writeFileSync(join(roots.site, 'index.html'), 'home');
writeFileSync(join(roots.site, 'en', 'index.html'), 'en');
writeFileSync(join(roots.media, 'clip.mp4'), 'clip');
writeFileSync(join(base, 'secret.txt'), 'outside both roots');

afterAll(() => {
  rmSync(base, { recursive: true, force: true });
});

test.each([
  ['/', { kind: 'file', path: join(roots.site, 'index.html') }],
  ['/en', { kind: 'redirect', location: '/en/?q=1' }],
  ['/en/', { kind: 'file', path: join(roots.site, 'en', 'index.html') }],
  ['/media/clip.mp4', { kind: 'file', path: join(roots.media, 'clip.mp4') }],
  ['/../secret.txt', { kind: 'not-found' }],
  ['/..%2fsecret.txt', { kind: 'not-found' }],
  ['/%2e%2e/%2e%2e/secret.txt', { kind: 'not-found' }],
  ['/media/../../secret.txt', { kind: 'not-found' }],
  ['/media/..%2f..%2fsecret.txt', { kind: 'not-found' }],
  // Climbing past the top clamps to the site root.
  [
    '/..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..%2f..',
    { kind: 'file', path: join(roots.site, 'index.html') },
  ],
  ['/%E0%A4%A', { kind: 'bad-request' }],
])('resolveStatic(%j) stays inside the roots', (pathname, expected) => {
  expect(resolveStatic(pathname, '?q=1', roots)).toEqual(expected);
});
