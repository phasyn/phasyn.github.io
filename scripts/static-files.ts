import { existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

// Request-to-file mapping and byte ranges for the local preview (scripts/serve.ts), kept apart from the server so the
// file boundary can be tested on its own.

export interface StaticRoots {
  /** The built site (build/client). */
  site: string;
  /** Review media (public/media), served under /media/. */
  media: string;
}

export type StaticTarget =
  | { kind: 'file'; path: string }
  /** GitHub Pages redirects a directory requested without its trailing slash. */
  | { kind: 'redirect'; location: string }
  | { kind: 'not-found' }
  /** A path that cannot be decoded. */
  | { kind: 'bad-request' };

/** Where a URL pathname (still percent-encoded) points inside the roots; it never resolves outside them. */
export function resolveStatic(pathname: string, search: string, roots: StaticRoots): StaticTarget {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return { kind: 'bad-request' };
  }
  // normalize() resolves ".." against the leading "/", so the path stays below whichever root it is joined to.
  const clean = normalize(`/${decoded}`);
  const media = clean.startsWith('/media/');
  const base = media ? roots.media : roots.site;
  const path = join(base, media ? clean.slice('/media'.length) : clean);
  const isDirectory = existsSync(path) && statSync(path).isDirectory();
  if (!media && isDirectory && !pathname.endsWith('/') && !extname(pathname))
    return { kind: 'redirect', location: `${pathname}/${search}` };
  const file = isDirectory ? join(path, 'index.html') : path;
  return existsSync(file) && statSync(file).isFile() ? { kind: 'file', path: file } : { kind: 'not-found' };
}

/**
 * One byte range from a `Range` header for a file of `size` bytes (RFC 9110 §14.1.2): `start-end`, `start-` or the suffix
 * form `-length`. Returns null when the header is absent, malformed or asks for several ranges (the whole file is sent),
 * and 'unsatisfiable' for a range that starts past the end (answered with 416).
 */
export function parseByteRange(
  header: string | undefined,
  size: number,
): { start: number; end: number } | 'unsatisfiable' | null {
  const match = header?.trim().match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;
  const [, first = '', last = ''] = match;
  if (!first && !last) return null;
  if (!first) {
    const length = Number(last);
    if (length === 0 || size === 0) return 'unsatisfiable';
    return { start: Math.max(0, size - length), end: size - 1 };
  }
  const start = Number(first);
  if (last && Number(last) < start) return null;
  if (start >= size) return 'unsatisfiable';
  return { start, end: last ? Math.min(Number(last), size - 1) : size - 1 };
}
