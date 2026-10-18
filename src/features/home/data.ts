// Measured values used on the Home page. Every number here is copied from a verified source (noted per block) and is always
// shown with the machine that produced it (BRIEF §6). Never add a number that is not in a source; unknown = not shown.

/** Machines of the current deployment (labels as the mock-ups write them; never hostnames or IPs). */
export const MACHINES = {
  dgx: 'DGX Spark · GB10',
  pc: 'PC · RTX 5080 + RTX 3060',
} as const;

export type StepId = 'te' | 'dit' | 'video' | 'audio' | 'mux';

export interface MeasuredStep {
  id: StepId;
  /** Component instance id (never translated). */
  component: string;
  /** Device that ran the step. */
  device: 'DGX Spark · GB10' | 'RTX 5080' | 'RTX 3060' | 'CPU';
  seconds: number;
}

/**
 * One recorded t2va run (124 frames, 768×448, models loaded): demo run `b7514a43`.
 * Source: work/product/mockup-spec.md "Reference times usable in mock-ups" (old tour poster `records-tour.webp`).
 * Video and audio decode run in parallel on different GPUs, so the total is less than the sum of the steps.
 */
export const DEMO_RUN = {
  task: 't2va',
  frames: 124,
  size: '768×448',
  totalSeconds: 59.8,
  steps: [
    { id: 'te', component: 'te-gb10', device: 'DGX Spark · GB10', seconds: 1.17 },
    { id: 'dit', component: 'dit-5080', device: 'RTX 5080', seconds: 34.7 },
    { id: 'video', component: 'vae-5080', device: 'RTX 5080', seconds: 22.8 },
    { id: 'audio', component: 'audio-3060', device: 'RTX 3060', seconds: 1.17 },
    { id: 'mux', component: 'mux', device: 'CPU', seconds: 0.53 },
  ] satisfies MeasuredStep[],
} as const;

/**
 * Real `dit-5080` t2va recorder values (work/product/mockup-spec.md M4, from the skill's workflows.md §5 and components.md §4).
 * `gpuKernelTime` is genuinely not measured outside trace mode — shown as "Not measured", never 0.
 */
export const DIT_METRICS = {
  torchReservedPeakGiB: 4.93,
  nvmlPeakGiB: 7.22,
  weightsH2DGB: 155.0,
  blockLoads: 402,
} as const;

/** Benchmark facts (work/product/product-analysis.md §1, §9; lead update 2026-10-18). DiT times are on one RTX 5080. */
export const BENCH = {
  /** t2va, 5.17 s clip at 768×448 with audio, models loaded: TE on DGX Spark, DiT + video VAE on RTX 5080, audio on RTX 3060. */
  renderSeconds: 54.1,
  clipSeconds: 5.17,
  clipSize: '768×448',
  /** Fastest text-to-video DiT time: INT8 · PAI 8-step, RTX 5080. */
  fastestT2vaDitSeconds: 26.0,
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
  uiStrings: '7,322',
  mcpTools: 22,
  compareMax: 8,
} as const;

/** Cross-host FileRef measured on the live setup: DiT on the PC received 219–322 KB of conditioning from the DGX Spark in 30–34 ms. */
export const FILEREF = { sizeKB: '219–322', millis: '30–34' } as const;
