// Real measurements used on the Tour page. Every number is copied from a source noted per block and is always shown with
// the machine that produced it (BRIEF §6). Today's runs: studio/gen/RUNS.md (2026-10-18, controller-observed). Earlier
// measurements: work/product/recording-plan.md §10 and product-analysis.md §1. Never add a number that is not in a source.

export type DeviceKey = 'gb10' | 'rtx5080' | 'rtx3060' | 'cpu';

/** Machine labels as the App's mock-ups write them (never hostnames or IPs). */
export const DEVICE_LABEL: Record<DeviceKey, string> = {
  gb10: 'DGX Spark · GB10',
  rtx5080: 'RTX 5080',
  rtx3060: 'RTX 3060',
  cpu: 'CPU',
};

/** Node label shown after a component id in the Render Engine (`component · node`). */
export const NODE_LABEL: Record<DeviceKey, string> = {
  gb10: 'DGX Spark · GB10',
  rtx5080: 'PC · RTX 5080',
  rtx3060: 'PC · RTX 3060',
  cpu: 'PC · CPU',
};

/** Device dot colours, the same keys and series colours as the shared DataTicker. */
export const DEVICE_DOT: Record<DeviceKey, string> = {
  rtx5080: 'bg-series-1',
  gb10: 'bg-series-2',
  rtx3060: 'bg-series-3',
  cpu: 'bg-series-neutral',
};

export type RunStepId = 'te' | 'venc' | 'dit' | 'video' | 'audio' | 'mux';

export interface RunStep {
  id: RunStepId;
  /** Render Engine kind name (exact English UI label, work/product/ui-map.md §3.5). */
  kind: string;
  component: string;
  device: DeviceKey;
  /** Measured step time, seconds. */
  seconds: number;
  /** Start on the step timeline, seconds. Not recorded in RUNS.md: laid out in pipeline order (see RAIN_RUN). */
  start: number;
  /** Stays loaded between runs (the sheet's "Resident" tag). */
  resident?: boolean;
}

/**
 * Today's fl2va run of the rain clip (`clips/fl2va-rain`, 124 frames, 768×448, with audio): 57.2 s end to end.
 * Step times are measured. Start times are laid out in pipeline order (te → venc → dit → video ‖ audio → mux): the measured
 * steps in that order add up to 57.1 s of the 57.2 s total, so the pipeline ran them one after another, with audio beside video.
 */
export const RAIN_RUN = {
  label: 'Rain street',
  pipeline: 'fl2va-pc',
  dit: 'dit-5080',
  frames: 124,
  size: '768×448',
  ditSteps: 8,
  totalSeconds: 57.2,
  steps: [
    { id: 'te', kind: 'Text Conditioning (TE)', component: 'te-gb10', device: 'gb10', seconds: 1.3, start: 0, resident: true },
    { id: 'venc', kind: 'Video VAE Encoding', component: 'venc-5080', device: 'rtx5080', seconds: 1.1, start: 1.3 },
    { id: 'dit', kind: 'DiT Denoising', component: 'dit-5080', device: 'rtx5080', seconds: 32.0, start: 2.4 },
    { id: 'video', kind: 'Video VAE Decoding', component: 'vae-5080', device: 'rtx5080', seconds: 22.4, start: 34.4 },
    { id: 'audio', kind: 'Audio VAE Decoding', component: 'audio-3060', device: 'rtx3060', seconds: 0.9, start: 34.4, resident: true },
    { id: 'mux', kind: 'AV Muxing', component: 'mux', device: 'cpu', seconds: 0.3, start: 56.8 },
  ] satisfies RunStep[],
} as const;

/** Ranges and single values from today's runs (studio/gen/RUNS.md). */
export const TODAY = {
  /** Four Qwen-Image 2.1 stills, 1152×672, t2i-pc: TE ~2 s, DiT ~23 s, VAE + compose ~2 s (RTX 5080 / CPU). */
  still: { min: 26.5, max: 27.9 },
  /** Four FL2VA clips (dit-5080 FP8 PAI 8, 124 frames): end to end, DiT and video decode ranges (RTX 5080). */
  fl2va: { min: 57.2, max: 76, ditMin: 31.7, ditMax: 38.7, videoMin: 22.4, videoMax: 27.7 },
  /** Two Ref2VA clips (dit5080-ref2va-fp8-pai8, one reference image): end to end, DiT, text encoding (DGX Spark). */
  ref2va: { min: 105, max: 108, ditMin: 68, ditMax: 70, teMin: 8.3, teMax: 8.5 },
  /** Component starts on the RTX 5080: image DiT, dit-5080, Ref2VA DiT. */
  start: { imageDit: 11.3, fl2vaDit: 45.9, ref2vaDit: 40.6 },
} as const;

/** Earlier measurements (work/product/recording-plan.md §10). */
export const EARLIER = {
  /** Sequence export of two plain clips, CPU (old demo). */
  exportPlain: 1,
  /** Image reverse prompting on DGX Spark: vision model load (when stopped), caption, analysis. */
  visionLoad: 62.5,
  visionCaption: 5.26,
  visionAnalyze: 85.5,
  /** MCP status call and dry run, PC. */
  mcpStatus: 0.2,
  mcpDryRun: 0.16,
} as const;

/** Product counts (work/product/product-analysis.md §1). */
export const COUNTS = {
  advisorRules: 74,
  advisorFixes: 21,
  recorderMetrics: 102,
  mcpTools: 22,
  compareMax: 8,
  ditEngines: 40,
  ditEnginesOk: 37,
} as const;
