import type { Copy } from '../../i18n/locale.tsx';

export const BENCHMARKS_META: Copy<{ title: string; description: string }> = {
  'zh-hant': {
    title: '實測數據 — Phasyn Studio',
    description: '在作者機器上實測的 H3 生成速度與 VRAM 用量：每一步在哪張卡上執行、哪種精度與加速方式最划算，並附畫質比較與失敗紀錄。',
  },
  ja: {
    title: 'ベンチマーク — Phasyn Studio',
    description: '作者のマシンで実測した H3 の生成速度と VRAM。各ステップをどの GPU で動かしたか、どの精度と高速化が効くかを、画質の比較や失敗の記録とあわせて公開します。',
  },
  en: {
    title: 'Benchmarks — Phasyn Studio',
    description: 'Measured MiniMax H3 and Qwen-Image 2.1 speed and VRAM on an RTX 5080, an RTX 3060 and a DGX Spark — every step’s device named, failures included.',
  },
};
