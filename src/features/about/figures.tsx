import { ArrowRight, Cog, Cpu, Download, Power, PowerOff, Upload, type LucideIcon } from 'lucide-react';
import { Fragment } from 'react';
import { cn } from '../../lib/cn.ts';
import { CUTOUTS, Cutout, type CutoutSlug } from './art.tsx';
import { SETUP_IDS, SETUP_MACHINES, type AboutCopy, type CapabilityId } from './copy.ts';
import { AreaArt, stagger, useDisplayBreak } from './parts.tsx';
import { StatusChip, type Status } from './status.tsx';

/* Figures inside the reading column: solid surfaces and crisp lines; the only glow comes from the Codex art. */

/** Which machine runs which step today (BRIEF §3). A data table: static, no art, no entrance motion. */
export function SetupFigure({ setup }: { setup: AboutCopy['built']['setup'] }) {
  const display = useDisplayBreak();
  return (
    <figure className="my-10 overflow-hidden rounded-xl border border-line bg-surface shadow-edge md:my-12">
      <figcaption className="flex items-center gap-2 border-b border-line-subtle px-5 py-3 text-caption font-semibold text-fg-tertiary">
        <Cpu aria-hidden className="size-3.5" />
        {setup.caption}
      </figcaption>
      <dl className="divide-y divide-line-subtle">
        {SETUP_IDS.map((id) => (
          <div key={id} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] sm:items-baseline sm:gap-6">
            <dt className="flex items-baseline gap-2.5 whitespace-nowrap">
              <span className="text-body font-semibold text-fg">{SETUP_MACHINES[id].name}</span>
              <span className="machine text-data text-fg-tertiary">{SETUP_MACHINES[id].spec}</span>
            </dt>
            <dd className="text-body text-fg-secondary">{setup.roles[id]}</dd>
          </div>
        ))}
      </dl>
      <p className={cn('border-t border-line-subtle bg-sunken/60 px-5 py-3 text-caption text-fg-tertiary [text-wrap:pretty]', display)}>{setup.note}</p>
    </figure>
  );
}

/**
 * text → image → video: the F1 pipeline art (cropped to its subject; the square canvas is mostly transparent
 * padding) with the three steps written out underneath.
 */
export function PipelineFigure({ label, steps }: { label: string; steps: AboutCopy['today']['pipeline'] }) {
  return (
    <figure className="reveal my-8 grid justify-items-center md:my-10">
      <Cutout slug={CUTOUTS.pipeline} size={320} className="h-48 w-72 object-cover sm:h-52 sm:w-80" />
      <figcaption className="mt-2 text-body font-semibold text-fg">
        <span className="sr-only">{label}</span>
        <span aria-hidden className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {steps.map((step, index) => (
            <Fragment key={step}>
              {index > 0 ? <ArrowRight className="size-4 text-fg-tertiary" /> : null}
              <span>{step}</span>
            </Fragment>
          ))}
        </span>
      </figcaption>
    </figure>
  );
}

type CapabilityArt = { area: 'image' | 'video' } | { cutout: CutoutSlug };

/** Brand area icons where a workspace already has one; Codex cutouts for reverse prompting and the swap. */
const CAPABILITY_ART: Record<CapabilityId, CapabilityArt> = {
  images: { area: 'image' },
  references: { area: 'video' },
  reverse: { cutout: CUTOUTS.reversePrompt },
  swap: { cutout: CUTOUTS.characterSwap },
};

/** Capabilities that are not verified end to end carry a status (product-analysis §8.4: swap wizard exists, no full-video run yet). */
const CAPABILITY_STATUS: Partial<Record<CapabilityId, Status>> = { swap: 'testing' };

export function CapabilityGrid({ ids, capabilities, className }: { ids: readonly CapabilityId[]; capabilities: AboutCopy['today']['capabilities']; className?: string }) {
  const display = useDisplayBreak();
  return (
    <ul className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {ids.map((id, index) => {
        const art = CAPABILITY_ART[id];
        const status = CAPABILITY_STATUS[id];
        return (
          <li key={id} className="reveal rounded-xl border border-line bg-surface p-5 shadow-edge" style={stagger(index)}>
            <div className="flex items-start justify-between gap-3">
              <span className="-m-1 grid size-24 shrink-0 place-items-center">
                {'area' in art ? <AreaArt area={art.area} size={72} /> : <Cutout slug={art.cutout} size={96} className="size-24" />}
              </span>
              {status ? <StatusChip status={status} /> : null}
            </div>
            <h3 className="mt-3 text-section font-semibold text-fg text-balance-cjk">{capabilities[id].title}</h3>
            <p className={cn('mt-1.5 text-body text-fg-secondary [text-wrap:pretty]', display)}>{capabilities[id].text}</p>
            {/* The last item of the author's image list (去背) is not in the product yet: its own line, with its own status. */}
            {id === 'images' ? (
              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-body text-fg-secondary">
                <span>{capabilities.images.coming}</span>
                <StatusChip status="coming" />
              </p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

const RENTAL_ICONS: readonly LucideIcon[] = [Upload, Power, Cog, Download, PowerOff];

/**
 * One rented-machine session, start to finish (the author's "部署、啟動、處理、匯出，結束關閉"), with the F14
 * GPU-burst art. The author's intended flow, labelled as a design goal: no packaging for rented cloud GPUs yet.
 * The figcaption is the last child (valid HTML) and is placed beside the art by the grid.
 */
export function RentalFigure({ rental }: { rental: AboutCopy['scale']['rental'] }) {
  return (
    <figure className="reveal my-10 grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-5 rounded-xl border border-line bg-surface p-5 shadow-edge sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-x-6 md:my-12 md:p-6">
      <Cutout slug={CUTOUTS.gpuBurst} size={112} className="col-start-1 row-start-1 size-20 sm:row-span-2 sm:size-28" />
      <ol className="relative col-span-2 row-start-2 grid grid-cols-5 gap-1 before:pointer-events-none before:absolute before:inset-x-[10%] before:top-[1.125rem] before:h-px before:bg-line-strong sm:col-span-1 sm:col-start-2">
        {rental.steps.map((step, index) => {
          const Icon = RENTAL_ICONS[index] ?? Cog;
          return (
            <li key={step} className="relative flex min-w-0 flex-col items-center gap-2 text-center">
              <span className="grid size-9 place-items-center rounded-full border border-line-strong bg-raised text-fg-secondary">
                <Icon aria-hidden className="size-4" />
              </span>
              <span className="text-caption font-medium whitespace-nowrap text-fg-secondary">{step}</span>
            </li>
          );
        })}
      </ol>
      <figcaption className="col-start-2 row-start-1 flex flex-wrap items-center gap-x-3 gap-y-2 text-data font-semibold text-fg">
        <span className="min-w-0">{rental.caption}</span>
        <StatusChip status="designGoal" className="sm:ml-auto" />
      </figcaption>
    </figure>
  );
}
