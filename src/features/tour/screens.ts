import type { ChapterId } from './chapters.ts';
import { RAIN_RUN, type DeviceKey } from './runs.ts';

/*
 * Real Phasyn Studio screens (BRIEF §5, user feedback 2026-10-18: every UI on the Tour page is a real capture — nothing is
 * re-created). Captures of the live English UI land as `studio/out/final/ui/<key>@2x.png` (+ `<key>-panel@2x.png`, manifest.json)
 * and ship as `public/images/tour/ui/<key>.webp`. Until a file exists, the viewer shows a neutral "real capture pending" frame.
 */

export const UI_KEYS = [
  'image-studio-generating',
  'image-studio-takes',
  'video-studio-editor',
  'render-engine-three-machines',
  'render-progress',
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

/**
 * Intrinsic size of each capture (from the capture manifest), so the frame never jumps. Unknown keys use the default 16:10
 * window until the image loads; the viewer then takes the real aspect ratio from the file.
 */
export const CAPTURE_SIZE: Partial<Record<UiKey, { width: number; height: number }>> = {};
export const DEFAULT_CAPTURE_SIZE = { width: 1600, height: 1000 } as const;

/** The real screens shown in each chapter, in step order. */
export const CHAPTER_SCREENS: Record<ChapterId, readonly UiKey[]> = {
  v1: ['image-studio-generating', 'image-studio-takes'],
  v2: ['video-studio-editor', 'render-engine-three-machines', 'render-progress'],
  v3: ['references-mentions', 'prompt-advisor'],
  v4: ['timeline-effects', 'export-dialog'],
  v5: ['image-to-prompt-result'],
  v6: ['components-pipeline-graph', 'component-inspector-precision'],
  v7: ['records-run-steps', 'records-compare'],
  v8: ['terminal-phasynctl'],
};

/** Region of a capture as fractions of its width and height: x, y, width, height. */
export type Rect = readonly [number, number, number, number];

export interface ExplainerStep {
  key: UiKey;
  /** The part of the capture this step explains. `null` until calibrated against the real capture: no highlight, no zoom. */
  focus: Rect | null;
  /** A measured time from today's runs, shown beside the step (only where the capture itself shows no time). */
  readout?: { seconds: number; device: DeviceKey };
}

export type ExplainerId = 'render' | 'advisor' | 'records';

export interface ExplainerSpec {
  id: ExplainerId;
  /** Short Latin HUD tag on the capture frame (decorative). */
  hud: string;
  /** Latin eyebrow over the step panel (decorative). */
  eyebrow: string;
  steps: readonly ExplainerStep[];
}

const rain = (id: 'te' | 'dit' | 'video' | 'audio') => {
  const step = RAIN_RUN.steps.find((s) => s.id === id)!;
  return { seconds: step.seconds, device: step.device };
};

export const EXPLAINERS: readonly ExplainerSpec[] = [
  {
    id: 'render',
    hud: 'RENDER ENGINE',
    eyebrow: 'ONE RENDER · 3 MACHINES',
    steps: [
      { key: 'render-engine-three-machines', focus: null, readout: rain('te') },
      { key: 'render-engine-three-machines', focus: null, readout: rain('dit') },
      { key: 'render-engine-three-machines', focus: null, readout: rain('video') },
      { key: 'render-engine-three-machines', focus: null, readout: rain('audio') },
      { key: 'render-progress', focus: null },
      { key: 'render-progress', focus: null },
    ],
  },
  {
    id: 'advisor',
    hud: 'PROMPT ADVISOR',
    eyebrow: '74 RULES · CITED SOURCES',
    steps: [
      { key: 'references-mentions', focus: null },
      { key: 'prompt-advisor', focus: null },
      { key: 'prompt-advisor', focus: null },
      { key: 'prompt-advisor', focus: null },
    ],
  },
  {
    id: 'records',
    hud: 'RECORDS',
    eyebrow: 'MEASURED · NEVER GUESSED',
    steps: [
      { key: 'records-run-steps', focus: null },
      { key: 'records-run-steps', focus: null },
      { key: 'records-compare', focus: null },
      { key: 'records-compare', focus: null },
    ],
  },
];
