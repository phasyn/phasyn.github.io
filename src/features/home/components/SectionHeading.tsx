import type { ReactNode } from 'react';
import { DecodeText, RevealText } from '../../../components/fx/index.ts';
import { cn } from '../../../lib/cn.ts';

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  lead?: ReactNode;
  align?: 'start' | 'center';
  /** Heading size: `display` for chapter openers, `headline` for secondary sections. */
  size?: 'display' | 'headline';
  className?: string;
  children?: ReactNode;
}

/**
 * Section opener (FX kit): the Latin eyebrow decodes from glyph noise behind a light line that draws in, the h2 rises
 * character by character out of a glow (RevealText, on view), the lead fades up. The h2 keeps its id and accessible name; the
 * final text is in the prerendered HTML and static under reduced motion.
 */
export function SectionHeading({ id, eyebrow, title, lead, align = 'start', size = 'display', className, children }: SectionHeadingProps) {
  const centered = align === 'center';
  return (
    <header className={cn('home-heading grid gap-5', centered && 'justify-items-center text-center', className)}>
      <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
        <span className="home-eyebrow-line w-10" />
        <DecodeText text={eyebrow} />
        {centered ? <span className="home-eyebrow-line w-10 [transform-origin:right_center]" /> : null}
      </p>
      <RevealText
        as="h2"
        id={id}
        text={title}
        on="view"
        className={cn('max-w-[22ch] text-balance-cjk tracking-display text-fg', size === 'display' ? 'text-display' : 'text-headline', centered && 'mx-auto')}
      />
      {lead ? <p className={cn('reveal max-w-[46ch] text-lead text-fg-secondary', centered && 'mx-auto')}>{lead}</p> : null}
      {children}
    </header>
  );
}

/** Chapter seam between sections: a hairline that opens and a light that sweeps along it while it scrolls past. */
export function SectionSeam() {
  return (
    <div aria-hidden className="site-container">
      <div className="home-seam">
        <span className="home-seam-line" />
        <span className="home-seam-light" />
      </div>
    </div>
  );
}
