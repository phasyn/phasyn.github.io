import { ArrowUpRight, Bot, Clapperboard, Info, Network, UserRound, Wand2, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { SpotlightCard } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { pagePath } from '../../site/config.ts';
import { SHOWCASE, WORKFLOW_IDS, WORKFLOW_TOUR_ANCHOR, type WorkflowId } from './copy.ts';
import { SectionHeading } from './parts.tsx';

const ICON: Record<WorkflowId, LucideIcon> = {
  storyboard: Clapperboard,
  character: UserRound,
  advisor: Wand2,
  agent: Bot,
  machines: Network,
};

/** Grid placement: two wide workflows, then three. */
const SPAN: Record<WorkflowId, string> = {
  storyboard: 'lg:col-span-3',
  character: 'lg:col-span-3',
  advisor: 'lg:col-span-2',
  agent: 'lg:col-span-2',
  machines: 'lg:col-span-2',
};

/** Productivity: real workflows built only from shipped features, each with steps and a link to its Tour chapter. */
export function Workflows() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].workflows;
  return (
    <section id="workflows" aria-labelledby="workflows-title" className="site-container py-[clamp(4rem,2.5rem+6vw,8rem)]">
      <SectionHeading id="workflows-title" eyebrow={copy.eyebrow} title={copy.title} lead={copy.lead} />
      <ol className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
        {WORKFLOW_IDS.map((id, index) => {
          const workflow = copy.items[id];
          const Icon = ICON[id];
          return (
            <li key={id} className={cn('min-w-0', SPAN[id], id === 'machines' && 'md:col-span-2 lg:col-span-2')}>
              <SpotlightCard tilt={3} className="h-full">
                <article aria-labelledby={`wf-${id}`} className="grid h-full content-start gap-5 p-5 md:p-6">
                  <header className="flex items-start gap-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-brand-cyan/40 bg-brand-gradient-soft text-brand-cyan shadow-glow-sm">
                      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    </span>
                    <div className="grid min-w-0 gap-1">
                      <p lang="en" aria-hidden className="machine text-[11px] font-semibold tracking-[0.18em] text-brand-cyan">
                        WORKFLOW {String(index + 1).padStart(2, '0')}
                      </p>
                      <h3 id={`wf-${id}`} className="text-section font-semibold text-balance-cjk text-fg">
                        {workflow.title}
                      </h3>
                      <p className="text-caption text-fg-tertiary">{workflow.summary}</p>
                    </div>
                  </header>

                  <ol className="sc-steps grid gap-3">
                    {workflow.steps.map((step, i) => (
                      <li key={step} className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 text-body text-fg-secondary">
                        <span aria-hidden className="machine relative z-10 grid size-7 place-items-center rounded-full border border-line-strong bg-raised text-[11px] font-semibold text-fg">
                          {i + 1}
                        </span>
                        <span className="pt-0.5 [text-wrap:pretty]">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {workflow.note ? (
                    <p className="flex gap-2.5 rounded-lg border border-warning/25 bg-warning/8 p-3 text-caption text-fg-secondary">
                      <Info aria-hidden className="mt-0.5 size-3.5 shrink-0 text-warning" />
                      <span className="[text-wrap:pretty]">{workflow.note}</span>
                    </p>
                  ) : null}

                  <Link
                    to={`${pagePath(locale, 'tour')}#${WORKFLOW_TOUR_ANCHOR[id]}`}
                    className="pressable mt-auto inline-flex min-h-10 w-max items-center gap-2 rounded-full border border-line-strong bg-raised px-4 text-caption font-semibold text-fg no-underline hover:border-action/60"
                    viewTransition
                  >
                    {copy.tour}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </Link>
                </article>
              </SpotlightCard>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
