import type { Copy } from '../../i18n/locale.tsx';

export const HOME_META: Copy<{ title: string; description: string }> = {
  'zh-hant': {
    title: 'Phasyn Studio — 從分鏡，到成片',
    description: 'Phasyn Studio 是一個人開發的 AI 影片工作台：從文字、圖片到影片，整條流程都能掌控；元件拆開、跨機器協作，每一步都留下效能紀錄。',
  },
  ja: {
    title: 'Phasyn Studio — 絵コンテから、完成映像まで',
    description: 'Phasyn Studio は、ひとりで開発している AI 映像制作ワークベンチです。テキスト・画像・動画をひとつのパイプラインでつなぎ、複数のマシンで分散処理しながら、各ステップの性能を記録します。',
  },
  en: {
    title: 'Phasyn Studio — From storyboard to synthesis',
    description: 'Phasyn Studio is an AI filmmaking workbench built by one developer: prompt to image to video with sound, on your own GPUs, with every step measured.',
  },
};
