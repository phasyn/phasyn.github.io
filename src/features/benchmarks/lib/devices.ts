import type { DeviceId, Placement } from '../data/types.ts';

// Fixed device → colour mapping for the whole page (validated with the dataviz palette checker on surface #0b1120
// and raised #121a2d: worst all-pairs CVD ΔE 9.4, normal-vision ΔE 20.9, contrast ≥ 3:1). PC CPU uses the neutral
// slot, which is below the chroma floor, so it always travels with a text label.

export const DEVICES: readonly DeviceId[] = ['pc-rtx5080', 'dgx-gb10', 'pc-rtx3060', 'pc-cpu'];

export const DEVICE_BG: Record<DeviceId, string> = {
  'pc-rtx5080': 'bg-series-1',
  'dgx-gb10': 'bg-series-2',
  'pc-rtx3060': 'bg-series-3',
  'pc-cpu': 'bg-series-neutral',
};

export const DEVICE_FILL: Record<DeviceId, string> = {
  'pc-rtx5080': 'fill-series-1',
  'dgx-gb10': 'fill-series-2',
  'pc-rtx3060': 'fill-series-3',
  'pc-cpu': 'fill-series-neutral',
};

export const DEVICE_STROKE: Record<DeviceId, string> = {
  'pc-rtx5080': 'stroke-series-1',
  'dgx-gb10': 'stroke-series-2',
  'pc-rtx3060': 'stroke-series-3',
  'pc-cpu': 'stroke-series-neutral',
};

export const DEVICE_VAR: Record<DeviceId, string> = {
  'pc-rtx5080': 'var(--color-series-1)',
  'dgx-gb10': 'var(--color-series-2)',
  'pc-rtx3060': 'var(--color-series-3)',
  'pc-cpu': 'var(--color-series-neutral)',
};

/** Short, language-neutral machine tags for dense cells (the full name is in the row details). */
export const DEVICE_SHORT: Record<DeviceId, string> = {
  'pc-rtx5080': 'RTX 5080',
  'dgx-gb10': 'GB10',
  'pc-rtx3060': 'RTX 3060',
  'pc-cpu': 'CPU',
};

/** FX kit ticker dot keys. */
export const TICKER_DEVICE = {
  'pc-rtx5080': 'rtx5080',
  'dgx-gb10': 'gb10',
  'pc-rtx3060': 'rtx3060',
  'pc-cpu': 'cpu',
} as const satisfies Record<DeviceId, string>;

export function isDevice(placement: Placement): placement is DeviceId {
  return placement !== 'not-recorded' && placement !== 'not-run';
}
