// Hero scene quality tiers and the rules that pick them. Pure (no three.js, no DOM access) so the main chunk can use it before
// the WebGL chunk loads.

export type QualityTier = 'high' | 'balanced' | 'low';

export interface TierSettings {
  /** Device pixel ratio cap (the canvas uses [1, dprMax]). */
  dprMax: number;
  /** Dust particles drawn (the buffer is allocated once for `high`, lower tiers only shorten the draw range). */
  particles: number;
  /**
   * Selective bloom (luminance-thresholded, so only the HDR hairlines and glints glow). Every tier keeps the composer itself,
   * which owns anti-aliasing (MSAA on its render target) and the single tone-mapping pass.
   */
  bloom: boolean;
  /** Bloom mip levels. */
  bloomLevels: number;
  /** MSAA samples of the composer's render target. */
  multisampling: number;
  /** Resolution scale of three's transmission (refraction) buffer. */
  transmissionScale: number;
}

export const TIERS: Record<QualityTier, TierSettings> = {
  high: { dprMax: 1.75, particles: 900, bloom: true, bloomLevels: 7, multisampling: 4, transmissionScale: 1 },
  balanced: { dprMax: 1.35, particles: 520, bloom: true, bloomLevels: 5, multisampling: 2, transmissionScale: 0.6 },
  low: { dprMax: 1, particles: 260, bloom: false, bloomLevels: 0, multisampling: 2, transmissionScale: 0.5 },
};

export const MAX_PARTICLES = TIERS.high.particles;

export interface DeviceHints {
  cores?: number | undefined;
  memoryGB?: number | undefined;
  coarsePointer: boolean;
  /** Viewport CSS width. */
  width: number;
  saveData?: boolean | undefined;
}

/** Starting tier from cheap device hints; the performance monitor adjusts it afterwards. */
export function initialTier({ cores, memoryGB, coarsePointer, width, saveData }: DeviceHints): QualityTier {
  if (saveData) return 'low';
  if ((memoryGB !== undefined && memoryGB < 4) || (cores !== undefined && cores <= 2)) return 'low';
  if (coarsePointer || width < 840 || (cores !== undefined && cores < 8)) return 'balanced';
  return 'high';
}

export function lowerTier(tier: QualityTier): QualityTier {
  return tier === 'high' ? 'balanced' : 'low';
}

export function higherTier(tier: QualityTier): QualityTier {
  return tier === 'low' ? 'balanced' : 'high';
}

/** Reasons the render loop is stopped. The loop runs only while the set is empty. */
export type PauseReason = 'offscreen' | 'hidden' | 'user' | 'context-lost';
