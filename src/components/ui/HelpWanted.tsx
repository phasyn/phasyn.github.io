import { HeartHandshake } from 'lucide-react';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { cn } from '../../lib/cn.ts';
import { LINKS } from '../../site/config.ts';

/** "Contributions welcome" at the start of the introduction (the Home hero), linking to the open-source repository. */
export function HelpWanted({ className }: { className?: string }) {
  const copy = commonCopy(useLocale());
  return (
    <a
      href={LINKS.studioRepo}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'material-hud text-on-fx inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[0.9375rem] leading-snug font-medium text-fg no-underline hover:text-action-fg',
        className,
      )}
    >
      <HeartHandshake aria-hidden className="size-4 shrink-0 text-action-fg" />
      <span>{copy.helpWanted}</span>
    </a>
  );
}
