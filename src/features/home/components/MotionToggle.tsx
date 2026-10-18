import { Pause, Play } from 'lucide-react';
import { cn } from '../../../lib/cn.ts';

interface MotionToggleProps {
  paused: boolean;
  onToggle: () => void;
  pauseLabel: string;
  playLabel: string;
  className?: string;
}

/**
 * Pause/play control for a continuous decorative animation (WCAG 2.2.2). A real button with the current action as its name;
 * `aria-pressed` reflects the paused state. Hidden by the caller when motion is reduced (nothing moves then).
 */
export function MotionToggle({ paused, onToggle, pauseLabel, playLabel, className }: MotionToggleProps) {
  const label = paused ? playLabel : pauseLabel;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={paused}
      aria-label={label}
      title={label}
      className={cn(
        'pressable material-hud inline-flex size-9 items-center justify-center rounded-full border border-[rgb(255_255_255_/_0.1)] text-fg-secondary hover:text-fg',
        className,
      )}
    >
      {paused ? <Play className="ml-px size-3.5 fill-current" aria-hidden /> : <Pause className="size-3.5 fill-current" aria-hidden />}
    </button>
  );
}
