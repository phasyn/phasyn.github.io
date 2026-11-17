import type { Copy } from '../../i18n/locale.tsx';

export interface ShowcaseCopy {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    /** Under the stage while no work is published yet. */
    pending: string;
    jump: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    lead: string;
    filterLabel: string;
    all: string;
    landscape: string;
    portrait: string;
    empty: string;
  };
  notes: { title: string; items: readonly string[] };
  closing: { title: string; lead: string; tour: string };
}

export const SHOWCASE: Copy<ShowcaseCopy> = {
  'zh-hant': {
    hero: {
      eyebrow: 'SHOWCASE',
      title: '成品展示',
      lead: '同樣三個角色，走進不同遊戲的畫風：方塊、像素、寫實、黏土、霓虹……每一支都是一鏡到底、大約 9 秒，聲音跟畫面一起生成，在我自己的機器上用 Phasyn Studio 做出來，再升頻到 2560×1472。',
      pending: '第一批作品還在渲染，渲染完、檢查過就會放上來。',
      jump: '看全部作品',
    },
    gallery: {
      eyebrow: 'WORKS',
      title: '全部作品',
      lead: '按一下就會播放，有聲音，一次只播一支。大螢幕播 2560 寬的版本，手機播 1280 寬的版本。',
      filterLabel: '依類型篩選',
      all: '全部',
      landscape: '橫式',
      portrait: '直式',
      empty: '這個類型的作品還在渲染。',
    },
    notes: {
      title: '關於這些作品',
      items: [
        '全部在我自己的機器上用 Phasyn Studio 生成：MiniMax H3、8 步定稿，1280×736（直式是 736×1280），24 fps。',
        '每一支都是一次生成、一鏡到底，中間沒有剪接。',
        '聲音是跟畫面同一次生成出來的，不是後製配上去的。網頁版只把音量調到一致（−16 LUFS）。',
        '2× 升頻用的是 Anime4K（MIT 授權）的 Restore CNN Soft VL 加 Upscale CNN x2 VL，是重新取樣式的放大，不是用 AI 把畫面重畫一次。',
        '只放通過檢查的作品：幀數要對得上，畫面不能崩。',
      ],
    },
    closing: {
      title: '想看它是怎麼做出來的？',
      lead: '操作導覽會帶你看 Phasyn Studio 的介面，從寫 Prompt 到剪成片。',
      tour: '看操作導覽',
    },
  },
  ja: {
    hero: {
      eyebrow: 'SHOWCASE',
      title: '作例',
      lead: '同じ 3 人のキャラクターが、いろいろなゲームの絵柄の世界に入ります。ボクセル、ピクセル、リアル、粘土、ネオン……。どれもワンカットで約 9 秒、音も映像と一緒に生成しています。自分のマシンで Phasyn Studio を使って作り、2560×1472 にアップスケールしました。',
      pending: '最初の作品はまだレンダリング中です。レンダリングとチェックが終わったら公開します。',
      jump: 'すべての作品を見る',
    },
    gallery: {
      eyebrow: 'WORKS',
      title: 'すべての作品',
      lead: 'クリックすると音付きで再生します（一度に 1 本だけ）。大きな画面では 2560 幅、スマートフォンでは 1280 幅の版を再生します。',
      filterLabel: 'ジャンルで絞り込む',
      all: 'すべて',
      landscape: '横長',
      portrait: '縦型',
      empty: 'このジャンルの作品はまだレンダリング中です。',
    },
    notes: {
      title: 'これらの作品について',
      items: [
        'すべて自分のマシンで Phasyn Studio を使って生成しました。MiniMax H3、8 ステップの本番設定、1280×736（縦型は 736×1280）、24 fps です。',
        'どれも 1 回の生成によるワンカットで、途中に編集はありません。',
        '音は映像と同じ 1 回の生成で作られたもので、後から付けたものではありません。Web 版は音量をそろえただけです（−16 LUFS）。',
        '2× アップスケールには Anime4K（MIT ライセンス）の Restore CNN Soft VL と Upscale CNN x2 VL を使っています。再サンプリングによる拡大で、AI で絵を描き直すものではありません。',
        'チェックを通った作品だけを載せています。フレーム数が一致し、絵が崩れていないものです。',
      ],
    },
    closing: {
      title: 'どうやって作ったか見てみませんか？',
      lead: '操作ガイドでは、Prompt を書くところから映像に仕上げるまで、Phasyn Studio の画面を順に紹介しています。',
      tour: '操作ガイドを見る',
    },
  },
  en: {
    hero: {
      eyebrow: 'SHOWCASE',
      title: 'Showcase',
      lead: 'The same three characters step into the looks of different games: voxel, pixel, realistic, clay, neon and more. Every piece is a single continuous take of about 9 seconds, with the sound generated together with the picture. I made them with Phasyn Studio on my own machines, then upscaled them to 2560×1472.',
      pending: 'The first works are still rendering. They go up here once they finish and pass review.',
      jump: 'See all works',
    },
    gallery: {
      eyebrow: 'WORKS',
      title: 'All Works',
      lead: 'Click to play with sound, one at a time. Large screens get the 2560-wide version; phones get the 1280-wide one.',
      filterLabel: 'Filter by genre',
      all: 'All',
      landscape: 'Landscape',
      portrait: 'Vertical',
      empty: 'Works in this genre are still rendering.',
    },
    notes: {
      title: 'About These Works',
      items: [
        'All generated with Phasyn Studio on my own machines: MiniMax H3, the 8-step final route, 1280×736 (736×1280 for vertical pieces), 24 fps.',
        'Each piece is one generation and one continuous take, with no cuts.',
        'The sound comes from the same generation as the picture; it isn’t added afterwards. The web copies only have their loudness evened out (−16 LUFS).',
        'The 2× upscale uses Anime4K (MIT licence), Restore CNN Soft VL plus Upscale CNN x2 VL. It is resampling-based enlargement, not AI repainting the picture.',
        'Only works that pass review are shown: the frame count has to match and the picture can’t fall apart.',
      ],
    },
    closing: {
      title: 'Want to See How It’s Made?',
      lead: 'The Tour walks through the Phasyn Studio interface, from writing a prompt to cutting a film.',
      tour: 'Take the Tour',
    },
  },
};
