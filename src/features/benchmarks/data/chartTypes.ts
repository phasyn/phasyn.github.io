import type { AdaLN, Attention, Precision, Schedule } from './types.ts';

// Chart datasets (generated into charts.gen.ts). Every value is a measurement or a fit stated in the archive.

export interface DitVariant {
  scenario: 't2va' | 'ref2va';
  component: string;
  precision: Precision;
  schedule: Schedule;
  adaln: AdaLN;
  attention: Attention;
  afterUse: 'host' | 'drop' | 'device';
  exact: boolean;
  status: 'ok' | 'load-failed';
  runId: string | null;
  /** DiT step wall time, s. */
  dit: number | null;
  /** Recorder denoise compute, s. */
  compute: number | null;
  /** Median step × steps after the first, s. */
  steady: number | null;
  /** First step minus the median step, s. */
  firstExtra: number | null;
  /** Time inside the DiT call but outside the steps (AdaLN prep, input assembly, release), s. */
  outside: number | null;
  p50: number | null;
  seqLen: number | null;
  load: number | null;
  alloc: number | null;
  reserved: number | null;
  card: number | null;
  /** ref2va only: frames of 124 that paste the black-background reference image. */
  copyThrough: number | null;
  /** The DiT the production route uses (dit-5080 for t2va/fl2va, dit5080-ref2va-fp8-pai8 for ref2va). */
  production: boolean;
}

export type Ref448Key = 'total' | 'te' | 'te-compute' | 'venc' | 'dit' | 'dit-p50' | 'alloc' | 'reserved' | 'seq';
export interface Ref448Metric {
  key: Ref448Key;
  ref768: number;
  ref448: number;
  unit: 's' | 'GiB' | 'rows';
}
