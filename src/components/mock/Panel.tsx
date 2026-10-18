import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

export interface PanelProps {
  /** Header title (36 px header row). Omit for a header-less panel. */
  title?: ReactNode;
  /** 16 px lucide icon shown before the title. */
  icon?: ReactNode;
  /** Right side of the header: a count, chip or tabs. */
  meta?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/**
 * Solid workbench panel (the App's DockPanel recipe): 12 px radius, `line-subtle` border, `surface` fill, inner top edge,
 * optional 36 px header. Never glows; use inside an AppWindow for illustrative screens.
 */
export function Panel({ title, icon, meta, className, bodyClassName, children }: PanelProps) {
  return (
    <div className={cn('flex min-w-0 flex-col rounded-lg border border-line-subtle bg-surface shadow-edge', className)}>
      {title !== undefined ? (
        <div className="flex h-9 shrink-0 items-center gap-2 border-b border-line-subtle px-3 text-data font-semibold text-fg [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-fg-tertiary">
          {icon}
          <span className="min-w-0 truncate">{title}</span>
          {meta !== undefined ? <span className="ml-auto flex shrink-0 items-center gap-1.5 font-normal">{meta}</span> : null}
        </div>
      ) : null}
      <div className={cn('min-h-0 flex-1 p-3', bodyClassName)}>{children}</div>
    </div>
  );
}

/** Small mono counter/value chip used in panel headers and toolbars (the App's count capsule). */
export function MockCount({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('machine inline-flex h-5 items-center rounded-full bg-overlay px-1.5 text-[11px] text-fg-secondary', className)}>{children}</span>;
}

export type MockChipTone = 'neutral' | 'info' | 'success' | 'warning' | 'entity' | 'file' | 'action';

const CHIP_TONE: Record<MockChipTone, string> = {
  neutral: 'border-line-strong bg-raised text-fg-secondary',
  info: 'border-info/30 bg-info/12 text-info',
  success: 'border-success/30 bg-success/12 text-success',
  warning: 'border-warning/30 bg-warning/12 text-warning',
  entity: 'border-entity/30 bg-entity/12 text-entity',
  file: 'border-file/30 bg-file/12 text-file',
  action: 'border-action/30 bg-brand-soft text-action-fg',
};

/** Status chip in the App's recipe (tone/12 fill, tone/30 border, tone text), always icon or dot + text. */
export function MockChip({ tone = 'neutral', icon, children, className }: { tone?: MockChipTone; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-5 shrink-0 items-center gap-1 rounded-full border px-1.5 text-[11px] leading-none font-medium whitespace-nowrap [&>svg]:size-3',
        CHIP_TONE[tone],
        className,
      )}
    >
      {icon ?? <span aria-hidden className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
