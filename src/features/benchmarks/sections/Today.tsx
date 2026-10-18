import { HudFrame } from '../../../components/fx/index.ts';
import { FilmPlayer } from '../../../components/media/FilmPlayer.tsx';
import { AiBadge } from '../../../components/ui/AiBadge.tsx';
import { useLocale } from '../../../i18n/locale.tsx';
import { useBenchCopy } from '../copy.ts';
import { img, todayClip, todayStill } from '../data/media.ts';
import { todayRows } from '../data/select.ts';
import type { SpeedRow } from '../data/types.ts';
import { MiniTimeline } from '../charts/Timeline.tsx';
import { isDevice } from '../lib/devices.ts';
import { fmtSeconds } from '../lib/format.ts';
import { DeviceDot } from '../ui/DeviceChip.tsx';
import { Section } from '../ui/Section.tsx';

function ClipCard({ row }: { row: SpeedRow }) {
  const copy = useBenchCopy();
  const locale = useLocale();
  if (!row.scene || (row.pipeline !== 'fl2va' && row.pipeline !== 'ref2va')) return null;
  const clip = todayClip(row.pipeline, row.scene);
  const scene = copy.scenes[row.scene];
  const captionId = `today-sound-${row.id}`;
  return (
    <article className="panel grid min-w-0 content-start gap-4 p-3 sm:p-4">
      {/* The HUD tag is upper-cased by the kit, so it carries the date; the lowercase run ID is in the line below. */}
      <HudFrame label={`MEASURED · ${row.date}`}>
        <FilmPlayer src={clip.video} poster={clip.poster} title={copy.today.clipAria(scene)} aspect="768 / 448" badge="h3" className="rounded-xl shadow-none" />
      </HudFrame>
      <div className="grid gap-3 px-1 pb-1">
        <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <h3 className="text-section font-semibold text-fg">{scene}</h3>
          <span className="flex items-baseline gap-1.5">
            <span className="machine text-title font-semibold text-fg">{row.total != null ? fmtSeconds(locale, row.total) : '—'}</span>
            <span className="text-caption text-fg-tertiary">{copy.today.total}</span>
          </span>
        </header>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-fg-tertiary">
          <code className="machine rounded bg-sunken px-1.5 py-0.5 text-[12px] text-fg">{row.pipeline}</code>
          {row.runId ? <code className="machine text-[12px] text-fg-secondary">run {row.runId}</code> : null}
          <code className="machine text-[12px]">{row.component}</code>
          <span className="machine text-[12px]">
            {copy.common.seed} {row.seed}
          </span>
        </p>
        <MiniTimeline steps={row.steps} total={row.total} />
        <ul aria-label={copy.today.stepsBreak} className="grid gap-y-1 text-caption">
          {row.steps.map((step) => (
            <li key={step.kind} className="flex min-w-0 items-baseline justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5 text-fg-secondary">
                {isDevice(step.placement) ? <DeviceDot device={step.placement} /> : null}
                <span className="truncate">{copy.steps[step.kind]}</span>
                {isDevice(step.placement) ? <span className="sr-only">· {copy.machines[step.placement]}</span> : null}
              </span>
              <span className="machine shrink-0 text-fg">{step.seconds != null ? fmtSeconds(locale, step.seconds) : '—'}</span>
            </li>
          ))}
        </ul>
        <p id={captionId} className="text-caption text-pretty text-fg-tertiary">
          {copy.common.soundPrefix}
          {copy.sounds[row.scene]}
        </p>
      </div>
    </article>
  );
}

export function TodaySection() {
  const copy = useBenchCopy();
  const locale = useLocale();
  const clips = [...todayRows('fl2va'), ...todayRows('ref2va')];
  const stills = todayRows('t2i');
  return (
    <Section id="today" eyebrow={copy.today.eyebrow} title={copy.today.title} lead={copy.today.lead} wide>
      <p className="-mt-6 inline-flex flex-wrap items-center gap-2 text-caption text-fg-secondary">
        <span className="rounded-full border border-brand-cyan/40 bg-brand-soft px-2.5 py-0.5 font-medium text-fg">{copy.common.measuredToday}</span>
        <span>{copy.common.singleRun}</span>
        <span>{copy.common.loudness}</span>
      </p>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {clips.map((row) => (
          <ClipCard key={row.id} row={row} />
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <figure className="panel grid content-start gap-3 p-4">
          <AiBadge variant="qwen" className="justify-self-start" />
          <img src={img('today-courier-ref.webp')} alt={copy.today.refTitle} width={384} height={512} loading="lazy" decoding="async" className="mx-auto aspect-[3/4] w-full max-w-60 rounded-lg bg-[#fff] object-contain" />
          <figcaption className="grid gap-1">
            <span className="text-data font-semibold text-fg">{copy.today.refTitle}</span>
            <span className="text-caption text-pretty text-fg-secondary">{copy.today.refBody}</span>
          </figcaption>
        </figure>
        <div className="panel grid content-start gap-4 p-4 sm:p-5">
          <div className="grid gap-1">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
              <h3 className="text-section font-semibold text-fg">{copy.today.stillsTitle}</h3>
              <AiBadge variant="qwen" />
            </div>
            <p className="text-caption text-pretty text-fg-secondary">{copy.today.stillsBody}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {stills.map((row) =>
              row.scene ? (
                <li key={row.id} className="grid content-start gap-1.5">
                  <img src={todayStill(row.scene)} alt={copy.scenes[row.scene]} width={768} height={448} loading="lazy" decoding="async" className="aspect-[1152/672] w-full rounded-md border border-line-subtle bg-stage object-cover" />
                  <span className="flex items-baseline justify-between gap-2 text-caption">
                    <span className="truncate text-fg-secondary">{copy.scenes[row.scene]}</span>
                    <span className="machine text-fg">{row.total != null ? fmtSeconds(locale, row.total) : '—'}</span>
                  </span>
                  <span className="machine text-[12px] text-fg-tertiary">run {row.runId}</span>
                </li>
              ) : null,
            )}
          </ul>
        </div>
      </div>
    </Section>
  );
}
