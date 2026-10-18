/*
 * Real Phasyn Studio screens (user feedback 2026-10-18: every UI on the Tour page is a real capture — nothing is re-created).
 * Captures of the live English UI (privacy-masked by the recorder) ship as `public/images/tour/ui/<key>.webp` (1920 px wide).
 * New captures land in studio/out/final/ui as recordings progress: copy the WebP in and add its key to a chapter in chapters.ts.
 * Until a listed file exists, the viewer shows a neutral "real capture pending" frame.
 */

export const UI_KEYS = [
  'image-studio-generating',
  'image-studio-takes',
  'render-engine-image',
  'render-engine-three-machines',
  'render-progress',
  'video-studio-editor',
  'references-mentions',
  'prompt-advisor',
  'timeline-effects',
  'export-dialog',
  'image-to-prompt-result',
  'components-pipeline-graph',
  'component-inspector-precision',
  'records-run-steps',
  'records-compare',
  'terminal-phasynctl',
] as const;
export type UiKey = (typeof UI_KEYS)[number];

export function captureSrc(key: UiKey): string {
  return `/images/tour/ui/${key}.webp`;
}

/** Captures are 16:9 (1920×1080 viewport, see work/real-ui/manifest.json); the viewer re-reads the real size on load. */
export const CAPTURE_SIZE = { width: 1920, height: 1080 } as const;

/** Region of a capture as fractions of its width and height: x, y, width, height. */
export type Rect = readonly [number, number, number, number];

/**
 * Thumbnail framing for captures whose subject is a small part of the screen (the lightbox always shows the whole capture).
 * The Generation Engine sheet sits at the right edge over a dimmed workspace.
 */
export const THUMB_CROP: Partial<Record<UiKey, Rect>> = {
  'render-engine-image': [0.725, 0.15, 0.275, 0.52],
};
