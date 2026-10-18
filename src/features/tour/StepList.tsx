import { Info, Play, TriangleAlert } from 'lucide-react';
import { Fragment } from 'react';
import { CountUp } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import { useHydrated } from '../../lib/hooks.ts';
import { clock, type ChapterSpec, type Measure } from './chapters.ts';
import type { ChapterCopy, TourCopy } from './copy.ts';
import { RichText } from './RichText.tsx';
import { DEVICE_DOT, DEVICE_LABEL } from './runs.ts';

interface StepListProps {
  spec: ChapterSpec;
  copy: ChapterCopy;
  t: TourCopy['chapter'];
  /** Start of each step in the video, when the subtitles are available. */
  times: readonly (number | null)[] | null;
  /** Index of the step the video is playing, if it plays. */
  current: number | null;
  onSeek: (seconds: number) => void;
}

function MeasureValue({ measure }: { measure: Measure }) {
  return (
    <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
      <span className="machine text-data font-semibold text-fg">
        {measure.approx ? '≈\u202f' : null}
        {measure.values.map((item, index) => (
          <Fragment key={index}>
            {index > 0 ? '–' : null}
            <CountUp value={item.value} decimals={item.decimals} />
          </Fragment>
        ))}
      </span>
      {measure.unit ? <span className="text-data font-medium text-fg-secondary">{measure.unit}</span> : null}
    </span>
  );
}

/**
 * "What you'll see": the chapter's steps in subtitle order, each with its machines and, where measured, a counted-up time and
 * what it measures. With the subtitles in place each step gets a timestamp that seeks the player, and the step being played is
 * marked. Everything reads complete without JavaScript (timestamps are added after hydration).
 */
export function StepList({ spec, copy, t, times, current, onSeek }: StepListProps) {
  const hydrated = useHydrated();
  const measured = spec.steps.some((step) => step.badge?.measure);
  return (
    <div className="grid content-start gap-4">
      <h3 className="flex items-center gap-2 text-caption font-semibold text-fg-tertiary">
        <span aria-hidden className="size-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgb(73_207_255)]" />
        {t.whatYoullSee}
      </h3>
      <ol className="grid gap-2">
        {spec.steps.map((step, index) => {
          const text = copy.steps[index];
          if (!text) return null;
          const time = hydrated ? (times?.[index] ?? null) : null;
          const playing = current === index;
          const badge = step.badge;
          return (
            <li
              key={step.anchor}
              className={cn(
                'tour-step grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 rounded-2xl border px-4 py-3.5',
                playing ? 'border-action/45 bg-brand-gradient-soft' : 'border-line-subtle bg-[rgb(11_17_32_/_0.72)]',
              )}
            >
              <span aria-hidden lang="en" className={cn('machine pt-0.5 text-[11px]', playing ? 'text-brand-cyan' : 'text-fg-tertiary')}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="grid min-w-0 gap-2.5">
                <p className="text-body text-fg [text-wrap:pretty]">
                  {playing ? <span className="sr-only">{t.nowPlaying}: </span> : null}
                  <RichText text={text.text} />
                </p>
                {badge || time !== null ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    {badge?.devices?.map((device) => (
                      <span key={device} lang="en" className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line bg-sunken/80 px-2 text-[11px] font-medium text-fg-secondary">
                        <span aria-hidden className={cn('size-1.5 rounded-full', DEVICE_DOT[device])} />
                        {DEVICE_LABEL[device]}
                      </span>
                    ))}
                    {badge?.measure ? (
                      <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
                        <MeasureValue measure={badge.measure} />
                        {text.measure ? <span className="text-caption text-fg-tertiary">{text.measure}</span> : null}
                      </span>
                    ) : null}
                    {time !== null ? (
                      <button
                        type="button"
                        data-t={Math.round(time * 10) / 10}
                        onClick={() => onSeek(time)}
                        aria-label={t.playFrom(clock(time))}
                        className="pressable ml-auto inline-flex h-7 items-center gap-1.5 rounded-full border border-line-strong bg-raised px-2.5 text-[11px] font-medium text-fg-secondary hover:border-action/60 hover:text-fg"
                      >
                        <Play className="size-3 fill-current" aria-hidden />
                        <span className="machine">{clock(time)}</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
      {measured ? <p className="text-caption text-fg-tertiary [text-wrap:pretty]">{t.timesNote}</p> : null}
      {copy.note ? (
        <p
          className={cn(
            'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-data [text-wrap:pretty]',
            copy.note.tone === 'warning' ? 'border-warning/30 bg-warning/8 text-fg-secondary' : 'border-line-subtle bg-sunken/70 text-fg-secondary',
          )}
        >
          {copy.note.tone === 'warning' ? (
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
          )}
          <span>
            <RichText text={copy.note.text} />
          </span>
        </p>
      ) : null}
    </div>
  );
}
