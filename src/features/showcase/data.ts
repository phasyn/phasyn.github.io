// Showcase data: the generated items (items.gen.ts, written by scripts/import-showcase.ts from item.json records) plus the
// derived values the page shows. Add results by adding item folders or seed entries and re-running the importer — never by
// editing numbers here. Every total on the page is computed from the items, so it can never disagree with the cards.

import { SHOWCASE_ITEMS } from './items.gen.ts';
import type { MachineKey, ShowcaseCategory, ShowcaseItem, ShowcaseStep } from './types.ts';

export type * from './types.ts';

export const ITEMS: readonly ShowcaseItem[] = SHOWCASE_ITEMS;

/** Machine labels as the app writes them (never hostnames or IPs). `unknown` is labelled in copy ("placement not recorded"). */
export const MACHINE_LABEL: Record<Exclude<MachineKey, 'unknown'>, string> = {
  gb10: 'DGX Spark · GB10',
  rtx5080: 'RTX 5080',
  rtx3060: 'RTX 3060',
  cpu: 'CPU',
};

/** Device colours: the same keys and series colours as the shared DataTicker and the Tour. */
export const MACHINE_DOT: Record<MachineKey, string> = {
  rtx5080: 'bg-series-1',
  gb10: 'bg-series-2',
  rtx3060: 'bg-series-3',
  cpu: 'bg-series-neutral',
  unknown: 'bg-line-strong',
};

/** Lane order: where a render starts (text encoding on the DGX Spark) to where it ends (mux on the CPU). */
export const MACHINE_ORDER: readonly MachineKey[] = ['gb10', 'rtx5080', 'rtx3060', 'cpu', 'unknown'];

/** Which machine is in which box (the author's setup: two machines, three GPUs). */
export const MACHINE_HOST: Record<Exclude<MachineKey, 'unknown'>, 'dgx' | 'pc'> = { gb10: 'dgx', rtx5080: 'pc', rtx3060: 'pc', cpu: 'pc' };

export const CATEGORY_ORDER: readonly ShowcaseCategory[] = ['film', 'image', 'video', 'character', 'multishot'];

/** Finished long pieces (the owner's #1 asset): their own featured row at the top of the gallery. */
export const FILMS: readonly ShowcaseItem[] = ITEMS.filter((item) => item.kind === 'film');

export function itemBySlug(slug: string): ShowcaseItem | undefined {
  return ITEMS.find((item) => item.slug === slug);
}

/**
 * The hero theatre: films, then hero-graded results with the longest pieces first (the owner ranks long video highest);
 * equal lengths keep data order (curated seeds, then production order).
 */
export const FEATURED: readonly ShowcaseItem[] = [
  ...ITEMS.filter((item) => item.kind === 'film'),
  ...ITEMS.filter((item) => item.kind !== 'film' && item.grade === 'hero')
    .map((item, index) => ({ item, index }))
    .sort((a, b) => (b.item.seconds ?? 0) - (a.item.seconds ?? 0) || a.index - b.index)
    .map(({ item }) => item),
];

export function isClip(item: ShowcaseItem): boolean {
  return Boolean(item.media.clip);
}

/** The step's lane: its first machine (a combined step such as "VAE decode + compose" lists both). */
export function laneOf(step: ShowcaseStep): MachineKey {
  return step.machines[0] ?? 'unknown';
}

export interface Lane {
  machine: MachineKey;
  steps: ShowcaseStep[];
  /** Sum of the lane's measured step times (null when none was recorded). */
  seconds: number | null;
  approx: boolean;
}

/** Steps grouped by machine, in pipeline order within each lane. Durations only: lanes never claim when a step started. */
export function lanes(item: ShowcaseItem): Lane[] {
  return MACHINE_ORDER.flatMap((machine) => {
    const steps = item.steps.filter((step) => laneOf(step) === machine);
    if (!steps.length) return [];
    const measured = steps.filter((step) => step.seconds !== null);
    const seconds = measured.length ? measured.reduce((sum, step) => sum + (step.seconds ?? 0), 0) : null;
    return [{ machine, steps, seconds, approx: steps.some((step) => step.approx) || measured.length < steps.length }];
  });
}

/** Every machine an item touched (combined steps count for each machine they list). */
export function machinesOf(item: ShowcaseItem): MachineKey[] {
  const used = new Set(item.steps.flatMap((step) => step.machines));
  return MACHINE_ORDER.filter((machine) => used.has(machine));
}

export interface Totals {
  results: number;
  clips: number;
  stills: number;
  /** Seconds of generated video (every clip carries its own sound). */
  videoSeconds: number;
  frames: number;
  /** Sum of controller-observed end-to-end times. */
  renderSeconds: number;
  /** True when any end-to-end time in the sum is a rounded reading or missing. */
  renderApprox: boolean;
  gpus: number;
  hosts: number;
}

export function totals(items: readonly ShowcaseItem[] = ITEMS): Totals {
  const used = new Set(items.flatMap((item) => item.steps.flatMap((step) => step.machines)));
  const gpus = (['gb10', 'rtx5080', 'rtx3060'] as const).filter((key) => used.has(key)).length;
  const hosts = new Set([...used].filter((key): key is Exclude<MachineKey, 'unknown'> => key !== 'unknown').map((key) => MACHINE_HOST[key])).size;
  return {
    results: items.length,
    clips: items.filter(isClip).length,
    stills: items.filter((item) => !isClip(item)).length,
    videoSeconds: items.reduce((sum, item) => sum + (isClip(item) ? (item.seconds ?? 0) : 0), 0),
    frames: items.reduce((sum, item) => sum + (isClip(item) ? (item.frames ?? 0) : 0), 0),
    renderSeconds: items.reduce((sum, item) => sum + (item.endToEndSeconds ?? 0), 0),
    renderApprox: items.some((item) => item.endToEndApprox || item.endToEndSeconds === null),
    gpus,
    hosts,
  };
}

/** Raw loudness range and sample rates of the published clips, for the loudness note (computed, never typed in). */
export function rawAudio(items: readonly ShowcaseItem[] = ITEMS): { loudest: number; quietest: number; rates: number[] } | undefined {
  const levels = items.map((item) => item.media.rawLufs).filter((value): value is number => typeof value === 'number');
  if (!levels.length) return undefined;
  const rates = [...new Set(items.map((item) => item.media.rawSampleRate).filter((value): value is number => typeof value === 'number'))].sort((a, b) => a - b);
  return { loudest: Math.max(...levels), quietest: Math.min(...levels), rates };
}

/** Range of end-to-end times for one pipeline, e.g. fl2va-pc 57.2–76 s. */
export function range(items: readonly ShowcaseItem[], pipeline: string): { min: number; max: number } | undefined {
  const values = items.filter((item) => item.pipeline === pipeline && item.endToEndSeconds !== null && !item.endToEndApprox).map((item) => item.endToEndSeconds as number);
  return values.length ? { min: Math.min(...values), max: Math.max(...values) } : undefined;
}

/** Seconds with one decimal below 100 s, whole seconds above (the precision RUNS.md records). */
export function formatSeconds(seconds: number): string {
  return seconds >= 100 || Number.isInteger(seconds) ? String(Math.round(seconds)) : seconds.toFixed(1);
}

/**
 * The breakdown pair: the rain still (t2i-pc run 0e2463b8) became the first frame of the rain clip (fl2va-pc run cfa759df).
 * `starts` (seconds from run start) come from that run's Step Timeline and activity log in Records (real capture:
 * public/images/showcase/page/records-run-cfa759df.webp): te from 0, venc 1.38, DiT 2.48, video and audio decode side by
 * side from 34.44 on two GPUs, mux 56.80; elapsed 57.156 s. Durations are the item's own step times.
 */
export const BREAKDOWN = {
  still: 'still-rain',
  clip: 'fl2va-rain',
  starts: { te: 0, venc: 1.38, dit: 2.48, video: 34.44, audio: 34.44, mux: 56.8 } as Record<string, number>,
  capture: { src: '/images/showcase/page/records-run-cfa759df.webp', src2x: '/images/showcase/page/records-run-cfa759df@2x.webp', width: 1920, height: 1080 },
} as const;

/** The character sheet and its two unpicked candidates (t2i-pc, ~30 s each; studio/gen/RUNS.md). */
export const CHARACTER = {
  sheet: 'char-courier',
  candidates: [
    { seed: 7, runId: '67cec92f', src: '/images/showcase/page/char-seed-7-384.webp' },
    { seed: 42, runId: 'c6404b02', src: '/images/showcase/page/char-seed-42-384.webp' },
    { seed: 2026, runId: 'd8ca891e', src: '/images/showcase/page/char-seed-2026-384.webp', picked: true },
  ],
} as const;

/** Short run id for display (item.json may carry a full UUID). */
export function shortRun(id: string): string {
  return id.slice(0, 8);
}

export const MACHINE_HOST_LABEL: Record<'dgx' | 'pc', string> = { dgx: 'DGX Spark', pc: 'PC' };
