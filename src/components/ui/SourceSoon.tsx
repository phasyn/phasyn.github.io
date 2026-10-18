import { Clock } from 'lucide-react';
import { useLocale } from '../../i18n/locale.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { Chip } from './Chip.tsx';

/** The required notice wherever source code is mentioned: source and architecture notes are not published yet. */
export function SourceSoon({ className }: { className?: string }) {
  const copy = commonCopy(useLocale());
  return (
    <Chip tone="warning" icon={<Clock aria-hidden />} {...(className ? { className } : {})}>
      {copy.sourceSoon}
    </Chip>
  );
}
