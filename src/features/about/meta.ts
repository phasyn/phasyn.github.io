import type { Copy } from '../../i18n/locale.tsx';

export const ABOUT_META: Copy<{ title: string; description: string }> = {
  'zh-hant': {
    title: '關於 — Phasyn Studio',
    description: '為什麼要自己做一套 AI 影片系統：受夠了又貴又難用的點數制產品，把工程優化、分散式元件與可量測的流程放在第一位。',
  },
  ja: {
    title: 'このプロジェクトについて — Phasyn Studio',
    description: 'なぜ自分で AI 映像システムを作るのか。高くて使いにくいクレジット制サービスへの不満から、エンジニアリングの最適化、分散コンポーネント、計測できるワークフローを優先しています。',
  },
  en: {
    title: 'About — Phasyn Studio',
    description: 'Why build an AI video system from scratch: fed up with expensive credit-based tools, Phasyn Studio puts engineering, distributed components and measurable pipelines first.',
  },
};
