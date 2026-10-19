import { CircleQuestionMark, CircleSlash } from 'lucide-react';
import { cn } from '../../../lib/cn.ts';
import { useBenchCopy } from '../copy.ts';
import type { DeviceId, Placement, ReasonKey } from '../data/types.ts';
import { DEVICE_BG, isDevice } from '../lib/devices.ts';
import { Hint } from './Hint.tsx';

/** The device's colour dot (identity mark only — the name always appears next to it or in its accessible name). */
export function DeviceDot({ device, className }: { device: DeviceId; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-2 shrink-0 rounded-full', DEVICE_BG[device], className)} />;
}

/**
 * Device chip: dot + device name. Unknowns are explicit chips with the reason on hover/focus/tap
 * ("Placement not recorded", "Not run") — never a blank and never a zero.
 */
export function DeviceChip({ placement, reason, compact = false, className }: { placement: Placement; reason?: ReasonKey | undefined; compact?: boolean; className?: string }) {
  const copy = useBenchCopy();
  // Chips may wrap onto a second line in a narrow cell rather than poke out of it.
  const base = cn('inline-flex min-h-6 max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-left text-caption leading-tight text-balance', className);
  if (isDevice(placement)) {
    return (
      <span className={cn(base, 'border-line bg-sunken text-fg-secondary', compact && 'border-transparent bg-transparent px-0')}>
        <DeviceDot device={placement} />
        <span className={compact ? 'sr-only' : undefined}>{copy.machines[placement]}</span>
      </span>
    );
  }
  const label = placement === 'not-recorded' ? copy.common.placementNotRecorded : copy.common.notRun;
  const Icon = placement === 'not-recorded' ? CircleQuestionMark : CircleSlash;
  const chip = (
    <span className={cn(base, 'border-dashed border-line-control/70 bg-transparent text-fg-tertiary [&_svg]:size-3.5 [&_svg]:shrink-0')}>
      <Icon aria-hidden />
      <span>{label}</span>
    </span>
  );
  return reason ? <Hint content={copy.reasons[reason]}>{chip}</Hint> : chip;
}

/** A missing value: "Not measured" / "Not reported" with its reason. Never rendered as 0. */
export function MissingValue({ reason, kind = 'notMeasured', className }: { reason?: ReasonKey | undefined; kind?: 'notMeasured' | 'notReported' | 'notEndToEnd' | 'notRun'; className?: string }) {
  const copy = useBenchCopy();
  const label = copy.common[kind];
  const chip = (
    <span className={cn('inline-flex min-h-6 max-w-full items-center rounded-full border border-dashed border-line-control/70 px-2 py-0.5 text-left text-caption leading-tight text-balance text-fg-tertiary', className)}>
      {label}
    </span>
  );
  return reason ? <Hint content={copy.reasons[reason]}>{chip}</Hint> : chip;
}
