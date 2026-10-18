import { cn } from '../../lib/cn.ts';

export interface TickerItem {
  label: string;
  value: string;
  /** Device colour key for the dot. */
  device?: 'rtx5080' | 'rtx3060' | 'gb10' | 'cpu';
}

const DOT: Record<NonNullable<TickerItem['device']>, string> = {
  rtx5080: 'bg-series-1',
  gb10: 'bg-series-2',
  rtx3060: 'bg-series-3',
  cpu: 'bg-series-neutral',
};

/**
 * HUD ticker of real measured values scrolling across a band. Duplicated track for a seamless loop; pauses on hover;
 * reduced motion shows a static wrapped list. The first copy is the accessible one.
 */
export function DataTicker({ items, label, className, duration = 48 }: { items: TickerItem[]; label: string; className?: string; duration?: number }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((item) => (
        <li key={`${item.label}-${item.value}`} className="flex items-center gap-2.5 whitespace-nowrap">
          {item.device ? <span aria-hidden className={cn('size-1.5 rounded-full', DOT[item.device])} /> : null}
          <span className="text-caption text-fg-tertiary">{item.label}</span>
          <span className="machine text-data font-semibold text-fg">{item.value}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <section
      aria-label={label}
      className={cn('relative overflow-hidden border-y border-line-subtle bg-sunken/70 py-3 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]', className)}
    >
      <div className="fx-ticker-track" style={{ ['--fx-ticker-duration' as string]: `${duration}s` }}>
        {row(false)}
        {row(true)}
      </div>
    </section>
  );
}
