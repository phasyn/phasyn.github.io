import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { DecodeText, RevealText } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SHOWCASE } from './copy.ts';
import { MACHINE_DOT, MACHINE_LABEL, formatSeconds, lanes, type MachineKey, type ShowcaseItem, type ShowcaseStep } from './data.ts';

/** Section opener: decoding Latin eyebrow, a glowing per-character h2 reveal on view, the lead fades up (scroll reveal). */
export function SectionHeading({ id, eyebrow, title, lead, className, children }: { id: string; eyebrow: string; title: string; lead?: ReactNode; className?: string; children?: ReactNode }) {
  return (
    <header className={cn('sc-heading grid gap-5', className)}>
      <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
        <span className="sc-eyebrow-line w-10" />
        <DecodeText text={eyebrow} />
      </p>
      <RevealText as="h2" id={id} text={title} on="view" className="max-w-[24ch] text-display tracking-display text-balance-cjk text-fg" />
      {lead ? <p className="reveal max-w-[52ch] text-lead text-fg-secondary">{lead}</p> : null}
      {children}
    </header>
  );
}

export function MachineName({ machine }: { machine: MachineKey }) {
  const copy = SHOWCASE[useLocale()].card;
  return machine === 'unknown' ? <span>{copy.placementNotRecorded}</span> : <span lang="en">{MACHINE_LABEL[machine]}</span>;
}

export function MachineDot({ machine, className }: { machine: MachineKey; className?: string }) {
  return <span aria-hidden className={cn('inline-block size-2 shrink-0 rounded-full', MACHINE_DOT[machine], className)} />;
}

/** "AI-generated" disclosure badge, on every result. */
export function AiBadge({ className }: { className?: string }) {
  const copy = SHOWCASE[useLocale()].card;
  return (
    <span className={cn('inline-flex min-h-6 items-center gap-1.5 rounded-full border border-[rgb(255_255_255_/_0.14)] bg-[rgb(7_11_20_/_0.72)] px-2.5 text-caption font-medium text-fg backdrop-blur-sm', className)}>
      <Sparkles aria-hidden className="size-3 text-brand-cyan" />
      {copy.ai}
    </span>
  );
}

/** Pipeline id chip (never translated). */
export function PipelineChip({ pipeline, className }: { pipeline: string; className?: string }) {
  return (
    <span lang="en" className={cn('machine inline-flex min-h-6 items-center rounded-md border border-action/30 bg-brand-gradient-soft px-2 text-[11px] font-semibold text-action-fg', className)}>
      {pipeline}
    </span>
  );
}

export function useStepName(): (step: ShowcaseStep) => string {
  const names = SHOWCASE[useLocale()].card.stepName;
  return (step) => names[step.id] ?? step.label;
}

/** "1.3 s", "~23 s", "not recorded". */
export function useSecondsText(): (seconds: number | null, approx?: boolean) => string {
  const copy = SHOWCASE[useLocale()].card;
  return (seconds, approx = false) => {
    if (seconds === null) return copy.notRecorded;
    const value = `${formatSeconds(seconds)} ${copy.seconds}`;
    return approx ? `${copy.approx}${copy.approx === '~' ? '' : ' '}${value}` : value;
  };
}

export function useStepShort(): (step: ShowcaseStep) => string {
  const names = SHOWCASE[useLocale()].card.stepShort;
  return (step) => names[step.id] ?? step.label;
}

/**
 * Where each step ran: one row per machine (its steps as segments in pipeline order, widths to scale against the
 * end-to-end time, the machine's total on the right) and, under the bar, the steps by name with their times. Durations
 * only — rows never claim when a step started (steps on different GPUs can overlap).
 */
export function StepLanes({ item, className, dense = false }: { item: ShowcaseItem; className?: string; dense?: boolean }) {
  const locale = useLocale();
  const copy = SHOWCASE[locale].card;
  const stepName = useStepName();
  const stepShort = useStepShort();
  const secondsText = useSecondsText();
  const groups = lanes(item);
  const scale = Math.max(item.endToEndSeconds ?? 0, ...groups.map((lane) => lane.seconds ?? 0), 1);
  return (
    <ul aria-label={copy.steps} className={cn('grid gap-2', className)}>
      {groups.map((lane) => (
        <li key={lane.machine} className="grid grid-cols-[minmax(0,8.25rem)_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-0.5">
          <span className="inline-flex min-w-0 items-center gap-2 text-caption font-medium text-fg">
            <MachineDot machine={lane.machine} />
            <span className="truncate">
              <MachineName machine={lane.machine} />
            </span>
          </span>
          <span aria-hidden className="flex h-1.5 gap-px overflow-hidden rounded-full bg-[rgb(255_255_255_/_0.06)]">
            {lane.steps.map((step) =>
              step.seconds === null ? null : (
                <span key={step.id} className={cn('sc-seg h-full rounded-full', `sc-seg-${lane.machine}`)} style={{ width: `${Math.max(1.2, (step.seconds / scale) * 100)}%` }} />
              ),
            )}
          </span>
          <span className="machine text-right text-caption text-fg-secondary tabular-nums">{secondsText(lane.seconds, lane.approx)}</span>
          {dense ? null : (
            <span className="col-span-3 truncate pl-4 text-[12px] leading-snug text-fg-tertiary">
              {lane.steps.map((step, index) => (
                <span key={step.id} title={stepName(step)}>
                  {index ? <span aria-hidden> · </span> : null}
                  {stepShort(step)}
                  {lane.steps.length > 1 && step.seconds !== null ? (
                    <span className="machine text-fg-secondary tabular-nums"> {secondsText(step.seconds, step.approx).replace(/ ?(s|秒)$/, '')}</span>
                  ) : null}
                </span>
              ))}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/** The exact prompt, collapsed by default (works without JavaScript). English model input, so lang="en". */
export function PromptDisclosure({ prompt, summary, className }: { prompt: string; summary: string; className?: string }) {
  if (!prompt) return null;
  return (
    <details className={cn('group/prompt rounded-lg border border-line-subtle bg-sunken/60', className)}>
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 px-3 text-caption font-semibold text-fg-secondary hover:text-fg [&::-webkit-details-marker]:hidden">
        {summary}
        <span aria-hidden className="text-fg-tertiary transition-transform group-open/prompt:rotate-45">+</span>
      </summary>
      <p lang="en" className="max-h-72 overflow-auto border-t border-line-subtle px-3 py-3 font-mono text-[12px] leading-relaxed whitespace-pre-line text-fg-secondary [text-wrap:wrap]">
        {prompt}
      </p>
    </details>
  );
}
