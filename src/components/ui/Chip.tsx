import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

export type ChipTone = 'neutral' | 'brand' | 'info' | 'success' | 'warning' | 'entity' | 'file';

// Status chip recipe: tone/12 fill, tone/30 border, tone text (DESIGN_GUIDE §3.4).
const TONE: Record<ChipTone, string> = {
  neutral: 'border-line-strong bg-raised text-fg-secondary',
  brand: 'border-action/30 bg-brand-gradient-soft text-action-fg',
  info: 'border-info/30 bg-info/12 text-info',
  success: 'border-success/30 bg-success/12 text-success',
  warning: 'border-warning/30 bg-warning/12 text-warning',
  entity: 'border-entity/30 bg-entity/12 text-entity',
  file: 'border-file/30 bg-file/12 text-file',
};

export function Chip({ tone = 'neutral', icon, className, children }: { tone?: ChipTone; icon?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex min-h-6 items-center gap-1.5 rounded-full border px-2.5 text-caption font-medium whitespace-nowrap [&_svg]:size-3.5',
        TONE[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
