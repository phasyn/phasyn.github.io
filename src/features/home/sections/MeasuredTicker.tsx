import { DataTicker, type TickerItem } from '../../../components/fx/index.ts';
import { useCopy } from '../../../i18n/locale.tsx';
import { HOME } from '../copy.ts';
import { BENCH, COUNTS, DEMO_RUN, FILEREF } from '../data.ts';

const DEVICE: Record<string, TickerItem['device']> = {
  'DGX Spark · GB10': 'gb10',
  'RTX 5080': 'rtx5080',
  'RTX 3060': 'rtx3060',
  CPU: 'cpu',
};

/** HUD band of real measured values (data.ts), each step with its device dot (GB10, RTX 5080, RTX 3060, CPU). */
export function MeasuredTicker() {
  const t = useCopy(HOME).ticker;
  const step = (id: string) => DEMO_RUN.steps.find((s) => s.id === id)!;
  const stepItem = (id: 'te' | 'dit' | 'video' | 'audio' | 'mux'): TickerItem => {
    const s = step(id);
    const device = DEVICE[s.device];
    return { label: t.items[id], value: `${s.seconds} s`, ...(device ? { device } : {}) };
  };
  const items: TickerItem[] = [
    stepItem('te'),
    stepItem('dit'),
    stepItem('video'),
    stepItem('audio'),
    stepItem('mux'),
    { label: t.items.render, value: `${BENCH.renderSeconds} s` },
    { label: t.items.fastest, value: `${BENCH.fastestT2vaDitSeconds.toFixed(1)} s`, device: 'rtx5080' },
    { label: t.items.still, value: '≈ 27 s', device: 'rtx5080' },
    { label: t.items.fileRef, value: `${FILEREF.sizeKB} KB · ${FILEREF.millis} ms` },
    { label: t.items.metrics, value: String(COUNTS.recorderMetrics) },
    { label: t.items.engines, value: `${BENCH.ditEnginesOk}/${BENCH.ditEngines}`, device: 'rtx5080' },
  ];
  return <DataTicker label={t.label} items={items} duration={56} className="relative z-10" />;
}
