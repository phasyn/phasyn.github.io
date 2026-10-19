import { Clock } from 'lucide-react';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { Chip } from './Chip.tsx';

/*
 * Opaque base under the usual warning tint (FE-02): the chip sits over the nebula in heroes and closings, so its contrast
 * (warning on sunken + 12 % warning ≈ 9.9:1) must not depend on what is behind it. On dark backgrounds it looks the same
 * as the translucent tint.
 */
const SOLID = 'bg-sunken bg-[linear-gradient(rgb(235_192_122_/_0.12)_0_0)] shadow-[0_1px_10px_rgb(2_4_9_/_0.45)]';

/** The required notice wherever source code is mentioned: source and architecture notes are not published yet. */
export function SourceSoon({ className }: { className?: string }) {
  const copy = commonCopy(useLocale());
  return (
    <Chip tone="warning" icon={<Clock aria-hidden />} className={cn(SOLID, className)}>
      {copy.sourceSoon}
    </Chip>
  );
}
