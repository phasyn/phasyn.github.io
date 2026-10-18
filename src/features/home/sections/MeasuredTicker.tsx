import { DataTicker, type TickerItem } from '../../../components/fx/index.ts';
import { useCopy } from '../../../i18n/locale.tsx';
import { HOME } from '../copy.ts';
import { BENCH, COUNTS, FILEREF, RUN, type StepId } from '../data.ts';

const DEVICE: Record<string, TickerItem['device']> = {
  'DGX Spark · GB10': 'gb10',
  'RTX 5080': 'rtx5080',
  'RTX 3060': 'rtx3060',
  CPU: 'cpu',
};

const seconds = (value: number) => `${value.toFixed(1)} s`;

/**
 * HUD band of real measured values (data.ts). Every step time comes from one run (RUN, the run the real Records capture shows),
 * each with its device dot (GB10, RTX 5080, RTX 3060, CPU); the other items are separate, labelled facts.
 */
export function MeasuredTicker() {
  const t = useCopy(HOME).ticker;
  const stepItem = (id: StepId): TickerItem => {
    const step = RUN.steps.find((s) => s.id === id)!;
    const device = DEVICE[step.device];
    return { label: t.items[id], value: seconds(step.seconds), ...(device ? { device } : {}) };
  };
  const items: TickerItem[] = [
    stepItem('te'),
    stepItem('venc'),
    stepItem('dit'),
    stepItem('video'),
    stepItem('audio'),
    stepItem('mux'),
    { label: t.items.render, value: seconds(RUN.totalSeconds) },
    { label: t.items.fastest, value: seconds(BENCH.fastestT2vaDitSeconds), device: 'rtx5080' },
    { label: t.items.still, value: '≈ 27 s', device: 'rtx5080' },
    { label: t.items.fileRef, value: `${FILEREF.sizeKB} KB · ${FILEREF.millis} ms` },
    { label: t.items.metrics, value: String(COUNTS.recorderMetrics) },
    { label: t.items.engines, value: `${BENCH.ditEnginesOk}/${BENCH.ditEngines}`, device: 'rtx5080' },
  ];
  return <DataTicker label={t.label} items={items} duration={60} className="relative z-10" />;
}
