/*
 * Stills made with Phasyn Studio: public/images/art/<key>.webp (an optional <key>@2x.webp is
 * used as well). A key shows only when its file exists (scripts/site-assets.ts); each slot that uses it disappears otherwise.
 *
 * Re-tune here: which still is the Home hero's backdrop (`HERO_ART`, first one present wins), which three show the same
 * character in different scenes (`REFERENCE_ART`), which illustration opens each Home scene (`SCENE_ART`), where each
 * still's subject sits (`focus`, CSS object-position) and which disclosure it needs (`badge`: `h3` for a frame of an H3
 * video, `qwen` for a Qwen-Image still, `mixed` if unsure). Stills are 1664×960 unless their file says otherwise; a still
 * taller than wide is a portrait one (`ArtImage.portrait`).
 */

export const ART_KEYS = [
  'hero-trio',
  'hero-portrait',
  'describe-neon',
  'ref-ruins',
  'ref-pixel',
  'ref-voxel',
  'takes-board',
  'edit-clay',
  'render-deck',
  'plugins-woodblock',
  'local-cabin',
  'finale-trio',
  'upscale-1x',
  'upscale-2x',
] as const;
export type ArtKey = (typeof ART_KEYS)[number];

export interface ArtSpec {
  /** CSS object-position of the subject, used when the still is cropped. */
  focus: string;
  /** Subject position on portrait screens, when the wide crop would lose it (Home scene illustrations only). */
  portraitFocus?: string;
  /**
   * `width`: on portrait screens the Home band shows the still's whole width instead of a crop (several characters side by
   * side, whose faces a phone-width crop would cut).
   */
  portraitFit?: 'width';
  badge: 'h3' | 'qwen' | 'mixed';
}

// Home band stills (SCENE_ART) keep the characters' heads in the band's clear part: `focus` y near 0 % (the band shows
// the still's upper part, home.css), and on phones `portraitFocus` x centres the face in the narrow crop.
// The three site characters (lab/site-characters/SPEC.md), each still in a different game-like look, made with
// Qwen-Image 2.1 in Phasyn Studio. A key without its file is simply skipped.
export const ART: Record<ArtKey, ArtSpec> = {
  'hero-trio': { focus: '50% 40%', badge: 'qwen' },
  // 960×1664: the Home hero's backdrop on portrait screens.
  'hero-portrait': { focus: '50% 40%', badge: 'qwen' },
  'describe-neon': { focus: '55% 22%', portraitFocus: '61% 50%', badge: 'qwen' },
  'ref-ruins': { focus: '58% 45%', badge: 'qwen' },
  'ref-pixel': { focus: '55% 55%', badge: 'qwen' },
  'ref-voxel': { focus: '30% 55%', badge: 'qwen' },
  'takes-board': { focus: '58% 0%', portraitFocus: '67% 50%', badge: 'qwen' },
  'edit-clay': { focus: '56% 8%', portraitFocus: '64% 50%', badge: 'qwen' },
  'render-deck': { focus: '48% 0%', portraitFocus: '46% 50%', badge: 'qwen' },
  'plugins-woodblock': { focus: '50% 35%', badge: 'qwen' },
  'local-cabin': { focus: '62% 6%', portraitFocus: '74% 50%', badge: 'qwen' },
  'finale-trio': { focus: '50% 0%', portraitFit: 'width', badge: 'qwen' },
  // The same frame before and after the 2× Anime4K upscale (Home's upscale scene appears once both exist): 1280 and 2560 wide.
  'upscale-1x': { focus: '50% 50%', badge: 'h3' },
  'upscale-2x': { focus: '50% 50%', badge: 'h3' },
};

/** Home hero backdrop, in order of preference (used when no showcase work is published). */
export const HERO_ART: readonly ArtKey[] = ['hero-trio', 'finale-trio'];

/** Home hero backdrop on portrait screens (taller than wide), when the hero is a still. */
export const HERO_PORTRAIT_ART: ArtKey = 'hero-portrait';

/** The Home scenes that can open with an illustration (`start` is the close). */
export type SceneArtId = 'describe' | 'reference' | 'takes' | 'edit' | 'render' | 'plugins' | 'local' | 'start';

/**
 * The illustration that opens each Home scene: a full-bleed band whose lower edge fades into the night under the scene's
 * headline. It never covers a capture; a scene without an entry (or without its still) opens without a band. `reference`
 * has none: its three character stills are the scene. `plugins` waits for its capture.
 */
export const SCENE_ART: Partial<Record<SceneArtId, ArtKey>> = {
  describe: 'describe-neon',
  takes: 'takes-board',
  edit: 'edit-clay',
  render: 'render-deck',
  plugins: 'plugins-woodblock',
  local: 'local-cabin',
  start: 'finale-trio',
};

/** Home "same character, any scene": three stills of one character in three different looks (all three needed). */
export const REFERENCE_ART: readonly ArtKey[] = ['ref-voxel', 'ref-pixel', 'ref-ruins'];

export function artSources(key: ArtKey, hidpi: boolean, width: number): { src: string; srcSet?: string } {
  const src = `/images/art/${key}.webp`;
  return hidpi
    ? { src, srcSet: `${src} ${String(width)}w, /images/art/${key}@2x.webp ${String(width * 2)}w` }
    : { src };
}
