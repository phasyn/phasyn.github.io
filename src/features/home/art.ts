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
 * Real Phasyn Studio output (original character "The Courier"), made 2026-10-18 through the real controller (studio/gen/RUNS.md):
 * - stills: Qwen-Image 2.1 through t2i-pc, the pipeline Image Studio uses, 1152×672, about 27 s each end to end (TE, DiT and VAE
 *   on the RTX 5080, compositing on the CPU);
 * - clip: H3 fl2va with the rain still as its first frame, run cfa759df (the run the Records capture shows): 768×448, 24 fps,
 *   124 frames (5.17 s) with generated audio, 57.2 s end to end (te 1.3 s on DGX Spark GB10 · venc 1.1 · dit 32.0 · video 22.4 on
 *   RTX 5080 · audio 0.9 on RTX 3060 · mux 0.3 on CPU).
 * The clip's web copy is loudness-normalised (two-pass loudnorm to −16 LUFS / −1.5 dBTP, AAC 48 kHz 192 kb/s; the raw output is
 * −39 LUFS, AAC 32 kHz). It is review media (public/media, git-ignored) read through mediaUrl(); production serves it from
 * VITE_MEDIA_BASE.
 */
export const REAL = {
  stills: {
    ocean: { src: '/images/home/still-ocean.webp', small: '/images/home/still-ocean-sm.webp', width: 1152, height: 672 },
    cliff: { src: '/images/home/still-cliff.webp', small: '/images/home/still-cliff-sm.webp', width: 1152, height: 672 },
    rain: { src: '/images/home/still-rain.webp', small: '/images/home/still-rain-sm.webp', width: 1152, height: 672 },
    portrait: { src: '/images/home/still-portrait.webp', small: '/images/home/still-portrait-sm.webp', width: 1152, height: 672 },
  },
  clip: { src: 'home/rain.mp4', firstFrame: 'rain', run: 'cfa759df' },
} as const;
