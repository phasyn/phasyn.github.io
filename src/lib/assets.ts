import { ART, type ArtKey } from '../site/art.ts';
import type { CaptureKey } from '../site/captures.ts';
import type { TourVideoKey } from '../site/tour-videos.ts';

/*
 * Which optional images exist, fixed at build time (vite.config.ts scans public/ with scripts/site-assets.ts). The prerender
 * and the client share the same answer, so a scene that is left out never hydrates differently.
 */
const ASSETS = __SITE_ASSETS__;

export interface Size {
  width: number;
  height: number;
}

/** Size of a capture's 1x file, or undefined when the capture (or its @2x copy) is not in public/images/ui. */
export function captureSize(key: CaptureKey): Size | undefined {
  return ASSETS.ui[key];
}

export function hasCapture(key: CaptureKey): boolean {
  return captureSize(key) !== undefined;
}

export interface ArtImage extends Size {
  key: ArtKey;
  hidpi: boolean;
  /** Taller than wide. */
  portrait: boolean;
  focus: string;
  portraitFocus: string;
  portraitFit?: 'width';
  badge: (typeof ART)[ArtKey]['badge'];
}

export function artImage(key: ArtKey): ArtImage | undefined {
  const found = ASSETS.art[key];
  return found
    ? {
        key,
        ...found,
        portrait: found.height > found.width,
        focus: ART[key].focus,
        portraitFocus: ART[key].portraitFocus ?? ART[key].focus,
        ...(ART[key].portraitFit ? { portraitFit: ART[key].portraitFit } : {}),
        badge: ART[key].badge,
      }
    : undefined;
}

/** The stills of `keys` that exist, in order. */
export function artImages(keys: readonly ArtKey[]): ArtImage[] {
  return keys.map(artImage).filter((image): image is ArtImage => image !== undefined);
}

export interface TourVideo {
  /** Path under the media base (pass to mediaUrl). */
  path: string;
  poster: Size & { src: string; srcSet: string };
}

/** A Tour screen recording whose posters exist (the mp4 itself lives on the media base), or undefined. */
export function tourVideo(key: TourVideoKey): TourVideo | undefined {
  const size = ASSETS.tour[key];
  if (!size) return undefined;
  const src = `/images/tour/${key}-poster.webp`;
  return {
    path: `tour/${key}.mp4`,
    poster: { ...size, src, srcSet: `${src} ${String(size.width)}w, /images/tour/${key}-poster-960.webp 960w` },
  };
}
