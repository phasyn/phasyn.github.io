import { Activity, Bot, CircleCheck, CircleSlash, Gauge, ListChecks } from 'lucide-react';
import { HudFrame } from '../../../components/fx/index.ts';
import { AppWindow, IllustrativeBadge, MockChip, RecorderBars, Terminal, useMockPlayback, type RecorderBarRow } from '../../../components/mock/index.ts';
import { useCopy } from '../../../i18n/locale.tsx';
import { ArtImage } from '../components/ArtImage.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME, MOCK_UI } from '../copy.ts';
import { DEMO_RUN, DIT_METRICS } from '../data.ts';

const seconds = (value: number) => `${value.toFixed(value < 10 ? 2 : 1)} s`;

function RecorderPanel({ caption, headers }: { caption: string; headers: { label: string; value: string } }) {
  const play = useMockPlayback<HTMLDivElement>({ threshold: 0.4 });
  const rows: RecorderBarRow[] = DEMO_RUN.steps.map((step) => ({
    id: step.id,
    label: step.id,
    detail: `${step.component} · ${step.device}`,
    value: step.seconds,
    display: seconds(step.seconds),
    emphasis: step.id === 'dit',
  }));
  const dit = DEMO_RUN.steps.find((step) => step.id === 'dit')!;
  const share = Math.round((dit.seconds / DEMO_RUN.totalSeconds) * 100);
  const metrics: { label: string; value: string }[] = [
    { label: MOCK_UI.vramReserved, value: `${DIT_METRICS.torchReservedPeakGiB} GiB` },
    { label: MOCK_UI.nvmlPeak, value: `${DIT_METRICS.nvmlPeakGiB} GiB` },
    { label: MOCK_UI.weightsH2D, value: `${DIT_METRICS.weightsH2DGB.toFixed(1)} GB` },
    { label: MOCK_UI.blockLoads, value: String(DIT_METRICS.blockLoads) },
  ];
  return (
    <HudFrame label="RECORDER · 102 METRICS" scan>
      <div ref={play.ref}>
      <AppWindow title={MOCK_UI.records}>
        <div className="grid gap-5 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-data font-semibold text-fg">{MOCK_UI.runTitle}</span>
            <MockChip tone="success" icon={<CircleCheck aria-hidden />}>
              {MOCK_UI.succeeded}
            </MockChip>
            <span className="machine text-[11px] text-fg-tertiary">
              {DEMO_RUN.task} · {DEMO_RUN.frames} frames · {DEMO_RUN.size}
            </span>
            <span className="machine ml-auto text-data text-fg">
              {MOCK_UI.total} {DEMO_RUN.totalSeconds} s
            </span>
          </div>

          <div className="grid gap-2">
            <span className="text-[11px] font-semibold tracking-wide text-fg-tertiary">{MOCK_UI.stages}</span>
            <p className="machine rounded-md border border-line-subtle bg-sunken px-3 py-2 text-data text-fg">
              Most time is in “dit”: {seconds(dit.seconds)} ({share}%)
            </p>
            <RecorderBars rows={rows} max={DEMO_RUN.totalSeconds} caption={caption} headers={headers} armed={play.armed} shown={play.seen} />
          </div>

          <div className="grid gap-2 border-t border-line-subtle pt-4">
            <span className="text-[11px] font-semibold tracking-wide text-fg-tertiary">
              {MOCK_UI.measuredMetrics} · <span className="machine">dit</span>
            </span>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="grid gap-0.5 rounded-lg border border-line-subtle bg-surface px-3 py-2">
                  <dt className="truncate text-[11px] text-fg-tertiary" title={metric.label}>
                    {metric.label}
                  </dt>
                  <dd className="machine text-data text-fg">{metric.value}</dd>
                </div>
              ))}
              <div className="grid gap-0.5 rounded-lg border border-dashed border-line-strong px-3 py-2">
                <dt className="machine truncate text-[11px] text-fg-tertiary">gpu_kernel_union_ms</dt>
                <dd className="flex flex-wrap items-center gap-1.5 text-data text-fg-secondary">
                  <CircleSlash className="size-3.5 text-fg-tertiary" aria-hidden />
                  {MOCK_UI.notMeasured}
                  <span className="text-[11px] text-fg-tertiary">({MOCK_UI.traceOff})</span>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </AppWindow>
      </div>
    </HudFrame>
  );
}

function AgentTerminal({ lines, label }: { lines: HomeTerminalLines; label: string }) {
  const play = useMockPlayback<HTMLDivElement>({ threshold: 0.45 });
  return (
    <HudFrame label="AGENT · PHASYNCTL" orbit>
      <div ref={play.ref} role="group" aria-label={label}>
        <Terminal lines={lines} title={MOCK_UI.terminalTitle} run={play.seen} armed={play.armed} badge={<IllustrativeBadge />} className="min-h-[21rem]" />
      </div>
    </HudFrame>
  );
}

type HomeTerminalLines = ReturnType<typeof useDiagnosticsCopy>['terminal'];

function useDiagnosticsCopy() {
  return useCopy(HOME).diagnostics;
}

/** "Find the slow step — or let your agent find it": real recorder numbers in an illustrative panel, and the agent skill. */
export function DiagnosticsSection() {
  const t = useDiagnosticsCopy();
  const factIcons = [Gauge, CircleSlash, ListChecks];
  return (
    <section aria-labelledby="diagnostics-title" className="site-section relative">
      <div className="site-container">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <SectionHeading id="diagnostics-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <ArtImage art="diagnostics" size={168} fallback={Activity} className="reveal hidden lg:block" />
        </div>
        <ul className="reveal mt-10 grid gap-3 md:grid-cols-3">
          {t.facts.map((fact, index) => {
            const Icon = factIcons[index] ?? Gauge;
            return (
              <li key={fact} className="flex items-start gap-3 rounded-2xl border border-line-subtle bg-surface px-4 py-3.5 text-body text-fg-secondary">
                <Icon className="mt-0.5 size-4 shrink-0 text-action-fg" aria-hidden />
                {fact}
              </li>
            );
          })}
        </ul>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-12">
          <figure className="reveal grid gap-3">
            <RecorderPanel caption={t.tableCaption} headers={t.tableHeaders} />
            <figcaption className="text-caption leading-relaxed text-fg-tertiary">{t.recorderCaption}</figcaption>
          </figure>
          <div className="reveal grid content-start gap-5">
            <div className="flex items-center gap-4">
              <ArtImage art="agent" size={88} fallback={Bot} className="-ml-2" />
              <h3 className="text-headline tracking-display text-balance-cjk text-fg">{t.agentTitle}</h3>
            </div>
            <p className="text-reading text-fg-secondary">{t.agentBody}</p>
            <AgentTerminal lines={t.terminal} label={t.terminalLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
