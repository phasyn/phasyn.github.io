import { DIT_VARIANTS } from './charts.gen.ts';
import type { DitVariant } from './chartTypes.ts';
import { FEATURED_ROWS } from './rows.gen.ts';
import type { Precision, Schedule, SpeedRow, Step, StepKind } from './types.ts';

// Small derived views over the generated data. Every value is computed from the data, never typed in.

export const todayRows = (pipeline: SpeedRow['pipeline']) => FEATURED_ROWS.filter((row) => row.experiment === 'today' && row.pipeline === pipeline);

export function totals(rows: readonly SpeedRow[]): number[] {
  return rows.flatMap((row) => (row.total == null ? [] : [row.total]));
}

export function variant(scenario: DitVariant['scenario'], component: string): DitVariant | undefined {
  return DIT_VARIANTS.find((v) => v.scenario === scenario && v.component === component);
}

/** The default variant of each precision × schedule cell: FP8 attention with the cell's standard AdaLN, released to host. */
export function cellVariant(scenario: DitVariant['scenario'], precision: Precision, schedule: Schedule): DitVariant | undefined {
  const candidates = DIT_VARIANTS.filter((v) => v.scenario === scenario && v.precision === precision && v.schedule === schedule);
  return candidates.find((v) => v.attention === 'fp8' && v.afterUse !== 'drop' && v.adaln !== 'off') ?? candidates[0];
}

/** Ratio range of denoise compute, original 50-step ÷ PAI 8, over the default variants. */
export function originalOverPai8(): [number, number] {
  const ratios: number[] = [];
  for (const scenario of ['t2va', 'ref2va'] as const)
    for (const precision of ['FP8', 'INT8', 'BF16'] as const) {
      const base = cellVariant(scenario, precision, 'original');
      const pai8 = cellVariant(scenario, precision, 'pai8');
      if (base?.compute && pai8?.compute) ratios.push(base.compute / pai8.compute);
    }
  return [Math.min(...ratios), Math.max(...ratios)];
}

export const maxCardGiB = () => Math.max(...DIT_VARIANTS.map((v) => v.card ?? 0));

/** Steps laid out on a time axis: sequential, with parallel partners sharing a start (lane 1). */
export interface PlacedStep {
  step: Step;
  start: number;
  lane: 0 | 1;
}

export function placeSteps(steps: readonly Step[]): { placed: PlacedStep[]; end: number } {
  const placed: PlacedStep[] = [];
  let t = 0;
  const started = new Map<StepKind, number>();
  for (const step of steps) {
    if (step.seconds == null || step.sharedFrom) continue;
    const partnerStart = step.parallelWith ? started.get(step.parallelWith) : undefined;
    if (partnerStart != null) {
      placed.push({ step, start: partnerStart, lane: 1 });
      const partner = placed.find((p) => p.step.kind === step.parallelWith);
      const partnerEnd = partner ? partner.start + (partner.step.seconds ?? 0) : t;
      t = Math.max(partnerEnd, partnerStart + step.seconds);
      continue;
    }
    started.set(step.kind, t);
    placed.push({ step, start: t, lane: 0 });
    t += step.seconds;
  }
  return { placed, end: t };
}
