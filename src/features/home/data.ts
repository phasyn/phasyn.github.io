// What each Home scene shows, decided once at build time from what exists: published works (src/site/works.gen.ts), real
// captures (public/images/ui) and stills (public/images/art). A scene whose material is missing is left out entirely; the
// rest renumber themselves. To change a scene's picture or its focus regions, edit src/site/captures.ts or src/site/art.ts.
import { artImage, artImages, hasCapture, type ArtImage } from '../../lib/assets.ts';
import { rankedWorks } from '../../lib/works.ts';
import { HERO_ART, HERO_PORTRAIT_ART, REFERENCE_ART, SCENE_ART, type SceneArtId } from '../../site/art.ts';
import type { Work } from '../../site/works.ts';
import { WORKS } from '../../site/works.gen.ts';

/**
 * The intro film block on Home (November 2026 film: <media base>/films/intro.mp4, captions in public/captions/films). Set to
 * false to hide the block, e.g. while a new cut is being made.
 */
export const INTRO_FILM_READY = false as boolean;

/**
 * Which published works Home features (hero loop, works scene): the battle pieces are one of the site's main showcases, so
 * Home shows only `battle` works; the rest live on the Works page. With no battle work published, Home falls back to the
 * stills and the real captures.
 */
export const HOME_WORK_CATEGORY = 'battle' as const;

const RANKED = rankedWorks(WORKS.filter((work) => work.category === HOME_WORK_CATEGORY));
const LANDSCAPE = RANKED.filter((work) => work.orientation === 'landscape');

export type HeroVisual =
  { kind: 'work'; work: Work } | { kind: 'art'; image: ArtImage } | { kind: 'capture' } | { kind: 'none' };

/** Hero, in order: the best published work (muted loop) → a still → the Shot workspace capture → type only. */
export const HERO: HeroVisual = (() => {
  const work = LANDSCAPE[0];
  if (work) return { kind: 'work', work };
  const image = artImages(HERO_ART)[0];
  if (image) return { kind: 'art', image };
  return hasCapture('shot-workspace') ? { kind: 'capture' } : { kind: 'none' };
})();

/** The hero still on portrait screens (only when the hero is a still and the portrait one exists). */
export const HERO_PORTRAIT: ArtImage | undefined = (() => {
  const image = HERO.kind === 'art' ? artImage(HERO_PORTRAIT_ART) : undefined;
  return image?.portrait ? image : undefined;
})();

/** The illustration that opens a scene, or undefined when its file is missing (the scene then opens without one). */
export function sceneArt(id: SceneArtId): ArtImage | undefined {
  const key = SCENE_ART[id];
  const image = key ? artImage(key) : undefined;
  return image && !image.portrait ? image : undefined;
}

/** Scene 1: the Shot workspace (prompt → take), else a published work. */
export const PROMPT_VISUAL: { kind: 'capture' } | { kind: 'work'; work: Work } | null = hasCapture('shot-workspace')
  ? { kind: 'capture' }
  : LANDSCAPE[0]
    ? { kind: 'work', work: LANDSCAPE[0] }
    : null;

/** Scene 2: three works made with a character reference, else three stills of one character; fewer → no scene. */
export const REFERENCE_VISUAL: { kind: 'works'; works: Work[] } | { kind: 'art'; images: ArtImage[] } | null = (() => {
  // The stills show one character in three game looks, which is the point of this scene; works are the fallback.
  const images = artImages(REFERENCE_ART);
  if (images.length >= 3) return { kind: 'art', images: images.slice(0, 3) };
  const works = LANDSCAPE.filter((work) => work.features.includes('characterRef')).slice(0, 3);
  return works.length === 3 ? { kind: 'works', works } : null;
})();

/** Scene 3: the A/B compare capture, else the take strip of the Shot workspace. */
export const TAKES_CAPTURE = hasCapture('shot-takes-compare')
  ? ('shot-takes-compare' as const)
  : hasCapture('shot-workspace')
    ? ('shot-workspace' as const)
    : null;

export const EDIT_READY = hasCapture('edit-workspace');
export const RENDER_READY = hasCapture('render-queue');
export const PLUGINS_READY = hasCapture('plugin-manager');

/** Scene "upscale": the same frame before and after, both present. */
export const UPSCALE_PAIR = (() => {
  const [before, after] = artImages(['upscale-1x', 'upscale-2x']);
  return before && after && after.key === 'upscale-2x' ? { before, after } : null;
})();

/** Battle preview: up to six landscape battle works; fewer than three → no scene. */
export const PREVIEW_WORKS: readonly Work[] = LANDSCAPE.length >= 3 ? LANDSCAPE.slice(0, 6) : [];
