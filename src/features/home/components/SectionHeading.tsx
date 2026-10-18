import type { ReactNode } from 'react';
import { cn } from '../../../lib/cn.ts';

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  align?: 'start' | 'center';
  /** Heading size: `display` for chapter openers, `headline` for secondary sections. */
  size?: 'display' | 'headline';
  /** -1 makes the heading a programmatic focus target (e.g. after an in-page CTA). */
  headingTabIndex?: number;
  className?: string;
  children?: ReactNode;
}

/**
 * Section opener: decorative Latin eyebrow (wide tracking, aria-hidden), the h2 in the display scale (CJK without tracking,
 * balanced wrapping) and an optional lead paragraph. Uses the CSS `reveal` entrance (static where unsupported or reduced motion).
 */
export function SectionHeading({ id, eyebrow, title, lead, align = 'start', size = 'display', headingTabIndex, className, children }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <header className={cn('reveal grid gap-5', centered && 'justify-items-center text-center', className)}>
      <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
        <span className="h-px w-8 bg-brand-gradient" />
        {eyebrow}
      </p>
      <h2
        id={id}
        {...(headingTabIndex === undefined ? {} : { tabIndex: headingTabIndex })}
        className={cn(
          'outline-none',
          'max-w-[22ch] text-balance-cjk tracking-display text-fg',
          size === 'display' ? 'text-display' : 'text-headline',
          centered && 'mx-auto',
        )}
      >
        {title}
      </h2>
      {lead ? <p className={cn('max-w-[46ch] text-lead text-fg-secondary', centered && 'mx-auto')}>{lead}</p> : null}
      {children}
    </header>
  );
}
