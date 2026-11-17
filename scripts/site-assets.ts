// Which optional site images exist, read once when Vite starts (vite.config.ts injects the result as __SITE_ASSETS__).
//
// The Home scenes and the Tour sections show a real capture or a still only when its file is in public/, so a new capture
// dropped in with a known key appears on the next build and a missing one hides its scene; nothing is ever drawn in its
// place. Sizes come from the WebP headers, so every image reserves its exact box before it loads.
//
//   public/images/ui/<key>.webp + <key>@2x.webp + <key>@sm.webp   real Phasyn Studio captures (all three required)
//   public/images/art/<key>.webp                   stills made with Phasyn Studio (an optional <key>@2x.webp is used too);
//                                                  landscape or portrait, read from the size (src/lib/assets.ts `portrait`)
//   public/images/tour/<key>-poster.webp + <key>-poster-960.webp
//                                                  posters of the Tour screen recordings (both required); the recording
//                                                  itself, tour/<key>.mp4, is large media served from the media base
//                                                  (public/media during review, VITE_MEDIA_BASE in production), like works
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface AssetSize {
  width: number;
  height: number;
}

export interface ArtAsset extends AssetSize {
  /** A <key>@2x.webp copy exists. */
  hidpi: boolean;
}

export interface SiteAssets {
  ui: Record<string, AssetSize>;
  art: Record<string, ArtAsset>;
  /** Tour screen recordings whose posters are in public/images/tour, with the 1920-wide poster's size. */
  tour: Record<string, AssetSize>;
}

const u24 = (bytes: Buffer, at: number) =>
  (bytes[at] ?? 0) | ((bytes[at + 1] ?? 0) << 8) | ((bytes[at + 2] ?? 0) << 16);

/** Pixel size of a WebP file (lossy VP8, lossless VP8L or extended VP8X), or null if it is not one. */
export function webpSize(bytes: Buffer): AssetSize | null {
  if (bytes.length < 30 || bytes.toString('ascii', 0, 4) !== 'RIFF' || bytes.toString('ascii', 8, 12) !== 'WEBP')
    return null;
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: u24(bytes, 24) + 1, height: u24(bytes, 27) + 1 };
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (chunk === 'VP8L') {
    const b1 = bytes[22] ?? 0;
    const b2 = bytes[23] ?? 0;
    const b3 = bytes[24] ?? 0;
    return {
      width: 1 + ((((b1 & 0x3f) << 8) | (bytes[21] ?? 0)) >>> 0),
      height: 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    };
  }
  return null;
}

function list(dir: string): string[] {
  return existsSync(dir)
    ? readdirSync(dir).filter((name) => name.endsWith('.webp') && !name.includes('@2x') && !name.includes('@sm'))
    : [];
}

function sizeOf(path: string): AssetSize | null {
  return webpSize(readFileSync(path));
}

export function scanSiteAssets(publicDir: string): SiteAssets {
  const ui: SiteAssets['ui'] = {};
  const art: SiteAssets['art'] = {};
  const uiDir = join(publicDir, 'images/ui');
  for (const name of list(uiDir)) {
    const key = name.slice(0, -'.webp'.length);
    const size = sizeOf(join(uiDir, name));
    if (size && existsSync(join(uiDir, `${key}@2x.webp`)) && existsSync(join(uiDir, `${key}@sm.webp`))) ui[key] = size;
  }
  const artDir = join(publicDir, 'images/art');
  for (const name of list(artDir)) {
    const key = name.slice(0, -'.webp'.length);
    const size = sizeOf(join(artDir, name));
    if (size) art[key] = { ...size, hidpi: existsSync(join(artDir, `${key}@2x.webp`)) };
  }
  const tour: SiteAssets['tour'] = {};
  const tourDir = join(publicDir, 'images/tour');
  const poster = /^(.+)-poster\.webp$/;
  for (const name of existsSync(tourDir) ? readdirSync(tourDir) : []) {
    const key = poster.exec(name)?.[1];
    if (!key || !existsSync(join(tourDir, `${key}-poster-960.webp`))) continue;
    const size = sizeOf(join(tourDir, name));
    if (size) tour[key] = size;
  }
  return { ui, art, tour };
}
