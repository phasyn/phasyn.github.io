import type { Copy } from '../../i18n/locale.tsx';

/*
 * Home copy, written zh-hant first: keynote-short headlines (≤ 12 characters in zh-hant), one plain sentence under each in
 * the owner's voice, then ja (です・ます) and en (Apple-style title case on buttons). Only what docs/studio facts support;
 * no model or engine jargon on this page. U+00A0 keeps a name or a number with its unit on one line.
 */

export interface SceneCopy {
  title: string;
  lead: string;
}

export interface HomeCopy {
  hero: {
    title: string;
    lead: string;
    works: string;
    github: string;
    /** Under a backdrop that is generated media. */
    madeWith: string;
    captureAlt: string;
  };
  /** Accessible name of a scene's step switcher. */
  stepsLabel: string;
  prompt: SceneCopy & { alt: string; steps: readonly [string, string]; workLabel: string };
  reference: SceneCopy & { stillAlt: string };
  takes: SceneCopy & { note: string; alt: string; compareAlt: string; strip: string; compare: string };
  edit: SceneCopy & { alt: string; steps: readonly [string, string, string] };
  render: SceneCopy & { alt: string; label: string };
  plugins: SceneCopy & { alt: string; label: string };
  upscale: SceneCopy & { status: string; before: string; after: string; slider: string; note: string };
  local: SceneCopy & {
    points: readonly [string, string, string];
    question: string;
    answer: string;
    license: string;
  };
  works: SceneCopy & { seeAll: string };
  cta: SceneCopy & { github: string; tour: string; requirements: string };
  film: { videoTitle: string; note: string };
}

export const HOME: Copy<HomeCopy> = {
  'zh-hant': {
    hero: {
      title: '用自己的顯示卡，做出有聲音的動畫。',
      lead: '寫下鏡頭，挑出最好的版本，在時間軸剪成片。開源，免費。',
      works: '看操作導覽',
      github: '在 GitHub 取得',
      madeWith: '畫面由 Phasyn Studio 生成',
      captureAlt: 'Phasyn Studio 的鏡頭工作區：左邊是鏡頭清單，中間播放生成的 take，右邊寫 Prompt，下面是時間軸。',
    },
    stepsLabel: '看畫面的哪個部分',
    prompt: {
      title: '用文字描述鏡頭。',
      lead: '畫面和聲音一次生成，不用另外配音。',
      alt: '鏡頭工作區：右邊是這個鏡頭的 Prompt，中間是生成出來的 take。',
      steps: ['在這裡寫 Prompt', '生成的 take 在這裡播放'],
      workLabel: '一次生成的畫面和聲音',
    },
    reference: {
      title: '同一個角色，換到任何場景。',
      lead: '用 @ 指定圖片、影片、聲音當參考。',
      stillAlt: '用 Phasyn Studio 生成的同一個角色，在不同的場景裡。',
    },
    takes: {
      title: '一次八個版本，挑最好的。',
      lead: '一次最多 8 個變體，挑中的那個直接上時間軸。',
      note: '每個版本要幾分鐘，看你的顯示卡。',
      alt: '鏡頭工作區：監看器下方是這個鏡頭的 take 列，可以把其中一個設為使用中。',
      compareAlt: '鏡頭工作區：監看器並排比較同一個鏡頭的兩個 take。',
      strip: 'take 列：選一個設為使用中',
      compare: '兩個 take 並排比較',
    },
    edit: {
      title: '在同一個地方剪成片。',
      lead: '像 Premiere 的時間軸，還有為動畫做的頓格與衝擊格。',
      alt: '編輯工作區：上面是來源和節目監看器，下面是專案面板、工具列和時間軸。',
      steps: [
        '節目監看器：直接在畫面上縮放、旋轉',
        '時間軸：剪開、移動、自動對齊',
        '色彩、效果、音訊、字幕，各有工作配置',
      ],
    },
    render: {
      title: '每一次渲染，都留下紀錄。',
      lead: '佇列裡記著每一次渲染：什麼時候跑、用了哪個 seed、花了多久。好了的版本直接在這裡播放。',
      alt: '渲染工作區：左邊是渲染佇列，右邊是一次已完成的渲染和它產出的影片。',
      label: '完成的版本，直接播放',
    },
    plugins: {
      title: '換上別人調好的風格。',
      lead: '把調好的 Prompt 規則和生成設定打包分享。插件只有設定，不會執行程式。',
      alt: '插件管理：已安裝的插件清單。',
      label: '安裝、啟用，只套用在你選的專案',
    },
    upscale: {
      title: '放大兩倍，線條更乾淨。',
      lead: '用 Anime4K 重新取樣到 2560×1472，不是重畫。',
      status: '匯出選項加入中',
      before: '原始 1280×736',
      after: '2× 升頻 2560×1472',
      slider: '拖曳比較升頻前後',
      note: '同一格畫面，兩張以相同大小顯示。',
    },
    local: {
      title: '全部在你自己的電腦上。',
      lead: '沒有點數，也沒有月費。',
      points: ['用你自己的 Linux 和 NVIDIA 顯示卡', '生成在你自己的電腦上進行', '開源，Apache-2.0'],
      question: '現在能用嗎？',
      answer:
        '需要 Linux、NVIDIA 顯示卡和 CUDA 13.0 驅動。實際測過 RTX 3060、RTX 5080 和 DGX Spark，不支援 Mac 和 Windows。',
      license: '模型有各自的授權和地區限制',
    },
    works: {
      title: '宇宙等級的對決。',
      lead: '三個角色，各自的權能。每一支都是一鏡到底，聲音和畫面一起生成。',
      seeAll: '看全部作品',
    },
    cta: {
      title: '現在就開始。',
      lead: '原始碼在 GitHub 上。歡迎一起把它做得更好。',
      github: '在 GitHub 取得',
      tour: '看操作導覽',
      requirements: 'Linux · NVIDIA 顯示卡 · 實測 RTX 3060、RTX 5080、DGX Spark',
    },
    film: {
      videoTitle: 'Phasyn Studio 介紹影片',
      note: '69 秒的介紹影片：寫鏡頭、比較版本、剪輯、Image Studio 和匯出是真實介面的錄影，角色、圖片和作品畫面由 Phasyn Studio 生成（MiniMax H3、Qwen‑Image 2.1）。播放時會顯示字幕。',
    },
  },

  ja: {
    hero: {
      title: '自分の GPU で、音のあるアニメを。',
      lead: 'カットを書いて、いちばんいいテイクを選び、タイムラインで仕上げる。オープンソースで無料です。',
      works: '使い方を見る',
      github: 'GitHub で入手',
      madeWith: '映像は Phasyn Studio で生成',
      captureAlt:
        'Phasyn Studio のショット画面。左にショット一覧、中央に生成したテイク、右にプロンプト、下にタイムラインがあります。',
    },
    stepsLabel: '画面のどこを見るか',
    prompt: {
      title: '言葉で、カットを描く。',
      lead: '映像と音は一度に生成。あとから音を付ける必要はありません。',
      alt: 'ショット画面。右にこのショットのプロンプト、中央に生成されたテイクがあります。',
      steps: ['ここにプロンプトを書く', '生成したテイクをここで再生'],
      workLabel: '一度に生成した映像と音',
    },
    reference: {
      title: '同じキャラクターを、どんな場面にも。',
      lead: '@ で画像・動画・音声を参照に指定できます。',
      stillAlt: 'Phasyn Studio で生成した同じキャラクターが、別々の場面にいる画像。',
    },
    takes: {
      title: '8 つ作って、いちばんを選ぶ。',
      lead: '一度に最大 8 つのバリエーション。選んだものがそのままタイムラインに入ります。',
      note: '1 つにかかるのは数分。GPU によって変わります。',
      alt: 'ショット画面。モニターの下にこのショットのテイク一覧があり、どれかを使用中にできます。',
      compareAlt: 'ショット画面。同じショットの 2 つのテイクをモニターで並べて比べています。',
      strip: 'テイク一覧：1 つを使用中にする',
      compare: '2 つのテイクを並べて比較',
    },
    edit: {
      title: '同じ場所で、作品に仕上げる。',
      lead: 'Premiere のようなタイムラインに、アニメのためのヒットストップとインパクトフレーム。',
      alt: '編集画面。上にソースモニターとプログラムモニター、下にプロジェクトパネル、ツール、タイムラインがあります。',
      steps: [
        'プログラムモニター：画面の上で拡大・回転',
        'タイムライン：切る、動かす、吸着する',
        'カラー・効果・音声・字幕の作業画面',
      ],
    },
    render: {
      title: 'レンダリングは、すべて記録に残る。',
      lead: 'キューには、いつ実行したか、どの seed を使ったか、何分かかったかが残ります。できた版はその場で再生できます。',
      alt: 'レンダリング画面。左にキュー、右に完了した 1 回の実行と、その出力の動画があります。',
      label: 'できた版をその場で再生',
    },
    plugins: {
      title: '調整済みのスタイルを、そのまま。',
      lead: '調整したプロンプトのルールや生成設定をまとめて共有できます。プラグインは設定だけで、プログラムは動きません。',
      alt: 'プラグイン管理。インストールしたプラグインの一覧です。',
      label: 'インストールして、選んだプロジェクトだけで有効に',
    },
    upscale: {
      title: '2 倍にして、線をきれいに。',
      lead: 'Anime4K で 2560×1472 に再サンプリング。描き直しではありません。',
      status: '書き出しオプションは追加中',
      before: '元の 1280×736',
      after: '2× アップスケール 2560×1472',
      slider: 'ドラッグして前後を比べる',
      note: '同じフレームを同じ大きさで表示しています。',
    },
    local: {
      title: 'すべて、自分のマシンで。',
      lead: 'クレジットも、月額料金もありません。',
      points: ['手元の Linux と NVIDIA の GPU で', '生成は自分のコンピューターの中で', 'オープンソース（Apache-2.0）'],
      question: 'いま使えますか？',
      answer:
        'Linux、NVIDIA の GPU、CUDA 13.0 ドライバーが必要です。RTX 3060、RTX 5080、DGX Spark で動作を確かめています。Mac と Windows には対応していません。',
      license: '各モデルのライセンスと地域の制限',
    },
    works: {
      title: '宇宙規模の対決。',
      lead: '3 人のキャラクターと、それぞれの力。どれもワンカットで、音は映像と一緒に生成しています。',
      seeAll: '作品をすべて見る',
    },
    cta: {
      title: 'さあ、はじめよう。',
      lead: 'ソースコードは GitHub にあります。いっしょに良くしてくれる人も歓迎です。',
      github: 'GitHub で入手',
      tour: '操作ガイドを見る',
      requirements: 'Linux · NVIDIA の GPU · RTX 3060、RTX 5080、DGX Spark で確認済み',
    },
    film: {
      videoTitle: 'Phasyn Studio 紹介映像',
      note: '69 秒の紹介映像です。カットの記述、テイクの比較、編集、Image Studio、書き出しは実際の画面の録画で、キャラクター、画像、作品の映像は Phasyn Studio で生成しました（MiniMax H3・Qwen‑Image 2.1）。再生すると字幕が表示されます。',
    },
  },

  en: {
    hero: {
      title: 'Animation with sound, made on your own GPU.',
      lead: 'Write the shot, pick the best take, cut it on a timeline. Open source and free.',
      works: 'Take the Tour',
      github: 'Get It on GitHub',
      madeWith: 'Made with Phasyn Studio',
      captureAlt:
        'The Phasyn Studio Shot workspace: the shot list on the left, a generated take in the middle, the prompt on the right and the timeline below.',
    },
    stepsLabel: 'Which part of the screen to look at',
    prompt: {
      title: 'Describe the shot.',
      lead: 'Picture and sound are generated together. No dubbing afterwards.',
      alt: 'The Shot workspace: the shot’s prompt on the right, the generated take in the middle.',
      steps: ['Write the prompt here', 'The generated take plays here'],
      workLabel: 'Picture and sound from one generation',
    },
    reference: {
      title: 'One character. Any scene.',
      lead: 'Use @ to point at an image, a video or a sound as a reference.',
      stillAlt: 'The same character, generated with Phasyn Studio, in different scenes.',
    },
    takes: {
      title: 'Eight versions. Keep the best.',
      lead: 'Render up to 8 variants at once. The one you pick goes straight onto the timeline.',
      note: 'Each one takes a few minutes, depending on your GPU.',
      alt: 'The Shot workspace: the shot’s take strip under the viewer, where one take is set as the one in use.',
      compareAlt: 'The Shot workspace: the viewer compares two takes of the same shot side by side.',
      strip: 'Take strip: set the one in use',
      compare: 'Two takes, side by side',
    },
    edit: {
      title: 'Cut the film in one place.',
      lead: 'A Premiere-style timeline, plus hit-stops and impact frames made for animation.',
      alt: 'The Edit workspace: source and program monitors on top, the project panel, tools and timeline below.',
      steps: [
        'Program monitor: scale and rotate right on the picture',
        'Timeline: cut, move, snap',
        'Workspaces for color, effects, audio and captions',
      ],
    },
    render: {
      title: 'Every render, on the record.',
      lead: 'The queue keeps every render: when it ran, which seed it used and how long it took. Finished versions play right there.',
      alt: 'The Render workspace: the run queue on the left, one finished run and the video it produced on the right.',
      label: 'Finished versions play right here',
    },
    plugins: {
      title: 'Borrow a style someone tuned.',
      lead: 'Package tuned prompt rules and generation settings and share them. Plugins hold settings only and never run code.',
      alt: 'The plugin manager listing installed plugins.',
      label: 'Install, then turn on per project',
    },
    upscale: {
      title: 'Twice the size. Cleaner lines.',
      lead: 'Anime4K resamples it to 2560×1472. Nothing is redrawn.',
      status: 'Export option coming',
      before: 'Original 1280×736',
      after: '2× upscale 2560×1472',
      slider: 'Drag to compare before and after',
      note: 'The same frame, shown at the same size.',
    },
    local: {
      title: 'All on your own computer.',
      lead: 'No credits. No subscription.',
      points: ['Your own Linux machine and NVIDIA GPU', 'Generation runs on your computer', 'Open source, Apache-2.0'],
      question: 'Can I use it today?',
      answer:
        'You need Linux, an NVIDIA GPU and the CUDA 13.0 driver. It’s tested on an RTX 3060, an RTX 5080 and DGX Spark. Mac and Windows aren’t supported.',
      license: 'Each model has its own license and region limits',
    },
    works: {
      title: 'Battles on a Cosmic Scale.',
      lead: 'Three characters, each with her own power. Every piece is one continuous take, with sound generated alongside the picture.',
      seeAll: 'See All Works',
    },
    cta: {
      title: 'Start now.',
      lead: 'The source is on GitHub. Help making it better is always welcome.',
      github: 'Get It on GitHub',
      tour: 'Take the Tour',
      requirements: 'Linux · NVIDIA GPU · tested on RTX 3060, RTX 5080, DGX Spark',
    },
    film: {
      videoTitle: 'Phasyn Studio introduction film',
      note: 'A 69-second introduction. Writing a shot, comparing takes, editing, Image Studio and export are real screen recordings; the characters, pictures and works were generated with Phasyn Studio (MiniMax H3, Qwen‑Image 2.1). Captions appear when it plays.',
    },
  },
};
