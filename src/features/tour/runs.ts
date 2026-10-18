// Real measurements used on the Tour page. Every number is copied from a source noted per block and is always shown with
// the machine that produced it (BRIEF §6). Today's runs: studio/gen/RUNS.md (2026-10-18, controller-observed). Earlier
// measurements: work/product/recording-plan.md §10 and product-analysis.md §1. Never add a number that is not in a source.

export type DeviceKey = 'gb10' | 'rtx5080' | 'rtx3060' | 'cpu';

/** Machine labels (never hostnames or IPs). */
export const DEVICE_LABEL: Record<DeviceKey, string> = {
  gb10: 'DGX Spark · GB10',
  rtx5080: 'RTX 5080',
  rtx3060: 'RTX 3060',
  cpu: 'CPU',
};

/** Device dot colours: the same keys and series colours as the shared DataTicker. */
export const DEVICE_DOT: Record<DeviceKey, string> = {
  rtx5080: 'bg-series-1',
  gb10: 'bg-series-2',
  rtx3060: 'bg-series-3',
  cpu: 'bg-series-neutral',
};

/** Ranges and single values from today's runs (studio/gen/RUNS.md). */
export const TODAY = {
  /** Four Qwen-Image 2.1 stills, 1152×672, t2i-pc: TE, DiT and VAE on the RTX 5080, compose on the CPU. */
  still: { min: 26.5, max: 27.9 },
  /** Four FL2VA clips (dit-5080 FP8 PAI 8, 124 frames, with audio), end to end: TE on GB10, encode/DiT/VAE on RTX 5080, audio on RTX 3060. */
  fl2va: { min: 57.2, max: 76 },
  /** Two Ref2VA clips (dit5080-ref2va-fp8-pai8, one reference image), end to end, same placement. */
  ref2va: { min: 105, max: 108 },
  /** Component starts on the RTX 5080: image DiT, dit-5080, Ref2VA DiT. */
  start: { imageDit: 11.3, fl2vaDit: 45.9, ref2vaDit: 40.6 },
} as const;

/** Earlier measurements (work/product/recording-plan.md §10). */
export const EARLIER = {
  /** Sequence export of two plain clips, CPU (old demo). */
  exportPlain: 1,
  /** Image analysis for reverse prompting on DGX Spark, step wall time (caption 5.3 s and model load not included). */
  visionAnalyze: 85.8,
} as const;

/** Product counts (work/product/product-analysis.md §1; verified in code). */
export const COUNTS = {
  advisorRules: 74,
  recorderMetrics: 102,
  mcpTools: 22,
  compareMax: 8,
  ditEngines: 40,
  ditEnginesOk: 37,
} as const;
