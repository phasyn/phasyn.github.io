import type { Copy } from '../../../i18n/locale.tsx';

/*
 * Shapes of the benchmark data. The values come from `work/benchmarks/data/*.json` through the generator
 * (`work/benchmarks-qa/tools/build-bench-data.mjs`); nothing here is typed in by hand except today's run table.
 * Units: seconds (wall time unless named otherwise), GiB = 2^30 bytes, GB = 10^9 bytes (DGX meminfo only).
 */

export type DeviceId = 'dgx-gb10' | 'pc-rtx5080' | 'pc-rtx3060' | 'pc-cpu';
/** Where a step ran: a machine, or an honest unknown. */
export type Placement = DeviceId | 'not-recorded' | 'not-run';

export type StepKind =
  | 'te'
  | 'venc'
  | 'venc-ff'
  | 'aenc'
  | 'dit'
  | 'dit-load'
  | 'video'
  | 'audio'
  | 'mux'
  | 'vae'
  | 'compose'
  | 'vae-compose'
  | 'caption'
  | 'analyze'
  | 'compile';

export type StepStatus = 'ok' | 'failed' | 'cancelled' | 'not-run';
export type RowStatus = 'ok' | 'failed' | 'cancelled';
export type Pipeline = 't2va' | 'fl2va' | 'ref2va' | 't2i' | 'i2i' | 'reverse-prompt';
export type Precision = 'FP8' | 'INT8' | 'BF16' | 'NF4' | 'GGUF Q4_K_M';
export type Schedule = 'pai8' | 'turbo8' | 'turbo4' | 'original' | 'img40' | 'img4';
export type ExperimentId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11' | '12' | '13' | 'today';
export type TableId = 'h3' | 'image' | 'other';

/** Why a value or a placement is missing (localized in copy.ts). */
export type ReasonKey =
  | 'te-reused'
  | 'no-run'
  | 'not-archived'
  | 'te-only-archived'
  | 'step-not-run'
  | 'not-started'
  | 'refused-422'
  | 'batch-vae'
  | 'batch-dit'
  | 'not-broken-out'
  | 'not-reported'
  | 'te-range-shared'
  | 'te-range'
  | 'host-wall'
  | 'readme-approx'
  | 'shared'
  | 'run-cancelled'
  | 'run-failed'
  | 'dit-never-loaded'
  | 'refused-before-alloc'
  | 'no-recorder'
  | 'nvml-few'
  | 'today-not-logged'
  | 'no-dit';

/** What the run time covers. */
export type ScopeKey = 'e2e' | 'e2e-page' | 'dit-decode-mux' | 'dit-only' | 'no-te' | 'readme' | 'no-run';

export type InputsKey =
  | 'text'
  | 'images2'
  | 'swap-clip'
  | 'swap-3'
  | 'swap-141'
  | 'swap-768'
  | 'swap-448'
  | 'swap-448-141'
  | 'swap-448-158'
  | 'swap-448-3'
  | 'reuse-r2'
  | 'reuse-r5'
  | 'rerun-r5'
  | 'image-video'
  | 'image-audio'
  | 'first-frame'
  | 'first-frame-today'
  | 'ref-image-today'
  | 'vlm-image'
  | 'img-cup'
  | 'img-cup-refs'
  | 'img-reused'
  | 'img-courier';

export type SceneKey = 'cliff' | 'rain' | 'ocean' | 'portrait' | 'rooftop' | 'meadow';
export type Attention = 'fp8' | 'sdpa' | 'subblock';
export type AdaLN = 'fixed' | 'online' | 'off';

export interface Step {
  kind: StepKind;
  component: string | null;
  placement: Placement;
  /** A combined step that spans machines (today's "VAE decode + compose"). */
  placements?: DeviceId[];
  seconds: number | null;
  /** Rounded value from a run log ("~23 s"). */
  approx?: boolean;
  compute?: number;
  status: StepStatus;
  parallelWith?: StepKind;
  /** Computed once in this run and reused here (not part of this row's run time). */
  sharedFrom?: string;
  reason?: ReasonKey;
  error?: string;
}

export interface Vram {
  /** DiT process PyTorch allocator peak, GiB. */
  alloc: number | null;
  /** DiT process PyTorch reserved peak, GiB. */
  reserved: number | null;
  /** Whole-card NVML peak (all processes), GiB. */
  card: number | null;
  reason?: ReasonKey;
  cardReason?: ReasonKey;
}

export interface DitConfig {
  attention?: Attention;
  adaln?: AdaLN;
  afterUse?: 'host' | 'drop';
  exact?: boolean;
  /** Image DiT residency mode. */
  mode?: 'phase' | 'stream' | 'gguf';
}

export interface SpeedRow {
  id: string;
  table: TableId;
  experiment: ExperimentId;
  /** Short, untranslated run label (R5, E4, seed 7, UI, MCP…). */
  tag: string | null;
  scene?: SceneKey;
  featured: boolean;
  date: string;
  runId: string | null;
  seed: number | null;
  pipeline: Pipeline;
  inputs: InputsKey;
  characters?: number;
  component: string | null;
  precision: Precision | null;
  schedule: Schedule | null;
  config: DitConfig;
  resolution: string;
  frames: number | null;
  steps: Step[];
  /** DiT step wall time, s. */
  dit: number | null;
  ditApprox?: boolean;
  ditReason?: ReasonKey;
  /** Recorder denoise compute (the loop only), s. */
  compute: number | null;
  /** Run wall time for successful end-to-end runs only, s. */
  total: number | null;
  /** Run wall time whatever its scope, s. */
  run: number | null;
  scope: ScopeKey;
  totalReason: ReasonKey | null;
  sharedFrom: string | null;
  stepP50?: number;
  seqLen?: number;
  vram: Vram;
  status: RowStatus;
  failure: { code: string; at: StepKind } | null;
  note?: Copy<string>;
}

export interface RowsFile {
  generated: string;
  rows: SpeedRow[];
}
