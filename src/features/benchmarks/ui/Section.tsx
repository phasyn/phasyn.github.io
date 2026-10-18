import type { ReactNode } from 'react';
import { RevealText } from '../../../components/fx/index.ts';
import { cn } from '../../../lib/cn.ts';

/*
 * Page section on a near-solid canvas band: the layout's nebula glows through only in the soft seams between sections,
 * never under text, tables or charts. The headline reveals on view; the eyebrow is a short decorative Latin label.
 */
export function Section({ id, eyebrow, title, lead, children, className, wide = false }: { id: string; eyebrow: string; title: string; lead?: ReactNode; children: ReactNode; className?: string; wide?: boolean }) {
  return (
    <section id={id} className={cn('relative isolate scroll-mt-(--site-header-h)', className)}>
      {/* Solid page surface: the site background never shows through behind data (no faded veil edges). */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-canvas" />
      <div className="site-container grid gap-10 pt-[clamp(4.5rem,2.5rem+6vw,8.5rem)] pb-[clamp(3rem,2rem+2vw,4.5rem)] md:gap-14">
        <header className={cn('grid gap-4', wide ? 'max-w-[64rem]' : 'max-w-[52rem]')}>
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="h-px w-8 bg-brand-gradient" />
            {eyebrow}
          </p>
          <RevealText as="h2" on="view" text={title} className="text-display tracking-display text-balance-cjk text-fg" />
          {lead ? <p className="text-lead text-pretty text-fg-secondary">{lead}</p> : null}
        </header>
        {children}
      </div>
    </section>
  );
}

export function SubHead({ title, lead, id }: { title: string; lead?: ReactNode; id?: string }) {
  return (
    <div className="grid max-w-[52rem] gap-2" id={id}>
      <h3 className="text-headline text-balance-cjk text-fg">{title}</h3>
      {lead ? <p className="text-reading text-pretty text-fg-secondary">{lead}</p> : null}
    </div>
  );
}
