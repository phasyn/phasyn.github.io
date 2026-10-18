import type { Precision, SceneKey, Schedule } from './types.ts';

// Committed posters/frames live in public/images/benchmarks (WebP). Videos are review-only in public/media/benchmarks and
// are served from the Hugging Face dataset in production through mediaUrl(); paths here are relative to the media base.

export const img = (name: string) => `/images/benchmarks/${name}`;
export const video = (name: string) => `benchmarks/${name}`;

export interface GridTile {
  precision: Precision;
  schedule: Schedule;
  component: string;
  exact?: boolean;
}

export type GridKey = 't2vaFp8' | 't2vaPai8' | 'ref2vaFp8';

export interface Grid {
  key: GridKey;
  scenario: 't2va' | 'ref2va';
  file: string;
  hud: string;
  /** Top-left, top-right, bottom-left, bottom-right. */
  tiles: [GridTile, GridTile, GridTile, GridTile];
}

const t = (precision: Precision, schedule: Schedule, component: string, exact?: boolean): GridTile => ({ precision, schedule, component, ...(exact ? { exact } : {}) });

export const GRIDS: readonly Grid[] = [
  {
    key: 't2vaFp8',
    scenario: 't2va',
    file: 't2va-grid-fp8-schedules',
    hud: 'T2VA · FP8 · RTX 5080',
    tiles: [t('FP8', 'pai8', 'dit-5080'), t('FP8', 'turbo8', 'dit5080-fl2va-fp8-lx8'), t('FP8', 'turbo4', 'dit5080-fl2va-fp8-lx4'), t('FP8', 'original', 'dit5080-fl2va-fp8-base')],
  },
  {
    key: 't2vaPai8',
    scenario: 't2va',
    file: 't2va-grid-pai8-precisions',
    hud: 'T2VA · PAI 8 · RTX 5080',
    tiles: [t('FP8', 'pai8', 'dit-5080'), t('INT8', 'pai8', 'dit5080-fl2va-int8-pai8'), t('BF16', 'pai8', 'dit5080-fl2va-bf16-pai8'), t('BF16', 'original', 'dit5080-fl2va-bf16-base-exact', true)],
  },
  {
    key: 'ref2vaFp8',
    scenario: 'ref2va',
    file: 'ref2va-grid-fp8-schedules',
    hud: 'REF2VA · FP8 · RTX 5080',
    tiles: [t('FP8', 'pai8', 'dit5080-ref2va-fp8-pai8'), t('FP8', 'turbo8', 'dit5080-ref2va-fp8-lx8'), t('FP8', 'turbo4', 'dit5080-ref2va-fp8-lx4'), t('FP8', 'original', 'dit5080-ref2va-fp8-base')],
  },
];

/** Tile origins in the 1540×900 grid (768×448 tiles, 4 px gutters), as fractions. */
export const TILE_ORIGIN: readonly [number, number][] = [
  [0, 0],
  [772 / 1540, 0],
  [0, 452 / 900],
  [772 / 1540, 452 / 900],
];

export const todayClip = (pipeline: 'fl2va' | 'ref2va', scene: SceneKey) => ({ video: video(`today-${pipeline}-${scene}.mp4`), poster: img(`today-${pipeline}-${scene}.webp`) });
export const todayStill = (scene: SceneKey) => img(`today-still-${scene}.webp`);
