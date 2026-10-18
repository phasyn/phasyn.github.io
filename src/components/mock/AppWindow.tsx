import type { ReactNode } from 'react';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { cn } from '../../lib/cn.ts';
import { IllustrativeBadge } from './IllustrativeBadge.tsx';

export interface AppWindowProps {
  /** Window title, usually the workspace or screen name in the English UI (e.g. "Video Studio · Edit"). */
  title?: string;
  /** Extra controls on the right of the title bar (before the badge). */
  toolbar?: ReactNode;
  /** One-line summary of the scene for assistive tech. The window is then exposed as a single image ("Illustrative UI: …"). */
  label?: string;
  /** Show the visible "Illustrative UI" badge (default true; required by BRIEF §5 for any made-up values). */
  illustrative?: boolean;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

/**
 * A Phasyn Studio-style app window for illustrative re-creations: 14 px radius, solid canvas body, window shadow, a neutral title
 * bar (no browser chrome, no URLs) and the visible illustrative badge. The content inside follows the App's workbench rules:
 * solid panels, no glow on data. Rendered `lang="en"` because mock-ups show the English UI in every locale, like the Tour videos.
 */
export function AppWindow({ title, toolbar, label, illustrative = true, className, bodyClassName, children }: AppWindowProps) {
  const prefix = commonCopy(useLocale()).illustrative;
  return (
    <div
      lang="en"
      {...(label ? { role: 'img', 'aria-label': `${prefix}: ${label}` } : {})}
      className={cn(
        'relative isolate flex min-w-0 flex-col overflow-hidden rounded-xl border border-[rgb(255_255_255_/_0.08)] bg-canvas text-left shadow-window',
        className,
      )}
    >
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-line-subtle bg-rail px-3.5">
        <span aria-hidden className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        {title ? <span className="min-w-0 truncate text-data font-medium text-fg-secondary">{title}</span> : null}
        <span className="ml-auto flex shrink-0 items-center gap-2">
          {toolbar}
          {illustrative ? <IllustrativeBadge /> : null}
        </span>
      </div>
      <div className={cn('relative min-h-0 flex-1', bodyClassName)}>{children}</div>
    </div>
  );
}
