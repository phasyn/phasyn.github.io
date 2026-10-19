import type { Copy } from '../../i18n/locale.tsx';

export const TOUR_META: Copy<{ title: string; description: string }> = {
  'zh-hant': {
    title: '操作導覽 — Phasyn Studio',
    description: '操作導覽：文字生圖、圖片轉影片、參考素材與 Prompt Advisor、時間軸剪輯、圖片反推、元件調整與效能紀錄，全部是實際操作錄影。',
  },
  ja: {
    title: '操作ガイド — Phasyn Studio',
    description: '実際の操作を収録した操作ガイドです。テキストから画像、画像から動画、参照素材と Prompt Advisor、タイムライン編集、プロンプト逆引き、コンポーネントの調整、性能の記録まで。',
  },
  en: {
    title: 'Tour — Phasyn Studio',
    description: 'Five chapters of the real app: text to image to video, Prompt Advisor, timeline editing, image to prompt and measured records of every run.',
  },
};
