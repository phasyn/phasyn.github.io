import { cn } from '../../../lib/cn.ts';

/** Two or three parallel options (pressed-button group); used for chart scenario switches. */
export function Segmented<T extends string>({ label, value, options, onChange, className }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; className?: string }) {
  return (
    <div role="group" aria-label={label} className={cn('inline-flex rounded-lg border border-line-control/60 bg-sunken p-0.5', className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'pressable h-7 rounded-md px-3 font-mono text-caption',
            value === option.value ? 'bg-overlay text-fg shadow-[0_1px_2px_rgb(0_0_0/0.4),inset_0_1px_0_rgb(255_255_255/0.06)]' : 'text-fg-tertiary hover:text-fg',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
