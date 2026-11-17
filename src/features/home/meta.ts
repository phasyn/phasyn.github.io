import type { Copy } from '../../i18n/locale.tsx';

export const HOME_META: Copy<{ title: string; description: string }> = {
  'zh-hant': {
    title: 'Phasyn Studio — 用自己的顯示卡，做出有聲音的動畫',
    description:
      'Phasyn Studio 是開源、免費的動畫工作室：用文字描述鏡頭，畫面和聲音一次生成；一次出 8 個版本挑最好的，再在像 Premiere 的時間軸剪成片。全部在你自己的 Linux 和 NVIDIA 顯示卡上進行。',
  },
  ja: {
    title: 'Phasyn Studio — 自分の GPU で、音のあるアニメを',
    description:
      'Phasyn Studio はオープンソースで無料のアニメ制作スタジオです。言葉でカットを描くと映像と音が一度に生成され、8 つのバリエーションからいちばんを選んで、Premiere のようなタイムラインで 1 本に仕上げます。すべて自分の Linux と NVIDIA の GPU で動きます。',
  },
  en: {
    title: 'Phasyn Studio — Animation with sound, made on your own GPU',
    description:
      'Phasyn Studio is a free, open-source animation studio. Describe a shot and get picture and sound together, render eight versions and keep the best, then cut the film on a Premiere-style timeline. Everything runs on your own Linux machine and NVIDIA GPU.',
  },
};
