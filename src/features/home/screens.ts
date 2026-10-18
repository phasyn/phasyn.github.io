/*
 * Real Phasyn Studio screens on the Home page (user, 2026-10-18: every UI shown must be a real screen — nothing re-created).
 *
 * One map, one rule: a key shows a capture only when `capture` is set here, which means its pair exists in
 * public/images/home/ui/ — `<key>.webp` (1920 w) and `<key>@2x.webp` (3840 w) of the live English UI, after the recorder's privacy
 * pass (work/real-ui/manifest.json). Listing a capture is the deliberate step after that review; a file dropped into the folder
 * shows nowhere until it is listed. Without `capture`, RealScreen renders the neutral "real capture pending" frame — never a
 * stand-in UI.
 *
 * Crops are CSS crops of the one capture (no extra files): `panel` is each screen's focused region; some screens have more
 * named regions. All coordinates are fractions of the full capture, measured on the @2x file. Hotspot labels live in copy.ts.
 */

/** Region of a capture as fractions of its width and height: x, y, width, height. */
export type Rect = readonly [x: number, y: number, w: number, h: number];
/** Point on a capture as fractions of its width and height. */
export type Point = readonly [x: number, y: number];

export const SCREEN_KEYS = [
  'image-studio-generating',
  'image-studio-takes',
  'render-engine-image',
  'video-studio-editor',
  'prompt-advisor',
  'references-mentions',
  'render-engine-three-machines',
  'render-progress',
  'timeline-effects',
  'export-dialog',
  'image-to-prompt-result',
  'components-pipeline-graph',
  'component-inspector-precision',
  'records-run-steps',
  'records-compare',
  'terminal-phasynctl',
] as const;
export type ScreenKey = (typeof SCREEN_KEYS)[number];

export type HotspotId =
  | 'generating.flow'
  | 'generating.te'
  | 'generating.take'
  | 'takes.inUse'
  | 'takes.strip'
  | 'takes.video'
  | 'run.elapsed'
  | 'run.slowest'
  | 'run.timeline'
  | 'run.compare'
  | 'run.te'
  | 'run.audio'
  | 'run.mux'
  | 'graph.te'
  | 'graph.dit'
  | 'graph.audio';

export interface Hotspot {
  id: HotspotId;
  at: Point;
}

export interface CaptureSize {
  /** CSS px of `<key>.webp`; the @2x file is exactly double. */
  width: number;
  height: number;
}

export interface ScreenSpec {
  /** Where the screen lives, with the names the English UI uses (shown on the pending frame). */
  area: string;
  /** Short Latin HUD tag (decorative). */
  hud: string;
  /** Set once the reviewed capture pair is in public/images/home/ui/. */
  capture?: CaptureSize;
  /** Named CSS crops; `panel` is the focused region used on narrow screens. */
  crops?: Partial<Record<CropName, Rect>>;
  /** Point the slow pan/zoom drifts towards. */
  focus?: Point;
  hotspots?: readonly Hotspot[];
}

export type CropName = 'panel' | 'timeline' | 'graph' | 'inspector';

/** The recorder pins the viewport to 1920×1080 CSS px at DPR 2, so every full capture is 16:9. */
const FULL: CaptureSize = { width: 1920, height: 1080 };

export const SCREENS: Record<ScreenKey, ScreenSpec> = {
  'image-studio-generating': {
    area: 'Image Studio · Generation',
    hud: 'IMAGE STUDIO · GENERATING',
    capture: FULL,
    crops: { panel: [0.262, 0.08, 0.54, 0.905] },
    focus: [0.36, 0.2],
    hotspots: [
      { id: 'generating.flow', at: [0.372, 0.062] },
      { id: 'generating.te', at: [0.276, 0.144] },
      { id: 'generating.take', at: [0.306, 0.895] },
    ],
  },
  'image-studio-takes': {
    area: 'Image Studio · Takes',
    hud: 'IMAGE STUDIO · TAKES',
    capture: FULL,
    crops: { panel: [0.262, 0.08, 0.54, 0.905] },
    focus: [0.52, 0.42],
    hotspots: [
      { id: 'takes.inUse', at: [0.445, 0.101] },
      { id: 'takes.strip', at: [0.306, 0.9] },
      { id: 'takes.video', at: [0.78, 0.062] },
    ],
  },
  'render-engine-image': {
    area: 'Image Studio · Generation Engine',
    hud: 'GENERATION ENGINE',
    capture: FULL,
    crops: { panel: [0.733, 0, 0.267, 0.77] },
    focus: [0.86, 0.35],
  },
  'video-studio-editor': { area: 'Video Studio · Edit', hud: 'VIDEO STUDIO · EDIT' },
  'prompt-advisor': { area: 'Video Studio · Prompt Fixes & Suggestions', hud: 'PROMPT ADVISOR' },
  'references-mentions': { area: 'Video Studio · Inspector · References', hud: 'PROMPT · @ REFERENCES' },
  'render-engine-three-machines': { area: 'Video Studio · Render Engine', hud: 'RENDER ENGINE' },
  'render-progress': { area: 'Video Studio · Render', hud: 'RENDER' },
  'timeline-effects': { area: 'Video Studio · Timeline', hud: 'TIMELINE · EFFECTS' },
  'export-dialog': { area: 'Video Studio · Export Sequence', hud: 'EXPORT SEQUENCE' },
  'image-to-prompt-result': { area: 'Inference Studio · Image to Prompt', hud: 'IMAGE TO PROMPT' },
  'components-pipeline-graph': {
    area: 'Components · Pipelines · fl2va-pc',
    hud: 'COMPONENTS · PIPELINE GRAPH',
    capture: FULL,
    // Graph canvas around the node cards (the mux node sits at the canvas edge in this capture).
    crops: { panel: [0.262, 0.04, 0.536, 0.8], graph: [0.275, 0.435, 0.5175, 0.195] },
    focus: [0.55, 0.52],
    hotspots: [
      { id: 'graph.te', at: [0.4195, 0.5045] },
      { id: 'graph.dit', at: [0.6188, 0.4975] },
      { id: 'graph.audio', at: [0.7178, 0.5392] },
    ],
  },
  'component-inspector-precision': {
    area: 'Components · Component inspector',
    hud: 'COMPONENT INSPECTOR',
    capture: FULL,
    // The inspector's head: Start / Stop / Restart, the one-DiT rule and the tabs (precision settings sit further down).
    crops: { panel: [0.262, 0.04, 0.736, 0.8], inspector: [0.7974, 0.0444, 0.1979, 0.3956] },
    focus: [0.88, 0.2],
  },
  'records-run-steps': {
    area: 'Records · Run Details',
    hud: 'RECORDS · RUN DETAILS',
    capture: FULL,
    crops: { panel: [0.122, 0.04, 0.674, 0.8], timeline: [0.2635, 0.5537, 0.5333, 0.2148] },
    focus: [0.45, 0.62],
    hotspots: [
      { id: 'run.elapsed', at: [0.631, 0.134] },
      { id: 'run.compare', at: [0.553, 0.171] },
      { id: 'run.timeline', at: [0.306, 0.568] },
      { id: 'run.slowest', at: [0.2, 0.737] },
      { id: 'run.te', at: [0.3609, 0.6509] },
      { id: 'run.audio', at: [0.6068, 0.7213] },
      { id: 'run.mux', at: [0.7669, 0.756] },
    ],
  },
  'records-compare': { area: 'Records · Compare', hud: 'RECORDS · COMPARE' },
  'terminal-phasynctl': { area: 'Terminal · phasynctl', hud: 'AGENT · PHASYNCTL' },
};

const UI_BASE = '/images/home/ui';

export function captureSources(key: ScreenKey): { src: string; src2x: string } {
  return { src: `${UI_BASE}/${key}.webp`, src2x: `${UI_BASE}/${key}@2x.webp` };
}
