import type { Copy } from '../../i18n/locale.tsx';

/*
 * About page copy. Source language is zh-hant: the author's own statement
 * (docs/about-statement.zh-hant.md), condensed but kept in his voice — first
 * person, blunt about paid credit-based generators and about local tools.
 * ja uses です・ます; en is US English with Apple HIG title case on headings.
 * Model, product and component names are never translated. U+00A0 keeps
 * names and number + unit pairs (RTX 5080, 1 分鐘) on one line. In zh-hant
 * display text (titles, leads, statements, short card texts) lines break
 * only at punctuation, spaces and U+200B marks (word-break: keep-all);
 * U+2060 forbids a break that punctuation would otherwise allow.
 *
 * Status where the facts require it (lead, from work/product/product-analysis.md):
 * one-click character swap = in testing (wizard exists, no full-video run yet; the author will test it);
 * 去背 (background removal) = coming (the author will add it later; user decision);
 * renting machines = the author's design goal (no packaging for cloud GPUs yet).
 */

export const SECTION_IDS = ['why', 'built', 'today', 'scale', 'editing', 'roadmap', 'benchmarks', 'contact'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

/** Decorative wide-tracked Latin labels above each section title (brand EN_LABEL style, `aria-hidden`); same in every locale. */
export const SECTION_TAGS: Record<SectionId, string> = {
  why: 'Why',
  built: 'Built',
  today: 'Today',
  scale: 'Scale out',
  editing: 'Prompts',
  roadmap: 'Roadmap',
  benchmarks: 'Benchmarks',
  contact: 'Contact',
};

export const CAPABILITY_IDS = ['images', 'references', 'reverse', 'swap'] as const;
export type CapabilityId = (typeof CAPABILITY_IDS)[number];

/** The author's numbering (1–6) from the statement. */
export const ROADMAP_IDS = ['tts', 'upscale', 'multipass', 'sliders', 'models', 'optimize'] as const;
export type RoadmapId = (typeof ROADMAP_IDS)[number];

export const SETUP_IDS = ['rtx5080', 'rtx3060', 'gb10'] as const;
export type SetupId = (typeof SETUP_IDS)[number];

/** Current hardware (BRIEF §2–§3): GPU memory in GB, or the chip name. Names and units are not translated. */
export const SETUP_MACHINES: Record<SetupId, { name: string; memoryGb?: number; chip?: string }> = {
  rtx5080: { name: 'RTX 5080', memoryGb: 16 },
  rtx3060: { name: 'RTX 3060', memoryGb: 12 },
  gb10: { name: 'DGX Spark', chip: 'GB10' },
};

interface TitledText {
  title: string;
  text: string;
}

interface RenderPass extends TitledText {
  label: string;
}

export interface AboutCopy {
  hero: {
    eyebrow: string;
    /** Display lines of the page title (h1); read as one string. */
    title: readonly string[];
    /** One entry per sentence; each starts on its own line so a line never breaks inside a phrase. */
    standfirst: readonly string[];
    /** Screen-reader prefix for the byline. */
    bylineLabel: string;
    startReading: string;
  };
  index: { heading: string };
  /** Status labels this page needs beyond COMMON.planned / COMMON.inDevelopment. */
  status: { testing: string; designGoal: string; coming: string };
  titles: Record<SectionId, string>;
  why: { lead: string; body: readonly string[]; statement: string; after: readonly string[] };
  built: {
    lead: string;
    body: readonly string[];
    setup: { caption: string; roles: Record<SetupId, string>; note: string };
    after: readonly string[];
  };
  today: {
    intro: string;
    pipelineLabel: string;
    pipeline: readonly [string, string, string];
    /** `images.coming`: the author's 去背 (background removal), not in the product yet; shown with a "coming" chip. */
    capabilities: Record<Exclude<CapabilityId, 'images'>, TitledText> & { images: TitledText & { coming: string } };
    extraIntro: string;
  };
  scale: {
    /** Coordinating machines; finely split components. */
    body: readonly string[];
    /** The author's rent-a-machine idea, then the plain status clause (design goal, not packaged yet). */
    rentalText: readonly string[];
    rental: { caption: string; steps: readonly [string, string, string, string, string] };
    diagnostics: string;
    statement: string;
  };
  editing: { body: readonly string[]; artcraft: string };
  roadmap: {
    intro: string;
    items: Record<RoadmapId, TitledText>;
    passes: readonly [RenderPass, RenderPass, RenderPass];
    outro: string;
  };
  benchmarks: { body: readonly string[]; note: string; cta: string };
  contact: { lead: string };
}

export const ABOUT: Copy<AboutCopy> = {
  'zh-hant': {
    hero: {
      eyebrow: 'About · Phasyn Studio',
      title: ['為什麼要自己做？'],
      standfirst: ['受夠了又爛又貴的影片生成服務，我乾脆自己做了一套。', '這篇寫它為什麼存在、現在能做什麼，以及接下來的計畫。'],
      bylineLabel: '作者',
      startReading: '開始閱讀',
    },
    index: { heading: '目錄' },
    status: { testing: '測試中', designGoal: '設計目標', coming: '即將加入' },
    titles: {
      why: '又爛又貴',
      built: '所以，我自己做',
      today: '現在能做什麼',
      scale: '為擴充而設計',
      editing: '編輯與 Prompt',
      roadmap: '接下來要做的',
      benchmarks: '公開實測速度',
      contact: '原始碼與聯絡',
    },
    why: {
      lead: '我真的覺得，市面上生成影片的方案又爛又貴，真是令我厭惡啊。',
      body: [
        '那些生成點數什麼的，根本就是吸人骨髓：每一次都要花很多時間重複生成，出片的速度也沒比較快。',
        '如果想把影片做得好一點，基本上困難重重，完全不符合真正進入創作階段的需求。',
      ],
      // U+2060 (word joiner) keeps 「粗製濫造」 and 的 together, so the quote sets as three phrases.
      statement: '我最討厭的，就是這些​「粗製濫造」⁠的商業產品，還必須花錢。',
      after: ['而在本機執行的工具，基本上完全不考慮真正的操作需求跟加速需求，例如 ComfyUI。'],
    },
    built: {
      lead: '因此，我就決定自己開發。',
      body: [
        '說到技術，更多是在做工程優化。',
        '模型的技術方面，我的算力其實不多：一張 RTX 5080，加一張 RTX 3060。現在的配置裡，文字編碼另外放在一台 DGX Spark（GB10）上跑。',
      ],
      setup: {
        caption: '目前的分工',
        roles: { rtx5080: 'DiT、影片 VAE', rtx3060: '音訊 VAE', gb10: '文字編碼、反推' },
        note: '元件可以在已加入的機器之間任意調配；這只是我現在的擺法。',
      },
      after: ['所以這套系統更多是我自己個人使用；之後實驗完成，再慢慢釋出。'],
    },
    today: {
      intro: '專案整合了「文字 → 圖片 → 影片」的整套流程。',
      pipelineLabel: '從文字到圖片，再到影片',
      pipeline: ['文字', '圖片', '影片'],
      capabilities: {
        images: { title: '圖片', text: '生成、轉換、編輯圖片。', coming: '去背' },
        references: { title: '參考轉影片', text: '用文字、圖片、影片、聲音當參考，轉成影片。' },
        reverse: { title: '反推', text: '把一張圖片轉換回 Prompt；影片反推已實作，尚未驗證。' },
        swap: { title: '一鍵替換', text: '約 1 分鐘的影片，自動分批轉換，替換裡面的人物。' },
      },
      extraIntro: '同時，我也把反推，跟一鍵替換整支影片的功能加了進來。',
    },
    scale: {
      body: [
        '它同時有很好的擴充性與可用性：如果你有多台電腦可以用，這個專案能設定讓它們協調。',
        '我把元件拆分得很細，每個都能放在適合它的機器上執行。',
      ],
      rentalText: [
        '因為有分散式的能力，你其實能自己租機器，少少地花錢，可能就用這一兩個小時：部署、啟動、處理、匯出，結束關閉。',
        '不過這目前還是設計目標：租用雲端 GPU 用的打包還沒做好，沒有安裝程式，執行環境也只支援 RTX 50、RTX 30 系列與 GB10。',
      ],
      rental: { caption: '一兩個小時，用完就關', steps: ['部署', '啟動', '處理', '匯出', '關閉'] },
      diagnostics: '比較專業的人，也能從數據分析出是哪個步驟很慢、是不是資料頻繁搬運等等。',
      statement: '太專業？看不懂？沒關係，專案提供 Skill，直接接入 Agent，讓它幫你優化。',
    },
    editing: {
      body: ['再來是編輯的部分。開發的時候，我對 Prompt 推薦做了調整，能夠很好地導入 Prompt 需求。'],
      artcraft: '其實我參考了 ArtCraft 的相關功能，但目前還沒整合進去。',
    },
    roadmap: {
      intro: '之後還有很多功能會慢慢加入：',
      items: {
        tts: {
          title: 'TTS 與聲音遷移',
          text: '把文字念成語音，或把一段聲音換成另一種音色。我這邊也開發了一套 TTS 系統，當然也能接入其他人的。',
        },
        upscale: { title: '超解析度與補幀', text: '讓畫面更清晰、動作更順。這邊我選了幾個技術，一樣在整合中。' },
        multipass: {
          title: '多層級渲染',
          text: '我正在開發分級別的渲染：先用很快的粗略渲染把鏡頭跟分鏡定好，再一層層加上去，最後才花時間出片。',
        },
        sliders: { title: '生成外掛與滑桿', text: '增加細部的控制系統：用 Slider 滑桿微調細節，或套用 LoRA 風格。' },
        models: { title: '擴充模型支援', text: '未來能自己接入第三方的模組與模型，例如整合 Suno 的音樂。' },
        optimize: {
          title: 'VAE 與 DiT 優化',
          text: '讓最吃資源的步驟更快。目前還有幾個實驗沒處理，影片 VAE 的編碼與解碼，壓力還是太大。',
        },
      },
      passes: [
        { label: '第一層', title: '骨架與分鏡', text: '只有骨架跟大致分鏡，連背景都是線條就好。速度很快，先把鏡頭跟分鏡做好。' },
        { label: '第二層', title: '套入人物', text: '開始把人物等等套進去。' },
        { label: '最後', title: '出片', text: '渲染壓力大，但基本上都固定了，就花時間出片。' },
      ],
      outro: '諸如此類。開發進度，應該會以我的需求為主。',
    },
    benchmarks: {
      body: ['我會發佈自己實際測試的結果：相關模型跑在我系統上的速度。大家可以根據表格，選擇用什麼方式來跑。'],
      note: '每一個數字，都會標明每個步驟是在哪一台機器上跑的。',
      cta: '看實測速度',
    },
    contact: { lead: '有任何想法或問題，歡迎寫信給我。' },
  },

  ja: {
    hero: {
      eyebrow: 'About · Phasyn Studio',
      title: ['なぜ、', '自分で作るのか。'],
      standfirst: [
        '質が悪くて高い動画生成サービスにうんざりして、自分で作ることにしました。',
        'なぜ作ったのか、今なにができるのか、そしてこれからの計画を書きます。',
      ],
      bylineLabel: '筆者',
      startReading: '読みはじめる',
    },
    index: { heading: '目次' },
    status: { testing: 'テスト中', designGoal: '設計目標', coming: '近日追加予定' },
    titles: {
      why: 'ひどくて、高い',
      built: 'だから、自分で作る',
      today: '今できること',
      scale: '拡張を前提にした設計',
      editing: '編集とプロンプト',
      roadmap: 'これから作るもの',
      benchmarks: '実測の速度を公開',
      contact: 'ソースコードと連絡先',
    },
    why: {
      lead: '正直なところ、市販の動画生成サービスはひどいうえに高くて、本当にうんざりしています。',
      body: [
        '生成クレジットなんて、骨の髄までしゃぶり尽くす仕組みです。何度も生成し直すたびに時間がかかるのに、仕上がりが速くなるわけでもありません。',
        '少しでも良い映像を作ろうとすると困難だらけで、本当の意味で創作に入れる状態にはまったくなっていません。',
      ],
      statement: 'いちばん嫌いなのは、こうした「粗製乱造」の商用サービスに、お金まで払わされることです。',
      after: ['ローカルで動くツールは、実際の操作や高速化のニーズを、まったくと言っていいほど考えていません。ComfyUI がその一例です。'],
    },
    built: {
      lead: 'だから、自分で開発することにしました。',
      body: [
        '技術的に言えば、その多くはエンジニアリングの最適化です。',
        'モデルの面では、手元の計算資源は実はそれほど多くありません。RTX 5080 と RTX 3060 が 1 枚ずつです。今の構成では、テキストエンコードを別の DGX Spark（GB10）で動かしています。',
      ],
      setup: {
        caption: '現在の役割分担',
        roles: { rtx5080: 'DiT、映像 VAE', rtx3060: '音声 VAE', gb10: 'テキストエンコード、逆引き' },
        note: 'コンポーネントは、参加しているマシンの間で自由に配置を変えられます。これはあくまで今の私の配置です。',
      },
      after: ['なので、基本的には自分で使うためのものです。実験が終わったものから、少しずつ公開していきます。'],
    },
    today: {
      intro: 'テキスト → 画像 → 動画の流れ全体を、ひとつにまとめています。',
      pipelineLabel: 'テキストから画像、そして動画へ',
      pipeline: ['テキスト', '画像', '動画'],
      capabilities: {
        images: { title: '画像', text: '画像の生成、変換、編集。', coming: '背景除去' },
        references: { title: '参照から動画', text: 'テキスト、画像、動画、音声を参照にして、動画を作ります。' },
        reverse: { title: '逆引き', text: '1 枚の画像からプロンプトを書き起こします。動画の逆引きは実装済みで、検証はまだです。' },
        swap: { title: 'ワンクリック差し替え', text: '約 1 分の動画を自動で分割して順に変換し、人物を差し替えます。' },
      },
      extraIntro: 'さらに、逆引きと、動画まるごとのワンクリック差し替えも加えました。',
    },
    scale: {
      body: [
        '拡張性と使いやすさも重視しています。複数のコンピューターがあれば、このプロジェクトで連携させられます。',
        'コンポーネントはとても細かく分けてあり、それぞれに合ったマシンで動かせます。',
      ],
      rentalText: [
        '分散処理ができるので、自分でマシンを借りて、わずかな費用で 1〜2 時間だけ使う、といった使い方もできるようになります。デプロイ、起動、処理、書き出し、そして終了です。',
        'ただし、これはまだ設計目標の段階です。レンタルのクラウド GPU 向けのパッケージやインストーラーはまだなく、実行環境も今は RTX 50／RTX 30 シリーズと GB10 向けだけです。',
      ],
      rental: { caption: '1〜2 時間使って、終わったら止める', steps: ['デプロイ', '起動', '処理', '書き出し', '終了'] },
      diagnostics: '詳しい人なら、どのステップが遅いのか、データを頻繁に移動していないかといったことまで、計測値から分析できます。',
      statement: '専門的すぎてわからない？ 大丈夫です。付属の Skill をエージェントにつなげば、最適化を任せられます。',
    },
    editing: {
      body: ['次に編集です。開発の過程でプロンプトの提案機能を調整し、必要な要素をうまく取り込めるようにしました。'],
      artcraft: '実は ArtCraft の機能も参考にしていますが、まだ統合していません。',
    },
    roadmap: {
      intro: 'これからも、少しずつ機能を追加していきます。',
      items: {
        tts: {
          title: 'TTS と声質変換',
          text: 'テキストの読み上げと、声を別の声質に変える機能です。自前の TTS システムも開発していますが、もちろんほかの TTS もつなげられます。',
        },
        upscale: {
          title: '超解像とフレーム補間',
          text: '映像をより鮮明に、動きをより滑らかにします。いくつかの技術を選んで、統合を進めています。',
        },
        multipass: {
          title: '多段階レンダリング',
          text: '段階的なレンダリングを開発中です。速いラフでカメラとカット割りを先に固め、少しずつ要素を足して、時間をかけるのは最後の書き出しだけにします。',
        },
        sliders: {
          title: '生成プラグインとスライダー',
          text: '細かな制御を加えます。スライダーで細部を調整したり、LoRA でスタイルを適用したりできるようにします。',
        },
        models: {
          title: '対応モデルの拡充',
          text: 'サードパーティのモジュールやモデルを、自分でつなげられるようにします。たとえば Suno の音楽との統合です。',
        },
        optimize: {
          title: 'VAE と DiT の最適化',
          text: 'いちばん重い処理を速くします。まだ手をつけていない実験がいくつかあり、動画 VAE のエンコードとデコードは今も負荷が大きすぎます。',
        },
      },
      passes: [
        {
          label: '第 1 段階',
          title: '骨格と絵コンテ',
          text: '骨格と大まかな絵コンテだけ。背景も線画で十分です。速いので、先にカメラとカット割りを決めます。',
        },
        { label: '第 2 段階', title: '人物を入れる', text: '人物などを当てはめていきます。' },
        {
          label: '最終段階',
          title: '書き出し',
          text: '負荷は大きいものの、内容はほぼ固まっているので、あとは時間をかけて書き出すだけです。',
        },
      ],
      outro: 'ほかにもありますが、開発の優先順位は基本的に自分の必要に合わせて決めます。',
    },
    benchmarks: {
      body: [
        '各モデルが私のシステムで実際にどのくらいの速度で動くのか、実測した結果を公開します。表を見て、どの方法で動かすか選んでください。',
      ],
      note: 'どの数値にも、各ステップをどのマシンで動かしたかを明記します。',
      cta: '実測の速度を見る',
    },
    contact: { lead: 'ご意見やご質問があれば、気軽にメールをください。' },
  },

  en: {
    hero: {
      eyebrow: 'About · Phasyn Studio',
      title: ['Why Build It Myself?'],
      standfirst: [
        'I got fed up with bad, overpriced video generators, so I built my own.',
        'Here’s why it exists, what it does today, and what comes next.',
      ],
      bylineLabel: 'Written by',
      startReading: 'Start Reading',
    },
    index: { heading: 'Contents' },
    status: { testing: 'In testing', designGoal: 'Design goal', coming: 'Coming' },
    titles: {
      why: 'Bad and Overpriced',
      built: 'So I Built It',
      today: 'What It Does Today',
      scale: 'Built to Scale Out',
      editing: 'Editing and Prompts',
      roadmap: 'What’s Next',
      benchmarks: 'Real Speeds, Published',
      contact: 'Source Code and Contact',
    },
    why: {
      lead: 'Honestly, the video generation options out there are bad and overpriced. I can’t stand them.',
      body: [
        'Those generation credits bleed you dry. You burn time regenerating over and over, and finished clips don’t come any faster.',
        'Making a video even a little better is an uphill battle, and none of it fits what real creative work needs.',
      ],
      statement: 'What I hate most are these sloppy commercial products. And you still have to pay for them.',
      after: ['And local tools basically ignore how people actually work and how fast things need to run. ComfyUI is one example.'],
    },
    built: {
      lead: 'So I decided to build it myself.',
      body: [
        'Technically speaking, most of it is engineering optimization.',
        'On the model side, my compute is actually modest: one RTX 5080 and one RTX 3060. In the current setup, text encoding runs separately on a DGX Spark (GB10).',
      ],
      setup: {
        caption: 'Who Runs What Today',
        roles: { rtx5080: 'DiT, video VAE', rtx3060: 'Audio VAE', gb10: 'Text encoding, reverse prompting' },
        note: 'Components can move freely between the machines you’ve added. This is just how I’ve placed mine for now.',
      },
      after: ['So it’s mostly for my own use. Once experiments wrap up, I’ll release things gradually.'],
    },
    today: {
      intro: 'The project covers the whole text → image → video pipeline.',
      pipelineLabel: 'From text to image to video',
      pipeline: ['Text', 'Image', 'Video'],
      capabilities: {
        images: { title: 'Images', text: 'Generate, restyle, and edit images.', coming: 'Background removal' },
        references: { title: 'Video from References', text: 'Turn text, image, video, and audio references into video.' },
        reverse: { title: 'Reverse Prompting', text: 'Turn an image back into a prompt. Video reverse prompting is implemented but not yet verified.' },
        swap: {
          title: 'One-Click Character Swap',
          text: 'Replace the character in a roughly one‑minute video, converted automatically in batches.',
        },
      },
      extraIntro: 'I also added reverse prompting and one-click character swaps for whole videos.',
    },
    scale: {
      body: [
        'It also scales well and stays practical: if you have several computers, the project can coordinate them.',
        'I split the components very finely, so each one can run on whichever machine suits it.',
      ],
      rentalText: [
        'Because it’s distributed, you could rent machines yourself for just an hour or two and spend very little: deploy, start, process, export, shut down.',
        'For now that’s a design goal: there’s no packaging for rented cloud GPUs yet, no installer, and runtimes only cover RTX 50- and 30-series cards and GB10.',
      ],
      rental: { caption: 'An hour or two, then shut it down', steps: ['Deploy', 'Start', 'Process', 'Export', 'Shut Down'] },
      diagnostics:
        'If you’re more technical, the data shows which step is slow, whether data is being moved around too often, and so on.',
      statement:
        'Too technical? Can’t make sense of it? No problem. The project ships a Skill that plugs straight into an agent, so it can optimize things for you.',
    },
    editing: {
      body: ['Then there’s editing. During development I tuned the prompt suggestions so they cover what a prompt actually needs.'],
      artcraft: 'I’ve also drawn on ArtCraft’s features for ideas, but they aren’t integrated yet.',
    },
    roadmap: {
      intro: 'Plenty more is coming, bit by bit:',
      items: {
        tts: {
          title: 'TTS and Voice Transfer',
          text: 'Text to speech, and making one voice sound like another. I’ve built a TTS system of my own, and of course others can plug in theirs.',
        },
        upscale: {
          title: 'Super-Resolution and Frame Interpolation',
          text: 'Sharper frames and smoother motion. I’ve picked a few techniques and I’m integrating them now.',
        },
        multipass: {
          title: 'Multi-Level Rendering',
          text: 'I’m building rendering in levels: lock the camera and shots with a fast rough pass, add layers on top, and spend time only on the final render.',
        },
        sliders: { title: 'Generation Plug-ins and Sliders', text: 'Finer control: fine-tune details with sliders, or apply LoRA styles.' },
        models: { title: 'Broader Model Support', text: 'Plug in third-party modules and models yourself, for example Suno for music.' },
        optimize: {
          title: 'VAE and DiT Optimization',
          text: 'Make the heaviest steps faster. A few experiments are still pending; video VAE encoding and decoding remains too heavy.',
        },
      },
      passes: [
        {
          label: 'Pass 1',
          title: 'Skeleton and Storyboard',
          text: 'Just skeletons and a rough storyboard; even the background can be line art. Fast, for locking the camera and shots.',
        },
        { label: 'Pass 2', title: 'Characters In', text: 'Characters and the rest go in.' },
        {
          label: 'Final',
          title: 'The Real Render',
          text: 'Heavy to render, but everything is basically locked by now, so all that’s left is render time.',
        },
      ],
      outro: 'And so on. Development priorities will mostly follow my own needs.',
    },
    benchmarks: {
      body: ['I publish the real speeds I measure for these models on my own system, so you can use the tables to choose how to run them.'],
      note: 'Every number states which machine ran each step.',
      cta: 'See the Benchmarks',
    },
    contact: { lead: 'Questions or ideas? Write to me.' },
  },
};
