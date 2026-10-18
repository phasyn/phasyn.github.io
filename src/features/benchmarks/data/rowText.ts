import type { BenchCopy } from '../copy.ts';
import type { DeviceId, SpeedRow, StepKind } from './types.ts';

// Localized row labels (pure; the copy object is passed in).

export function variantName(copy: BenchCopy, row: SpeedRow): string {
  const parts: string[] = [];
  if (row.precision) parts.push(row.precision);
  if (row.schedule) parts.push(copy.schedules[row.schedule]);
  return parts.join(' · ') || '—';
}

export function configTags(copy: BenchCopy, row: SpeedRow): string[] {
  const tags: string[] = [];
  const t = copy.dit.bars.tags;
  const c = row.config;
  if (c.exact) tags.push(t.exact);
  if (c.attention === 'sdpa' && !c.exact) tags.push(t.sdpa);
  if (c.attention === 'subblock') tags.push(t.subblock);
  if (c.adaln === 'off') tags.push(t.adalnOff);
  if (c.afterUse === 'drop') tags.push(t.drop);
  if (row.component?.endsWith('-fixed')) tags.push('AdaLN fixed');
  if (c.mode) tags.push(c.mode);
  return tags;
}

export type StatusTone = 'ok' | 'failed' | 'cancelled';

export function statusLabel(copy: BenchCopy, row: SpeedRow): { tone: StatusTone; label: string } {
  if (row.status === 'ok') return { tone: 'ok', label: copy.status.ok };
  if (row.status === 'cancelled') return { tone: 'cancelled', label: copy.status.cancelled };
  const code = row.failure?.code ?? '';
  if (row.failure?.at === 'dit-load') return { tone: 'failed', label: copy.status.loadFailed };
  if (code === 'GPU_OOM') return { tone: 'failed', label: copy.status.oom };
  if (code === 'INVALID_ARGUMENT') return { tone: 'failed', label: copy.status.invalid };
  if (code === '422') return { tone: 'failed', label: copy.status.refused };
  return { tone: 'failed', label: copy.status.failed };
}

export function outputText(copy: BenchCopy, row: SpeedRow): string {
  return row.frames != null ? `${row.resolution} · ${copy.common.framesShort(row.frames)}` : row.resolution;
}

export function devicesUsed(row: SpeedRow): DeviceId[] {
  const seen: DeviceId[] = [];
  for (const step of row.steps) {
    const list = step.placements ?? (step.placement !== 'not-recorded' && step.placement !== 'not-run' ? [step.placement] : []);
    for (const device of list) if (!seen.includes(device)) seen.push(device);
  }
  return seen;
}

/** The DiT time is only shown as a DiT time when the DiT step itself completed. */
export function ditCompleted(row: SpeedRow): boolean {
  const dit = row.steps.find((step) => step.kind === 'dit');
  return row.dit != null && (dit ? dit.status === 'ok' : row.status === 'ok');
}

export function runLabel(copy: BenchCopy, row: SpeedRow): string {
  const parts = [copy.experimentLabel(row.experiment)];
  if (row.scene) parts.push(copy.scenes[row.scene]);
  if (row.tag) parts.push(row.tag);
  return parts.join(' · ');
}

export function failedStep(row: SpeedRow): StepKind | null {
  return row.failure?.at ?? row.steps.find((step) => step.status === 'failed' || step.status === 'cancelled')?.kind ?? null;
}
