import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { LINKS } from '../../site/config.ts';
import { GitHubMark } from '../brand/ExternalMarks.tsx';
import { Chip } from './Chip.tsx';

/*
 * Opaque base under the usual success tint (FE-02): the chip sits over the nebula in heroes and closings, so its contrast
 * must not depend on what is behind it.
 */
const SOLID = 'bg-sunken shadow-[0_1px_10px_rgb(2_4_9_/_0.45)]';

/** Wherever source code is mentioned: a link to the open-source repository on GitHub. */
export function SourceSoon({ className }: { className?: string }) {
  const copy = commonCopy(useLocale());
  return (
    <a href={LINKS.studioRepo} target="_blank" rel="noopener noreferrer" className="no-underline">
      <Chip
        tone="success"
        icon={<GitHubMark className="size-3.5" />}
        className={cn(SOLID, 'hover:brightness-110', className)}
      >
        {copy.sourceSoon}
      </Chip>
    </a>
  );
}
