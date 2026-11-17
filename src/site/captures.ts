/*
 * Real Phasyn Studio captures shown on the site, by key: public/images/ui/<key>.webp (1920 w) and <key>@2x.webp (3840 w),
 * the live English UI at 1920×1080, DPR 2. A key shows only when both files exist (scripts/site-assets.ts); a scene or a
 * Tour section whose capture is missing is left out or falls back to text. Nothing is ever drawn in a capture's place.
 *
 * THIS IS THE ONE FILE TO RE-TUNE AFTER A RE-CAPTURE. Every region is a fraction of the full capture: [x, y, width, height],
 * measured on the 1920×1080 file (pixel / 1920, pixel / 1080). Pages refer to regions by name only:
 *  - `window`  the frame shown on wide screens (default: the app without its navigation sidebar);
 *  - other names are focus regions: the spotlight and its one label sit on them, and phones zoom the camera onto them.
 * A region that no longer matches the picture can simply be deleted: the scene then shows the window without a spotlight.
 *
 * Privacy (checked by eye on every file before it ships): no node names, hosts, IPs, paths, user names, project ids or run
 * ids may be visible. Where a capture cannot avoid one (the render queue shows which machine ran a step), list its box in
 * `redact`: it is covered by a solid patch everywhere the capture is shown, the lightbox included.
 *
 * `generated`: the capture shows a generated image or video frame, so it carries the AiBadge `screen` disclosure
 * ("Real screen · contains AI-generated content"). Unreviewed captures default to true.
 */

/** Region of a capture as fractions of its width and height: x, y, width, height. */
export type Rect = readonly [x: number, y: number, w: number, h: number];

export const CAPTURE_KEYS = [
  'shot-workspace',
  'shot-takes-compare',
  'prompt-suggestions',
  'edit-workspace',
  'render-queue',
  'export-dialog',
  'plugin-manager',
  'image-studio',
] as const;
export type CaptureKey = (typeof CAPTURE_KEYS)[number];

export interface CaptureSpec {
  /** Where the screen lives, with the English UI's names (lightbox header). */
  area: string;
  /** Short Latin HUD tag on the frame (decorative). */
  hud: string;
  /** What is visible, in plain words, for reviewers. */
  shows: string;
  generated: boolean;
  regions: Readonly<Record<string, Rect>>;
  /** Boxes covered by a solid patch (node names and the like). */
  redact?: readonly Rect[];
}

/** The app without the navigation sidebar (1920×1080 layout: the sidebar ends at x = 234). */
const WINDOW: Rect = [0.122, 0, 0.878, 1];

export const CAPTURES: Record<CaptureKey, CaptureSpec> = {
  'shot-workspace': {
    area: 'Video Studio · Shot',
    hud: 'VIDEO STUDIO · SHOT',
    shows: 'Shot workspace: shot list, a take in the viewer, take strip, Prompt inspector and the small timeline.',
    generated: true,
    regions: {
      window: WINDOW,
      shots: [0.125, 0.09, 0.144, 0.645],
      viewer: [0.276, 0.092, 0.497, 0.53],
      takes: [0.276, 0.672, 0.497, 0.06],
      prompt: [0.78, 0.055, 0.215, 0.68],
      timeline: [0.125, 0.74, 0.873, 0.235],
    },
  },
  'shot-takes-compare': {
    area: 'Video Studio · Shot · A/B compare',
    hud: 'TAKES · A/B',
    shows: 'Shot workspace with several takes in the strip and the viewer comparing two of them.',
    generated: true,
    regions: {
      window: WINDOW,
      viewer: [0.276, 0.092, 0.497, 0.53],
      takes: [0.276, 0.672, 0.497, 0.06],
    },
  },
  'prompt-suggestions': {
    area: 'Video Studio · Inspector · Fixes & Suggestions',
    hud: 'FIXES & SUGGESTIONS',
    shows: 'Shot workspace with the Fixes & Suggestions list open over the prompt.',
    generated: true,
    regions: {
      window: WINDOW,
      suggestions: [0.784, 0.204, 0.178, 0.44],
      prompt: [0.78, 0.055, 0.215, 0.68],
      viewer: [0.276, 0.092, 0.497, 0.53],
    },
  },
  'edit-workspace': {
    area: 'Video Studio · Edit',
    hud: 'VIDEO STUDIO · EDIT',
    shows: 'Edit workspace: source and program monitors, project panel, tools strip, timeline and meters.',
    generated: true,
    regions: {
      window: WINDOW,
      program: [0.563, 0.097, 0.434, 0.45],
      source: [0.125, 0.097, 0.433, 0.45],
      timeline: [0.346, 0.553, 0.62, 0.42],
      workspaces: [0.129, 0.055, 0.32, 0.038],
      project: [0.125, 0.553, 0.218, 0.42],
    },
  },
  'render-queue': {
    area: 'Video Studio · Render',
    hud: 'VIDEO STUDIO · RENDER',
    shows:
      'Render workspace, Overview tab only: the run queue and one finished run with its video (run id blurred, no node names).',
    generated: true,
    regions: {
      window: WINDOW,
      queue: [0.125, 0.055, 0.225, 0.93],
      variants: [0.36, 0.165, 0.16, 0.27],
    },
  },
  'export-dialog': {
    area: 'Video Studio · Export Video',
    hud: 'EXPORT VIDEO',
    shows: 'Export Video dialog (Basics) over the dimmed Edit workspace.',
    generated: true,
    regions: {
      window: [0.25, 0.18, 0.5, 0.7],
      dialog: [0.325, 0.233, 0.35, 0.534],
      options: [0.337, 0.37, 0.324, 0.235],
    },
  },
  'plugin-manager': {
    area: 'Plugins',
    hud: 'PLUGINS',
    shows: 'Plugin manager with the installed plugins (only packages that ship in the open-source release).',
    generated: false,
    // TODO(owner): measure `packs` on the first capture.
    regions: { window: WINDOW },
  },
  'image-studio': {
    area: 'Image Studio',
    hud: 'IMAGE STUDIO',
    shows: 'Image Studio: prompt, reference images and a batch of generated stills.',
    generated: true,
    regions: {
      window: WINDOW,
      results: [0.269, 0.093, 0.527, 0.636],
      takes: [0.269, 0.79, 0.527, 0.18],
      prompt: [0.799, 0.105, 0.2, 0.32],
      images: [0.125, 0.055, 0.14, 0.83],
    },
  },
};

const FULL: Rect = [0, 0, 1, 1];

/** The named region of a capture, or undefined when it is not measured (the caller drops the spotlight). */
export function captureRegion(key: CaptureKey, name: string | undefined): Rect | undefined {
  return name ? CAPTURES[key].regions[name] : undefined;
}

/** The frame shown on wide screens: the capture's `window` region (the whole capture if none is set). */
export function captureWindow(key: CaptureKey): Rect {
  return CAPTURES[key].regions.window ?? FULL;
}

/** 960 w phone copy (`@sm`), 1920 w and 3840 w (`@2x`); every capture in public/images/ui ships all three. */
export function captureSources(key: CaptureKey): { srcSm: string; src: string; src2x: string } {
  return { srcSm: `/images/ui/${key}@sm.webp`, src: `/images/ui/${key}.webp`, src2x: `/images/ui/${key}@2x.webp` };
}
