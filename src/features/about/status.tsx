import { CalendarClock, CircleDashed, FlaskConical, Hammer, Target, type LucideIcon } from 'lucide-react';
import { Chip, type ChipTone } from '../../components/ui/Chip.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { ABOUT } from './copy.ts';

/**
 * Honesty labels (DESIGN_GUIDE §17): anything not shipped carries one. Status is always icon + text,
 * and never uses the brand gradient.
 *  - inDevelopment / planned: COMMON strings (shared with the other pages)
 *  - testing: exists but not verified end to end (one-click character swap)
 *  - designGoal: the author's intent, not packaged yet (renting cloud machines)
 *  - coming: on the author's list, not in the product yet, to be added (background removal)
 */
export type Status = 'inDevelopment' | 'planned' | 'testing' | 'designGoal' | 'coming';

const RECIPE: Record<Status, { tone: ChipTone; icon: LucideIcon }> = {
  inDevelopment: { tone: 'info', icon: Hammer },
  planned: { tone: 'neutral', icon: CircleDashed },
  testing: { tone: 'warning', icon: FlaskConical },
  designGoal: { tone: 'neutral', icon: Target },
  coming: { tone: 'neutral', icon: CalendarClock },
};

export function useStatusLabels(): Record<Status, string> {
  const locale = useLocale();
  const common = commonCopy(locale);
  const own = ABOUT[locale].status;
  return { inDevelopment: common.inDevelopment, planned: common.planned, testing: own.testing, designGoal: own.designGoal, coming: own.coming };
}

export function StatusChip({ status, className }: { status: Status; className?: string }) {
  const labels = useStatusLabels();
  const { tone, icon: Icon } = RECIPE[status];
  return (
    <Chip tone={tone} icon={<Icon aria-hidden />} {...(className ? { className } : {})}>
      {labels[status]}
    </Chip>
  );
}
