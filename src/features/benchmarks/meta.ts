import type { Copy } from '../../i18n/locale.tsx';

export const BENCHMARKS_META: Copy<{ title: string; description: string }> = {
  'zh-hant': {
    title: '數據分析 — Phasyn Studio',
    description: '在作者機器上實測的 H3 生成速度與顯存：每一步跑在哪張卡、哪種精度與加速方案最划算，附畫質比較與失敗紀錄。',
  },
  ja: {
    title: 'ベンチマーク — Phasyn Studio',
    description: '作者のマシンで実測した H3 の生成速度と VRAM。各ステップをどの GPU で動かしたか、どの精度と高速化が効くかを、画質比較と失敗記録とあわせて公開します。',
  },
  en: {
    title: 'Benchmarks — Phasyn Studio',
    description: 'Measured H3 generation speed and VRAM on the author’s machines: which GPU ran each step, which precision and acceleration pay off, with quality comparisons and failures included.',
  },
};
