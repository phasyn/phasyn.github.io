import { cn } from '../../lib/cn.ts';
import { CUTOUTS, Cutout, type CutoutSlug } from './art.tsx';
import { ROADMAP_IDS, type AboutCopy, type RoadmapId } from './copy.ts';
import { useBodyClass, useDisplayBreak } from './parts.tsx';
import { StatusChip } from './status.tsx';

type RoadmapStatus = 'inDevelopment' | 'planned';

/*
 * Status follows the author's own wording (never shown as shipped):
 *  - tts       「我這邊也開發了一套 TTS 系統」 → in development (lead's call)
 *  - upscale   「一樣在整合中」 → in development
 *  - multipass 「我目前正在開發」 → in development
 *  - sliders   describes intended controls only → planned
 *  - models    「未來…能接入」 → planned
 *  - optimize  「還有幾個實驗沒處理」 (pending, not described as under way) → planned
 */
const ROADMAP_META: Record<RoadmapId, { status: RoadmapStatus; art: CutoutSlug }> = {
  tts: { status: 'inDevelopment', art: CUTOUTS.voice },
  upscale: { status: 'inDevelopment', art: CUTOUTS.upscaleInterpolate },
  multipass: { status: 'inDevelopment', art: CUTOUTS.multilevelRender },
  sliders: { status: 'planned', art: CUTOUTS.fineControl },
  models: { status: 'planned', art: CUTOUTS.extensibility },
  optimize: { status: 'planned', art: CUTOUTS.vaeDit },
};

/**
 * Vertical timeline. Each item: a dot on the line (brand-blue ring while in development), the numbered title with
 * its status chip (icon + text), a one-line plain explanation, and the item's Codex illustration (beside the text
 * from sm up, above it on phones).
 */
export function Roadmap({ roadmap }: { roadmap: AboutCopy['roadmap'] }) {
  const body = useBodyClass();
  return (
    <ol className="relative mt-10 grid gap-12 before:absolute before:top-3 before:bottom-3 before:left-[0.4375rem] before:w-px before:bg-line md:mt-12">
      {ROADMAP_IDS.map((id, index) => {
        const { status, art } = ROADMAP_META[id];
        const item = roadmap.items[id];
        return (
          <li key={id} className="reveal relative grid grid-cols-[0.875rem_minmax(0,1fr)] gap-x-5 sm:gap-x-6">
            <span
              aria-hidden
              className={cn(
                'relative mt-1.5 size-3.5 rounded-full border-2 bg-canvas',
                status === 'inDevelopment' ? 'border-action-fg' : 'border-line-strong',
              )}
            />
            <div className="grid min-w-0 content-start sm:grid-cols-[minmax(0,1fr)_7.5rem] sm:gap-x-8">
              <Cutout slug={art} size={120} className="mb-3 size-24 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mb-0 sm:size-30" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 sm:col-start-1 sm:row-start-1">
                {/* The number sits inside the heading so a long title wraps with it instead of leaving it alone. */}
                <h3 className="text-section font-semibold text-fg text-balance-cjk">
                  <span aria-hidden lang="en" className="machine mr-3 text-caption font-normal whitespace-nowrap text-fg-tertiary">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.title}
                </h3>
                <StatusChip status={status} />
              </div>
              <p className={cn('mt-2 text-fg-secondary [text-wrap:pretty] sm:col-start-1 sm:row-start-2', body)}>{item.text}</p>
              {id === 'multipass' ? <RenderPasses passes={roadmap.passes} /> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The three render levels: a fast skeleton pass, a pass that adds characters, then the expensive final pass.
 * The small meter shows how much of the final detail each pass carries (1/3, 2/3, all).
 */
function RenderPasses({ passes }: { passes: AboutCopy['roadmap']['passes'] }) {
  const display = useDisplayBreak();
  return (
    <ol className="mt-5 grid gap-3 sm:col-span-2 sm:grid-cols-3">
      {passes.map((pass, index) => (
        <li key={pass.label} className="rounded-lg border border-line bg-surface p-4">
          <span aria-hidden className="flex gap-1">
            {[0, 1, 2].map((segment) => (
              <span key={segment} className={cn('h-1 flex-1 rounded-full', segment <= index ? 'bg-action-fg' : 'bg-line')} />
            ))}
          </span>
          <p className="mt-3 text-caption font-medium text-fg-tertiary">{pass.label}</p>
          <h4 className="mt-0.5 text-data font-semibold text-fg">{pass.title}</h4>
          <p className={cn('mt-1.5 text-data text-fg-secondary [text-wrap:pretty]', display)}>{pass.text}</p>
        </li>
      ))}
    </ol>
  );
}
