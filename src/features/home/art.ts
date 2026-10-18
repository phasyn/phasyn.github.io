// Single map of every illustration on the Home page. Swap a path here to replace the art everywhere.
// Cutouts: Codex illustration set F1–F14 (work/art/ASSETS.md; transparency QA passed), copied at 480 px into
// public/images/home/art/. Each keeps a brand-system fallback (public/brand/…) used if the cutout fails to load; `null`
// means a lucide icon tile. All art is decorative (alt=""); the text next to it carries the meaning.

export interface ArtSource {
  /** Site-relative source. */
  src: string;
  /** Intrinsic size, used for layout so nothing jumps. */
  width: number;
  height: number;
}

export interface ArtEntry extends ArtSource {
  /** Brand-system art shown if `src` fails to load. */
  fallback?: ArtSource;
}

export type ArtKey =
  | 'reverse'
  | 'swap'
  | 'advisor'
  | 'timeline'
  | 'imageStudio'
  | 'nodes'
  | 'rent'
  | 'diagnostics'
  | 'agent'
  | 'roadmap.render'
  | 'roadmap.voice'
  | 'roadmap.upscale'
  | 'roadmap.sliders'
  | 'roadmap.extensibility'
  | 'roadmap.optimise';

const cutout = (slug: string, fallback?: ArtSource): ArtEntry => ({
  src: `/images/home/art/${slug}.webp`,
  width: 480,
  height: 480,
  ...(fallback ? { fallback } : {}),
});
const area = (name: string): ArtSource => ({ src: `/brand/areas/${name}@2x.webp`, width: 320, height: 320 });
const illustration = (name: string): ArtSource => ({ src: `/brand/illustrations/${name}@2x.webp`, width: 480, height: 480 });

export const ART: Record<ArtKey, ArtEntry | null> = {
  reverse: cutout('reverse-prompt', area('inference')),
  swap: cutout('character-swap', illustration('frames')),
  advisor: cutout('prompt-advisor', illustration('drop')),
  timeline: { ...illustration('timeline') },
  imageStudio: { ...area('image') },
  nodes: cutout('distributed-nodes', area('components')),
  rent: cutout('gpu-burst'),
  diagnostics: cutout('diagnostics', area('records')),
  agent: cutout('agent-skill'),
  'roadmap.render': cutout('multilevel-render', illustration('frames')),
  'roadmap.voice': cutout('voice'),
  'roadmap.upscale': cutout('upscale-interpolate'),
  'roadmap.sliders': cutout('fine-control'),
  'roadmap.extensibility': cutout('extensibility', area('components')),
  'roadmap.optimise': cutout('vae-dit'),
};

/**
 * Real Phasyn Studio output (original character "The Courier"), made 2026-10-18:
 * - stills: Qwen-Image 2.1 through Image Studio's t2i-pc pipeline, 1152×672, about 27 s each end to end on the RTX 5080;
 * - clip: H3 fl2va from the ocean still as its first frame, 768×448, 5.17 s with generated audio (clips like it took 57–76 s end
 *   to end: text encoding on DGX Spark GB10, DiT and video decode on RTX 5080, audio decode on RTX 3060).
 * Prompts: studio/gen/prompts/still-*.txt and fl2va-*.txt. The clip is review media (public/media, git-ignored) read through
 * mediaUrl(); production serves it from VITE_MEDIA_BASE.
 */
export const REAL = {
  stills: {
    ocean: { src: '/images/home/still-ocean.webp', small: '/images/home/still-ocean-sm.webp', width: 1152, height: 672 },
    cliff: { src: '/images/home/still-cliff.webp', small: '/images/home/still-cliff-sm.webp', width: 1152, height: 672 },
    rain: { src: '/images/home/still-rain.webp', small: '/images/home/still-rain-sm.webp', width: 1152, height: 672 },
    portrait: { src: '/images/home/still-portrait.webp', small: '/images/home/still-portrait-sm.webp', width: 1152, height: 672 },
  },
  oceanClip: 'home/ocean.mp4',
} as const;
