// Measured values used on the Home page. Every number here is copied from a verified source (noted per block) and is always
// shown with the machine that produced it (BRIEF §6). Never add a number that is not in a source; unknown = not shown.

/** Machines of the current deployment (never hostnames or IPs): two machines, three GPUs. */
export const MACHINES = {
  dgx: 'DGX Spark · GB10',
  pc: 'PC · RTX 5080 + RTX 3060',
} as const;

export type StepId = 'te' | 'venc' | 'dit' | 'video' | 'audio' | 'mux';

export interface MeasuredStep {
  id: StepId;
  /** Component instance id (never translated). */
  component: string;
  /** Device that ran the step. */
  device: 'DGX Spark · GB10' | 'RTX 5080' | 'RTX 3060' | 'CPU';
  seconds: number;
}

/**
 * The one run every step time on Home comes from: run `cfa759df` ("Launch film · fl2va · rain · seed 202", pipeline fl2va-pc),
 * exactly as the real Records capture shows it (public/images/home/ui/records-run-steps.webp): 6/6 steps, elapsed 57.156 s.
 * Video and audio decode run in parallel on different GPUs, so the total is less than the sum of the steps.
 */
export const RUN = {
  id: 'cfa759df',
  task: 'fl2va',
  pipeline: 'fl2va-pc',
  totalSeconds: 57.156,
  steps: [
    { id: 'te', component: 'te-gb10', device: 'DGX Spark · GB10', seconds: 1.333 },
    { id: 'venc', component: 'venc-5080', device: 'RTX 5080', seconds: 1.09 },
    { id: 'dit', component: 'dit-5080', device: 'RTX 5080', seconds: 31.951 },
    { id: 'video', component: 'vae-5080', device: 'RTX 5080', seconds: 22.359 },
    { id: 'audio', component: 'audio-3060', device: 'RTX 3060', seconds: 0.854 },
    { id: 'mux', component: 'mux', device: 'CPU', seconds: 0.297 },
  ] satisfies MeasuredStep[],
} as const;

/** Benchmark facts (work/product/product-analysis.md §1, §9; lead update 2026-10-18). DiT times are on one RTX 5080. */
export const BENCH = {
  clipSeconds: 5.17,
  clipSize: '768×448',
  /**
   * Fastest text-to-video DiT, INT8 · PAI 8-step on the RTX 5080 (dit-variants.json row dit5080-fl2va-int8-pai8): the DiT step's
   * wall time is 33.2 s, of which denoise compute is 26.0 s. Always show the wall time, with compute as the detail.
   */
  fastestT2vaDitSeconds: 33.2,
  fastestT2vaDenoiseSeconds: 26.0,
  /** DiT engines: 40 components run, 37 produced video, 3 NF4 failed to load (3.2 h on the RTX 5080). */
  ditEngines: 40,
  ditEnginesOk: 37,
  ditEnginesFailed: 3,
  benchmarkHours: 3.2,
} as const;

/** Product counts (work/product/product-analysis.md §1). */
export const COUNTS = {
  advisorRules: 74,
  advisorFixes: 21,
  recorderMetrics: 102,
  mcpTools: 22,
  compareMax: 8,
} as const;

/** Cross-host FileRef measured on the live setup: DiT on the PC received 219–322 KB of conditioning from the DGX Spark in 30–34 ms. */
export const FILEREF = { sizeKB: '219–322', millis: '30–34' } as const;

export type ClipKey = 'rain' | 'ocean' | 'portrait' | 'cliff';

export interface ClipReceipt {
  key: ClipKey;
  /** fl2va-pc run on 2026-10-18 (studio/gen/RUNS.md). */
  run: string;
  seed: number;
  /** End to end as the controller recorded it, models already started. */
  seconds: number;
  /** The Qwen-Image 2.1 still used as the first frame (t2i-pc, 1152×672). */
  still: { seed: number; seconds: number };
}

/**
 * The four fl2va clips of The Courier, all on fl2va-pc (te on GB10 · venc, dit, video on RTX 5080 · audio on RTX 3060 · mux on CPU).
 * Web copies in public/media/home/<key>.mp4 are two-pass loudness-normalised (−16 LUFS / −1.5 dBTP, AAC 48 kHz); posters are
 * frame 0 of those files.
 */
export const CLIPS: readonly ClipReceipt[] = [
  { key: 'rain', run: 'cfa759df', seed: 202, seconds: 57.2, still: { seed: 23, seconds: 26.9 } },
  { key: 'ocean', run: '72341805', seed: 303, seconds: 57.4, still: { seed: 31, seconds: 27.9 } },
  { key: 'portrait', run: '7d52714a', seed: 404, seconds: 58.6, still: { seed: 47, seconds: 26.5 } },
  { key: 'cliff', run: '82d036a7', seed: 101, seconds: 76, still: { seed: 11, seconds: 27.1 } },
];
