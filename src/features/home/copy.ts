import type { Copy } from '../../i18n/locale.tsx';
import type { TerminalLine } from '../../components/mock/Terminal.tsx';

// Home page copy. zh-hant is the source language; ja uses です・ます; en uses US spelling and Apple HIG title case for headings
// and buttons. Product, area, model and component names stay untranslated. Facts and numbers follow work/product/product-analysis.md
// and src/features/home/data.ts; planned work is always labelled planned.

interface SectionHeading {
  /** Short Latin brand label (decorative, identical in every locale). */
  eyebrow: string;
  title: string;
  lead: string;
}

interface TextBlock {
  title: string;
  body: string;
}

export type RoadmapKey = 'render' | 'voice' | 'upscale' | 'sliders' | 'models' | 'optimise';

export interface HomeCopy {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    watch: string;
    tour: string;
    pause: string;
    play: string;
  };
  film: SectionHeading & { videoTitle: string };
  manifesto: {
    eyebrow: string;
    heading: string;
    lines: string[];
    signature: string;
    readMore: string;
  };
  pipeline: SectionHeading & {
    stepsLabel: string;
    steps: { label: string; title: string; body: string; points: string[] }[];
    mockLabels: string[];
    realBadge: string;
    caption: string;
    sound: string;
    mute: string;
    play: string;
    replay: string;
  };
  features: SectionHeading & {
    reverse: TextBlock & { note: string };
    swap: TextBlock & { status: string };
    advisor: TextBlock & { sources: string };
    timeline: TextBlock;
    imageStudio: TextBlock & { caption: string; chips: string[]; removeBackground: string; coming: string };
    languages: TextBlock;
    mockLabels: { reverse: string; swap: string; advisor: string; timeline: string };
  };
  architecture: SectionHeading & {
    diagram: {
      label: string;
      browser: string;
      controller: string;
      controllerSub: string;
      gatewaySub: string;
      textEncoder: string;
      ditSub: string;
      videoVae: string;
      audioVae: string;
      mux: string;
      control: string;
      data: string;
      caption: string;
    };
    process: TextBlock;
    direct: TextBlock;
    rent: TextBlock & { steps: string[]; today: string };
    setup: string;
    pause: string;
    play: string;
  };
  diagnostics: SectionHeading & {
    facts: string[];
    recorderLabel: string;
    recorderCaption: string;
    tableCaption: string;
    tableHeaders: { label: string; value: string };
    agentTitle: string;
    agentBody: string;
    terminalLabel: string;
    terminal: TerminalLine[];
  };
  benchmarks: SectionHeading & {
    stats: { value: string; unit: string; label: string; detail: string }[];
    footnote: string;
    cta: string;
  };
  roadmap: SectionHeading & {
    items: Record<RoadmapKey, TextBlock>;
    note: string;
  };
  closing: {
    title: string;
    lead: string;
    about: string;
  };
}

/**
 * English UI labels for the illustrative mock-ups, shared by every locale (the Tour recordings use the English UI too).
 * Labels are exact catalog values from work/product/ui-map.md. `imagePrompt` is the opening of the real prompt behind
 * REAL.stills.ocean (studio/gen/prompts/still-ocean.txt); change both together. Item names are demo data.
 */
export const MOCK_UI = {
  imageStudio: 'Image Studio',
  videoEdit: 'Video Studio · Edit',
  records: 'Records · Run Details',
  basics: 'Basics',
  sampling: 'Sampling',
  image: 'Image',
  generationMode: 'Generation mode',
  modeText: 'Generate from text only',
  modeReference: 'Add 1–4 reference images (masks allowed)',
  partialMask: 'Partial Mask (Optional)',
  outputSize: 'Output size',
  outputSizeValue: '12:7 · 0.77 MP',
  imagePrompt:
    'Cinematic wide shot, high-end anime film still. A vast dark ocean under a luminous aurora that ripples in bands of cyan, blue and violet; small translucent glass shards float in the air above the calm water, each catching the aurora light…',
  promptHint: 'Ctrl+Enter to generate',
  generateImage: 'Generate Image',
  takesOf: 'Takes of “Aurora shore”',
  previewOf: 'Preview (not the final result)',
  take: 'Take 1',
  inUse: 'In Use',
  useInVideo: 'Use in Video Shot…',
  viewer: 'Viewer',
  viewerShot: 'Aurora shore · take 1',
  generation: 'Generation',
  firstFrame: 'First Frame (fl2va)',
  continueOption: 'Continue from the previous shot\'s last frame',
  computeRoute: 'Compute Route (Pipeline)',
  references: 'References',
  referenceAssets: 'Reference assets',
  referenceTotal: 'Total 3/12',
  pictureTag: 'H3: <Picture 1>',
  audioTag: 'H3: <Audio 1>',
  videoTag: 'H3: <Video 1>',
  timeline: 'Timeline',
  timelineMeta: '1 clip · 5.17 s',
  exportSequence: 'Export Sequence…',
  renderShot: 'Render Shot',
  clipTitles: ['Aurora shore', 'Cliff at dawn', 'Rain street', 'Waking'],
  sections: ['Subject', 'Actions', 'Composition', 'Environment', 'Lighting', 'Appearance & Materials', 'Style', 'Visible Text'],
  sceneCandidates: 'Scene & Candidates',
  swapSteps: ['Source video', 'Characters', 'Scene-Cut Detection', 'Segment Plan', 'Output & Create'],
  advisorTitle: 'Prompt Fixes & Suggestions',
  advisorCounts: ['Error: 0', 'Warning: 1', 'Suggestion: 2', 'Info: 1'],
  advisorFinding: 'Abstract quality words such as epic, cinematic, masterpiece',
  official: 'Official',
  applyFix: 'Apply Fix…',
  effects: ['Cross Dissolve', 'Fade In/Out', 'Speed', 'Color', 'Text'],
  runTitle: 'Run Details',
  succeeded: 'Succeeded',
  stages: 'Stages',
  measuredMetrics: 'Measured Metrics',
  vramReserved: 'VRAM reserved peak',
  nvmlPeak: 'Whole-device peak (NVML)',
  weightsH2D: 'Weights H2D (completed)',
  blockLoads: 'Block loads',
  notMeasured: 'Not measured',
  traceOff: 'trace mode off',
  total: 'Total',
  terminalTitle: 'agent',
} as const;

const LANG_NAMES = ['繁體中文', '日本語', 'English'] as const;
export { LANG_NAMES };

export const HOME: Copy<HomeCopy> = {
  'zh-hant': {
    hero: {
      eyebrow: 'PHASE · FRAME · SYNTHESIS',
      title: '從分鏡，到成片。',
      lead: '一個人打造的 AI 影片工作台。文字、圖片與影片串成一條可控制的流程，在你自己的機器上執行。',
      watch: '觀看影片',
      tour: '操作導覽',
      pause: '暫停背景動畫',
      play: '播放背景動畫',
    },
    film: {
      eyebrow: 'THE FILM',
      title: '看它動起來。',
      lead: '一支短片，跟著一個想法，從分鏡走到成片。',
      videoTitle: 'Phasyn Studio 介紹影片',
    },
    manifesto: {
      eyebrow: 'WHY',
      heading: '為什麼要自己開發',
      lines: [
        '市面上的影片生成方案，又爛又貴。',
        '生成點數，根本是在吸人骨髓。',
        '一次又一次重新生成，出片也沒有比較快。',
        '粗製濫造的商業產品，還要你付錢。',
        '本地方案，例如 ComfyUI，完全不考慮真正的操作需求與加速需求。',
        '所以，我決定自己開發。',
      ],
      signature: 'DennySORA，開發者',
      readMore: '閱讀完整的開發者自述',
    },
    pipeline: {
      eyebrow: 'PIPELINE',
      title: '文字、圖片、影片，一條流程。',
      lead: '從一句提示詞，到一段有聲影片。每一步都看得見，每一步都能調整。',
      stepsLabel: '流程步驟',
      steps: [
        {
          label: '文字',
          title: '從一句話開始。',
          body: '寫下提示詞。Image Studio 用它生成畫面；在 Video Studio 裡，可以用 @Image1、@Video1、@Audio1 指定參考素材，片段庫、區塊檢視與格式化工具都在手邊。',
          points: ['提示詞', '@ 參考素材', '片段庫'],
        },
        {
          label: '圖片',
          title: '先把畫面定下來。',
          body: '在 Image Studio 以 Qwen-Image 2.1 生成圖片、用 1–4 張參考圖轉換風格、塗遮罩修改局部，再把選中的那一張送進影片鏡頭。',
          points: ['文字生成圖片', '圖生圖', '遮罩編輯'],
        },
        {
          label: '影片',
          title: '讓它動起來，連同聲音。',
          body: '文字、圖片、影片與聲音都能當作參考。MiniMax H3 同時生成畫面與同步的聲音。',
          points: ['t2va · 文字', 'fl2va · 首幀', 'ref2va · 參考素材'],
        },
      ],
      mockLabels: ['在 Image Studio 輸入提示詞', 'Image Studio 生成的圖片', 'Video Studio 播放以該圖為首幀生成的 fl2va 影片'],
      realBadge: '實際輸出',
      caption:
        '視窗為介面示意；畫面與影片是 Phasyn Studio 的實際輸出。靜態圖：Image Studio 以 Qwen-Image 2.1 生成（1152×672，在 RTX 5080 上端到端約 27 秒）。影片：以這張圖為首幀，用 H3 fl2va 生成（768×448、5.17 秒、含生成的聲音；這類片段端到端 57–76 秒：文字編碼在 DGX Spark GB10，DiT 與影片解碼在 RTX 5080，音訊解碼在 RTX 3060）。',
      sound: '開啟聲音',
      mute: '關閉聲音',
      play: '播放片段',
      replay: '重播',
    },
    features: {
      eyebrow: 'FEATURES',
      title: '為真正的創作而做。',
      lead: '每個功能，都從實際的需求出發。',
      reverse: {
        title: '反推 Prompt',
        body: '把一張圖交給 Qwen3-VL，拆成 8 個段落的場景描述與候選提示詞，再用 Qwen-Image 重新生成、逐段評分，看提示詞與原圖有多接近。',
        note: '影片反推已實作，尚未完成驗證。',
      },
      swap: {
        title: '一鍵替換角色',
        body: '五個步驟：來源影片、角色、場景切點偵測、分段規劃、輸出。設計目標是把約 1 分鐘的影片分批轉換，並保留原本的聲音。',
        status: '測試中',
      },
      advisor: {
        title: 'Prompt Advisor',
        body: '74 條規則依照 MiniMax 官方指南與實際安裝的程式碼檢查提示詞；其中 21 條可以一鍵修正，套用前先預覽差異。',
        sources: '每條規則都標出來源',
      },
      timeline: {
        title: '時間軸與效果',
        body: '剪輯、效果、渲染一次完成：分割、修剪、吸附，交叉溶解、淡入淡出、不變調的變速、調色與標題，最後用 FFmpeg 匯出 MP4。',
      },
      imageStudio: {
        title: 'Image Studio',
        body: '文字生成圖片、最多 4 張參考圖的圖生圖、遮罩局部修改；每次生成都留下 take，可以並排比較，再一鍵送進影片鏡頭。',
        caption: 'Phasyn Studio 實際輸出 · Qwen-Image 2.1 · 1152×672 · 每張在 RTX 5080 上端到端約 27 秒',
        chips: ['文字生成圖片', '圖生圖', '遮罩編輯'],
        removeBackground: '去背',
        coming: '即將加入',
      },
      languages: {
        title: '三種語言',
        body: '7,322 條介面字串，繁體中文、日本語、English 全部在地化。',
      },
      mockLabels: {
        reverse: '反推 Prompt 的場景段落',
        swap: '一鍵替換角色的分段規劃',
        advisor: 'Prompt Advisor 的修正建議',
        timeline: '時間軸上的片段與效果',
      },
    },
    architecture: {
      eyebrow: 'DISTRIBUTED',
      title: '元件拆得夠細，哪台機器都能跑。',
      lead: '每個模型元件都是獨立的程序，放在你指定的機器上。大型檔案在節點之間直接傳遞，不經過主控。',
      diagram: {
        label: '架構示意：一次渲染橫跨三顆 GPU 與兩台機器',
        browser: '瀏覽器',
        controller: 'Controller',
        controllerSub: '排程與紀錄',
        gatewaySub: '每台機器一個',
        textEncoder: '文字編碼',
        ditSub: '逐層串流',
        videoVae: '影片 VAE',
        audioVae: '音訊 VAE',
        mux: '混流',
        control: '控制',
        data: '資料 · FileRef',
        caption:
          '瀏覽器連到 Controller；Controller 透過每台機器上的 NodeGateway 下指令。文字編碼在 DGX Spark 上執行，結果以 FileRef 直接交給 PC 上的 DiT；DiT 的輸出再分給 RTX 5080 上的影片 VAE 與 RTX 3060 上的音訊 VAE，最後在 CPU 上混流。',
      },
      process: {
        title: '一個元件，一個程序',
        body: '文字編碼、DiT、影片 VAE、音訊 VAE、混流各自獨立執行；載入、精度與卸載都能逐一設定。某個模型當掉，也不會拖垮整個應用程式。',
      },
      direct: {
        title: '節點之間直接傳遞',
        body: 'latent 與影片以 FileRef 在節點之間搬運，Controller 只負責調度與紀錄。實測：PC 上的 DiT 從 DGX Spark 取得 219–322 KB 的條件資料，只花 30–34 ms。',
      },
      rent: {
        title: '下一步：租一台機器，用一兩個小時',
        body: '元件化的架構就是為此而設計：部署、啟動、處理、匯出、關機。',
        steps: ['部署', '啟動', '處理', '匯出', '關機'],
        today:
          '目前還沒有打包成現成流程。現在要加入一台 GPU 節點需要手動安裝，執行環境只支援 RTX 50 系列、RTX 30 系列與 GB10；系統沒有登入與 TLS，雲端節點必須放在私有網路裡。',
      },
      setup: '目前的設定：文字編碼在 DGX Spark（GB10）上；DiT 與影片 VAE 在 RTX 5080；音訊 VAE 在 RTX 3060；混流在 CPU。',
      pause: '暫停架構圖動畫',
      play: '播放架構圖動畫',
    },
    diagnostics: {
      eyebrow: 'DIAGNOSTICS',
      title: '找出最慢的那一步。或者，交給你的 Agent。',
      lead: '內建的 Recorder 會記下每次呼叫的 CPU 與 GPU 時間、VRAM、傳輸次數與位元組。',
      facts: [
        '102 項指標，每一項都有單位、品質與量測方法。',
        '沒量到就寫「Not measured」，絕不顯示成 0。',
        '最多同時比較 8 份紀錄，可匯出 JSONL、CSV、ZIP 或 trace。',
      ],
      recorderLabel: '一次 t2va 渲染的各步驟時間與 DiT 的量測指標',
      recorderCaption: '一次實際記錄的 t2va 渲染（124 幀、768×448）。影片與音訊解碼在不同 GPU 上同時進行，所以總時間小於各步驟相加。',
      tableCaption: '各步驟耗時（秒）與執行的機器',
      tableHeaders: { label: '步驟與元件', value: '耗時' },
      agentTitle: '太專業？沒關係。',
      agentBody: 'Phasyn Studio 附帶 Agent Skill：phasynctl 命令列工具，以及可選用、提供 22 個工具的 MCP 伺服器。讓 Agent 幫你檢查、比較與調校。',
      terminalLabel: 'Agent 用 phasynctl 找出最慢的步驟',
      terminal: [
        { kind: 'user', text: '幫我檢查系統，再找出上一次渲染最慢的步驟。' },
        { kind: 'command', text: 'phasynctl status' },
        { kind: 'agent', text: 'Controller 與 2 個節點都在線上。' },
        { kind: 'command', text: 'phasynctl runs show 7f3c2a' },
        { kind: 'agent', text: '最花時間的是 RTX 5080 上的 dit：59.8 s 裡占了 34.7 s。' },
        { kind: 'agent', text: '其次是同一張卡上的影片 VAE：22.8 s。' },
        { kind: 'user', text: '和前一次比較看看。' },
        { kind: 'command', text: 'phasynctl runs compare 7f3c2a 5b91e0' },
        { kind: 'muted', text: '逐步比較參數、提示詞與量測值…' },
      ],
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: '實測數字，照實公開。',
      lead: '40 個可以互換的 H3 DiT 引擎，全部在同一張 RTX 5080 上逐一跑過。依照自己的硬體，挑一種適合的跑法。',
      stats: [
        { value: '54.1', unit: 's', label: '一段 5.17 秒、有聲音的影片', detail: 't2va · 768×448 · 模型已載入 · 文字編碼在 DGX Spark，DiT 與影片 VAE 在 RTX 5080，音訊在 RTX 3060' },
        { value: '26.0', unit: 's', label: '最快的文字生成影片 DiT', detail: 'INT8 · PAI 8 步 · RTX 5080' },
        { value: '37/40', unit: '', label: '順利跑完的 DiT 引擎', detail: '同一張 RTX 5080，共 3.2 小時 · 3 個 NF4 引擎載入失敗，照實列為失敗' },
      ],
      footnote: '每個速度數字都會註明每一步在哪台機器上執行。',
      cta: '查看完整數據',
    },
    roadmap: {
      eyebrow: 'ROADMAP',
      title: '接下來。',
      lead: '開發順序以我自己的需求為主。以下功能都還沒有推出。',
      items: {
        render: { title: '多層級渲染', body: '先用只有骨架與粗略分鏡的簡單畫面快速渲染，把鏡頭定好；第二輪套入人物；最後才花時間出成片。' },
        voice: { title: 'TTS 與聲音遷移', body: '我自己開發了一套 TTS 系統，也能接入其他人的。' },
        upscale: { title: '超解析與補幀', body: '已經選好幾種技術，正在整合。' },
        sliders: { title: '生成插件與滑桿', body: '更細的控制：Slider 滑桿與 LoRA 風格。' },
        models: { title: '擴充模型支援', body: '接入第三方模組與模型，例如 Suno 的音樂。' },
        optimise: { title: 'VAE 與 DiT 最佳化', body: '影片 VAE 的編碼與解碼仍然最吃重，還有幾項實驗要做。' },
      },
      note: '另外也參考了 ArtCraft 的相關功能，目前還沒有整合。',
    },
    closing: {
      title: '讓你的想法動起來。',
      lead: '原始碼與架構說明整理好後就會公開。追蹤 GitHub 與 Hugging Face 上的 phasyn，第一時間收到消息。',
      about: '關於這個專案',
    },
  },
  ja: {
    hero: {
      eyebrow: 'PHASE · FRAME · SYNTHESIS',
      title: '絵コンテから、完成映像まで。',
      lead: '個人で開発している AI 映像制作のワークベンチです。テキスト、画像、映像をひとつの制御可能なパイプラインにまとめ、自分のマシンで動かします。',
      watch: '映像を見る',
      tour: '操作ガイドを見る',
      pause: '背景アニメーションを一時停止',
      play: '背景アニメーションを再生',
    },
    film: {
      eyebrow: 'THE FILM',
      title: '動く姿を、映像で。',
      lead: 'ひとつのアイデアが絵コンテから完成映像になるまでを、短い映像でご紹介します。',
      videoTitle: 'Phasyn Studio 紹介映像',
    },
    manifesto: {
      eyebrow: 'WHY',
      heading: 'なぜ自分で作ったのか',
      lines: [
        '市販の映像生成サービスは、質が悪いうえに高すぎます。',
        '生成クレジットは、骨の髄まで吸い取ります。',
        '何度生成し直しても、仕上がりが速くなるわけではありません。',
        '粗製乱造の商用サービスに、お金まで払わされます。',
        'ComfyUI のようなローカルのツールは、実際の操作性も高速化も、まったく考えていません。',
        'だから、自分で作ることにしました。',
      ],
      signature: 'DennySORA（開発者）',
      readMore: '開発者の言葉を読む',
    },
    pipeline: {
      eyebrow: 'PIPELINE',
      title: 'テキスト、画像、映像を、ひとつのパイプラインで。',
      lead: 'ひとつのプロンプトから、音声付きの映像まで。どのステップも確認でき、どのステップも調整できます。',
      stepsLabel: 'パイプラインのステップ',
      steps: [
        {
          label: 'テキスト',
          title: 'ひとことから始めます。',
          body: 'プロンプトを書きます。Image Studio はそこから画を生成し、Video Studio では @Image1・@Video1・@Audio1 で参照素材を指定できます。スニペット、ブロック表示、整形ツールもすぐ手元にあります。',
          points: ['プロンプト', '@ 参照素材', 'スニペット'],
        },
        {
          label: '画像',
          title: 'まず、画を決めます。',
          body: 'Image Studio では Qwen-Image 2.1 で画像を生成し、1〜4 枚の参照画像で変換し、マスクで一部だけを描き直せます。選んだ一枚は、そのまま映像のショットに送れます。',
          points: ['テキストから画像', '画像から画像', 'マスク編集'],
        },
        {
          label: '映像',
          title: '動かします。音も一緒に。',
          body: 'テキスト、画像、映像、音声を参照にできます。MiniMax H3 が映像と同期した音声を同時に生成します。',
          points: ['t2va · テキスト', 'fl2va · 最初のフレーム', 'ref2va · 参照素材'],
        },
      ],
      mockLabels: ['Image Studio でプロンプトを入力', 'Image Studio で生成した画像', 'その画像を最初のフレームにした fl2va 映像を Video Studio で再生'],
      realBadge: '実際の出力',
      caption:
        'ウィンドウは UI イメージですが、画像と映像は Phasyn Studio の実際の出力です。静止画は Image Studio の Qwen-Image 2.1 で生成しました（1152×672、RTX 5080 でエンドツーエンド約 27 秒）。映像はこの画像を最初のフレームにして H3 fl2va で生成しました（768×448、5.17 秒、生成した音声付き。同様のクリップはエンドツーエンドで 57〜76 秒：テキストエンコードは DGX Spark GB10、DiT と映像デコードは RTX 5080、音声デコードは RTX 3060）。',
      sound: '音声をオン',
      mute: '音声をオフ',
      play: 'クリップを再生',
      replay: 'もう一度再生',
    },
    features: {
      eyebrow: 'FEATURES',
      title: '本気の制作のために。',
      lead: 'どの機能も、実際に必要だったことから生まれました。',
      reverse: {
        title: 'リバースプロンプト',
        body: '画像を Qwen3-VL で 8 つの項目からなるシーン記述とプロンプト候補に分解し、Qwen-Image で生成し直して項目ごとに採点し、元の画像にどれだけ近いかを確かめます。',
        note: '映像のリバースプロンプトは実装済みですが、検証はまだ完了していません。',
      },
      swap: {
        title: 'ワンクリックでキャラクター置換',
        body: '元の映像、キャラクター、カット検出、セグメント計画、出力の 5 ステップです。約 1 分の映像をバッチに分けて変換し、元の音声を残すように設計しています。',
        status: 'テスト中',
      },
      advisor: {
        title: 'Prompt Advisor',
        body: '74 のルールで、MiniMax の公式ガイドと実際にインストールされたコードに照らしてプロンプトを確認します。そのうち 21 件はワンクリックで修正でき、適用前に差分を確認できます。',
        sources: 'すべてのルールに出典を表示',
      },
      timeline: {
        title: 'タイムラインとエフェクト',
        body: '編集、エフェクト、レンダリングまでひと続きで行えます。分割、トリム、スナップ、クロスディゾルブ、フェード、ピッチを保つ速度変更、色調整、タイトル。最後は FFmpeg で MP4 に書き出します。',
      },
      imageStudio: {
        title: 'Image Studio',
        body: 'テキストからの画像生成、最大 4 枚の参照画像による画像変換、マスクによる部分編集を行えます。生成のたびに take が残り、並べて比較し、ワンクリックで映像のショットに送れます。',
        caption: 'Phasyn Studio の実際の出力 · Qwen-Image 2.1 · 1152×672 · RTX 5080 で 1 枚あたりエンドツーエンド約 27 秒',
        chips: ['テキストから画像', '画像から画像', 'マスク編集'],
        removeBackground: '背景除去',
        coming: '近日追加予定',
      },
      languages: {
        title: '3 つの言語',
        body: '7,322 件の UI 文字列を、繁體中文・日本語・English ですべてローカライズしています。',
      },
      mockLabels: {
        reverse: 'リバースプロンプトのシーン項目',
        swap: 'キャラクター置換のセグメント計画',
        advisor: 'Prompt Advisor の修正提案',
        timeline: 'タイムライン上のクリップとエフェクト',
      },
    },
    architecture: {
      eyebrow: 'DISTRIBUTED',
      title: 'コンポーネントを細かく分けて、どのマシンでも。',
      lead: 'モデルの各コンポーネントは独立したプロセスとして、指定したマシンで動きます。大きなファイルはノード間で直接受け渡され、コントローラーを経由しません。',
      diagram: {
        label: 'アーキテクチャ図：1 回のレンダリングが 2 台のマシン、3 つの GPU にまたがる',
        browser: 'ブラウザ',
        controller: 'Controller',
        controllerSub: 'スケジュールと記録',
        gatewaySub: 'マシンごとに 1 つ',
        textEncoder: 'テキストエンコーダー',
        ditSub: 'レイヤーストリーミング',
        videoVae: '映像 VAE',
        audioVae: '音声 VAE',
        mux: 'Mux',
        control: '制御',
        data: 'データ · FileRef',
        caption:
          'ブラウザは Controller に接続し、Controller は各マシンの NodeGateway に指示を出します。テキストエンコードは DGX Spark で実行され、結果は FileRef として PC 上の DiT に直接渡されます。DiT の出力は RTX 5080 の映像 VAE と RTX 3060 の音声 VAE に分かれ、最後に CPU で mux されます。',
      },
      process: {
        title: '1 コンポーネント、1 プロセス',
        body: 'テキストエンコーダー、DiT、映像 VAE、音声 VAE、mux がそれぞれ独立して動き、ロード、精度、オフロードを個別に設定できます。ひとつのモデルが落ちても、アプリ全体が止まることはありません。',
      },
      direct: {
        title: 'ノードからノードへ',
        body: 'latent や映像は FileRef としてノード間を直接移動し、Controller はスケジュールと記録だけを担当します。実測では、PC 上の DiT が DGX Spark から 219〜322 KB の条件データを 30〜34 ms で受け取りました。',
      },
      rent: {
        title: '次の方向性：マシンを 1〜2 時間だけ借りる',
        body: 'コンポーネント構成は、そのために設計しています。デプロイ、起動、処理、書き出し、シャットダウン。',
        steps: ['デプロイ', '起動', '処理', '書き出し', 'シャットダウン'],
        today:
          'まだパッケージ化はしていません。現在、GPU ノードの追加には手動のセットアップが必要で、実行環境は RTX 50 シリーズ、RTX 30 シリーズ、GB10 のみに対応しています。認証や TLS がないため、クラウドのノードはプライベートネットワーク内に置く必要があります。',
      },
      setup: '現在の構成：テキストエンコードは DGX Spark（GB10）、DiT と映像 VAE は RTX 5080、音声 VAE は RTX 3060、mux は CPU で動かしています。',
      pause: 'アーキテクチャ図のアニメーションを一時停止',
      play: 'アーキテクチャ図のアニメーションを再生',
    },
    diagnostics: {
      eyebrow: 'DIAGNOSTICS',
      title: '遅いステップを見つける。エージェントに任せることもできます。',
      lead: '内蔵の Recorder は、呼び出しごとの CPU と GPU の時間、VRAM、転送回数とバイト数を記録します。',
      facts: [
        '102 の指標それぞれに、単位、品質、計測方法があります。',
        '計測していない値は「Not measured」と表示し、0 にはしません。',
        '最大 8 件の記録を比較し、JSONL、CSV、ZIP、trace で書き出せます。',
      ],
      recorderLabel: 't2va レンダリング 1 回分のステップ別時間と DiT の計測値',
      recorderCaption: '実際に記録した t2va レンダリング 1 回分（124 フレーム、768×448）です。映像と音声のデコードは別々の GPU で同時に進むため、合計時間は各ステップの和より短くなります。',
      tableCaption: 'ステップごとの所要時間（秒）と実行したマシン',
      tableHeaders: { label: 'ステップとコンポーネント', value: '所要時間' },
      agentTitle: '専門的すぎる？ 大丈夫です。',
      agentBody: 'Phasyn Studio には Agent Skill が付属しています。phasynctl コマンドラインツールと、必要に応じて使える 22 ツールの MCP サーバーで、エージェントが確認、比較、調整を代わりに行います。',
      terminalLabel: 'エージェントが phasynctl で遅いステップを特定する様子',
      terminal: [
        { kind: 'user', text: 'システムを確認して、前回のレンダリングでいちばん遅いステップを探して。' },
        { kind: 'command', text: 'phasynctl status' },
        { kind: 'agent', text: 'Controller と 2 つのノードはすべてオンラインです。' },
        { kind: 'command', text: 'phasynctl runs show 7f3c2a' },
        { kind: 'agent', text: 'いちばん時間がかかっているのは RTX 5080 の dit で、59.8 s のうち 34.7 s です。' },
        { kind: 'agent', text: '次は同じカードの映像 VAE で、22.8 s です。' },
        { kind: 'user', text: '前回の実行と比べて。' },
        { kind: 'command', text: 'phasynctl runs compare 7f3c2a 5b91e0' },
        { kind: 'muted', text: 'パラメーター、プロンプト、計測値をステップごとに比較しています…' },
      ],
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: '実測した数字を、そのまま公開します。',
      lead: '入れ替え可能な H3 の DiT エンジン 40 種を、すべて同じ RTX 5080 で 1 つずつ実行しました。お手持ちのハードウェアに合った動かし方を選べます。',
      stats: [
        { value: '54.1', unit: 's', label: '音声付き 5.17 秒の映像', detail: 't2va · 768×448 · モデル読み込み済み · テキストエンコードは DGX Spark、DiT と映像 VAE は RTX 5080、音声は RTX 3060' },
        { value: '26.0', unit: 's', label: 'テキストから映像の最速 DiT', detail: 'INT8 · PAI 8 ステップ · RTX 5080' },
        { value: '37/40', unit: '', label: '完走した DiT エンジン', detail: '同じ RTX 5080 で合計 3.2 時間 · NF4 の 3 種は読み込みに失敗し、失敗として記載' },
      ],
      footnote: 'すべての速度の数値に、各ステップを実行したマシンを明記します。',
      cta: 'すべてのデータを見る',
    },
    roadmap: {
      eyebrow: 'ROADMAP',
      title: 'これから。',
      lead: '開発の優先順位は、私自身の必要に合わせて決めています。以下はいずれもまだ提供していません。',
      items: {
        render: { title: 'マルチレベルレンダリング', body: '骨格とラフな絵コンテだけの簡単な画で素早くレンダリングしてカットを決め、次の段階でキャラクターを入れ、最後に時間をかけて仕上げます。' },
        voice: { title: 'TTS と音声変換', body: '自作の TTS システムに加えて、ほかの TTS も接続できるようにします。' },
        upscale: { title: '超解像とフレーム補間', body: 'いくつかの技術を選び、統合を進めています。' },
        sliders: { title: '生成プラグインとスライダー', body: 'Slider や LoRA スタイルによる、より細かな制御です。' },
        models: { title: '対応モデルの拡充', body: 'サードパーティのモジュールやモデル（Suno の音楽など）を接続できるようにします。' },
        optimise: { title: 'VAE と DiT の最適化', body: '映像 VAE のエンコードとデコードは、今も最も重いステップです。残りの実験を進めます。' },
      },
      note: 'ArtCraft の機能も参考にしていますが、まだ統合していません。',
    },
    closing: {
      title: 'あなたのアイデアを、動く映像に。',
      lead: 'ソースコードとアーキテクチャ解説は、準備ができしだい公開します。最新情報は GitHub と Hugging Face の phasyn でお知らせします。',
      about: 'このプロジェクトについて',
    },
  },
  en: {
    hero: {
      eyebrow: 'PHASE · FRAME · SYNTHESIS',
      title: 'From storyboard to synthesis.',
      lead: 'A personal AI filmmaking workbench. Text, image and video in one controllable pipeline — running on your own machines.',
      watch: 'Watch the Film',
      tour: 'Take the Tour',
      pause: 'Pause Background Animation',
      play: 'Play Background Animation',
    },
    film: {
      eyebrow: 'THE FILM',
      title: 'See It in Motion.',
      lead: 'A short film that follows one idea from storyboard to finished shot.',
      videoTitle: 'Phasyn Studio introduction film',
    },
    manifesto: {
      eyebrow: 'WHY',
      heading: 'Why I Built It',
      lines: [
        'Most video generation services are bad. And expensive.',
        'Credit systems bleed you dry.',
        'You regenerate again and again, and it’s still slow.',
        'Sloppy commercial products — and you pay for them.',
        'Local tools like ComfyUI ignore how people actually work, and how fast it could run.',
        'So I built my own.',
      ],
      signature: 'DennySORA, developer',
      readMore: 'Read the Full Story',
    },
    pipeline: {
      eyebrow: 'PIPELINE',
      title: 'Text, Image, Video. One Pipeline.',
      lead: 'From a single prompt to a clip with sound. Every step is visible. Every step is adjustable.',
      stepsLabel: 'Pipeline steps',
      steps: [
        {
          label: 'Text',
          title: 'Start with Words.',
          body: 'Write a prompt. Image Studio turns it into frames; in Video Studio, @Image1, @Video1 and @Audio1 point to references — with snippets, block view and a formatter right at hand.',
          points: ['Prompt', '@ references', 'Snippets'],
        },
        {
          label: 'Image',
          title: 'Lock the Look.',
          body: 'In Image Studio, generate with Qwen-Image 2.1, restyle with one to four reference images, or paint a mask to change one region — then send the frame you like to a video shot.',
          points: ['Text to image', 'Image to image', 'Masked edit'],
        },
        {
          label: 'Video',
          title: 'Bring It to Life — Sound Included.',
          body: 'Text, image, video and audio can all be references. MiniMax H3 generates the picture and synchronized sound together.',
          points: ['t2va · text', 'fl2va · first frame', 'ref2va · references'],
        },
      ],
      mockLabels: ['Writing a prompt in Image Studio', 'An image generated in Image Studio', 'Video Studio playing the fl2va clip made from that image'],
      realBadge: 'Real output',
      caption:
        'The windows are illustrative; the image and the clip are real Phasyn Studio output. Still: Qwen-Image 2.1 in Image Studio (1152×672, about 27 s end to end on the RTX 5080). Clip: H3 fl2va with that still as its first frame (768×448, 5.17 s with generated sound; clips like it took 57–76 s end to end: text encoding on DGX Spark GB10, DiT and video decode on RTX 5080, audio decode on RTX 3060).',
      sound: 'Turn Sound On',
      mute: 'Turn Sound Off',
      play: 'Play Clip',
      replay: 'Replay',
    },
    features: {
      eyebrow: 'FEATURES',
      title: 'Made for Real Work.',
      lead: 'Every feature started as something I actually needed.',
      reverse: {
        title: 'Reverse Prompt',
        body: 'Qwen3-VL breaks an image into an eight-part scene and candidate prompts. Qwen-Image renders them again and scores every part, to show how closely the prompt matches.',
        note: 'Video reverse prompting is implemented but not yet verified.',
      },
      swap: {
        title: 'One-Click Character Swap',
        body: 'Five steps: source video, characters, scene-cut detection, segment plan, output. Designed to convert a video of about a minute in batches and keep its original audio.',
        status: 'In testing',
      },
      advisor: {
        title: 'Prompt Advisor',
        body: '74 rules check your prompt against MiniMax’s official guides and the installed code. 21 of them offer a one-click fix, previewed as a diff before you apply it.',
        sources: 'Every rule cites its source',
      },
      timeline: {
        title: 'Timeline and Effects',
        body: 'Edit, add effects and render in one place: split, trim, snap, cross dissolves, fades, pitch-preserving speed, color and titles — then export an MP4 with FFmpeg.',
      },
      imageStudio: {
        title: 'Image Studio',
        body: 'Text to image, image to image with up to four references, and masked edits. Every generation stays as a take you can compare side by side and send to a video shot.',
        caption: 'Real Phasyn Studio output · Qwen-Image 2.1 · 1152×672 · about 27 s each end to end on the RTX 5080',
        chips: ['Text to image', 'Image to image', 'Masked edit'],
        removeBackground: 'Remove background',
        coming: 'Coming',
      },
      languages: {
        title: 'Three Languages',
        body: 'All 7,322 interface strings, localized in Traditional Chinese, Japanese and English.',
      },
      mockLabels: {
        reverse: 'Scene sections from a reverse prompt',
        swap: 'Segment plan of a character swap',
        advisor: 'A Prompt Advisor fix suggestion',
        timeline: 'Clips and effects on the timeline',
      },
    },
    architecture: {
      eyebrow: 'DISTRIBUTED',
      title: 'Small Components. Any Machine.',
      lead: 'Every model component runs as its own process, on the machine you choose. Large files move node to node — never through the controller.',
      diagram: {
        label: 'Architecture diagram: one render across two machines and three GPUs',
        browser: 'Browser',
        controller: 'Controller',
        controllerSub: 'Schedules runs · keeps records',
        gatewaySub: 'One per machine',
        textEncoder: 'Text encoder',
        ditSub: 'Layer streaming',
        videoVae: 'Video VAE',
        audioVae: 'Audio VAE',
        mux: 'Mux',
        control: 'Control',
        data: 'Data · FileRef',
        caption:
          'The browser connects to the Controller, which instructs a NodeGateway on each machine. Text encoding runs on the DGX Spark and its result goes straight to the DiT on the PC as a FileRef. The DiT output splits to the video VAE on the RTX 5080 and the audio VAE on the RTX 3060, and the CPU muxes the result.',
      },
      process: {
        title: 'One Process per Component',
        body: 'Text encoder, DiT, video VAE, audio VAE and mux each run on their own, with their own load, precision and offload settings. A crashing model doesn’t take the app down with it.',
      },
      direct: {
        title: 'Node to Node',
        body: 'Latents and video travel between nodes as FileRefs; the Controller only schedules and keeps records. Measured: the DiT on the PC received 219–322 KB of conditioning from the DGX Spark in 30–34 ms.',
      },
      rent: {
        title: 'Next: Rent a Machine for an Hour or Two',
        body: 'The component design is built for it: deploy, start, process, export, shut down.',
        steps: ['Deploy', 'Start', 'Process', 'Export', 'Shut Down'],
        today:
          'It isn’t packaged yet. Today, adding a GPU node takes a manual setup, runtimes cover only RTX 50-series, RTX 30-series and GB10, and with no login or TLS by design, a cloud node needs a private network.',
      },
      setup: 'Current setup: text encoding on a DGX Spark (GB10); DiT and video VAE on an RTX 5080; audio VAE on an RTX 3060; mux on the CPU.',
      pause: 'Pause Diagram Animation',
      play: 'Play Diagram Animation',
    },
    diagnostics: {
      eyebrow: 'DIAGNOSTICS',
      title: 'Find the Slow Step. Or Let Your Agent Find It.',
      lead: 'The built-in Recorder logs CPU and GPU time, VRAM, and transfer counts and bytes for every call.',
      facts: [
        '102 metrics, each with its unit, quality and method.',
        'Anything unmeasured says “Not measured” — never a fake zero.',
        'Compare up to eight recordings; export JSONL, CSV, ZIP or a trace.',
      ],
      recorderLabel: 'Step times of one t2va render and the measured DiT metrics',
      recorderCaption: 'One recorded t2va render (124 frames, 768×448). Video and audio decode run in parallel on different GPUs, so the total is less than the sum of the steps.',
      tableCaption: 'Time per step (seconds) and the machine that ran it',
      tableHeaders: { label: 'Step and component', value: 'Time' },
      agentTitle: 'Too Technical? No Problem.',
      agentBody: 'Phasyn Studio ships with an agent skill: the phasynctl CLI plus an optional MCP server with 22 tools, so an agent can check, compare and tune the system for you.',
      terminalLabel: 'An agent using phasynctl to find the slow step',
      terminal: [
        { kind: 'user', text: 'Check the system, then find the slowest step in my last render.' },
        { kind: 'command', text: 'phasynctl status' },
        { kind: 'agent', text: 'The Controller and both nodes are online.' },
        { kind: 'command', text: 'phasynctl runs show 7f3c2a' },
        { kind: 'agent', text: 'Most of the time is dit on the RTX 5080: 34.7 s of 59.8 s.' },
        { kind: 'agent', text: 'Next is the video VAE on the same card: 22.8 s.' },
        { kind: 'user', text: 'Compare it with the previous run.' },
        { kind: 'command', text: 'phasynctl runs compare 7f3c2a 5b91e0' },
        { kind: 'muted', text: 'Comparing parameters, prompt and metrics step by step…' },
      ],
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: 'Measured. Published As Is.',
      lead: '40 interchangeable H3 DiT engines, each run on the same RTX 5080 — so you can choose a setup that fits your hardware.',
      stats: [
        { value: '54.1', unit: 's', label: 'A 5.17-second clip with sound', detail: 't2va · 768×448 · models loaded · text encoding on DGX Spark, DiT and video VAE on RTX 5080, audio on RTX 3060' },
        { value: '26.0', unit: 's', label: 'Fastest text-to-video DiT', detail: 'INT8 · PAI 8-step · RTX 5080' },
        { value: '37/40', unit: '', label: 'DiT engines that completed', detail: 'One RTX 5080, 3.2 hours in total · 3 NF4 engines failed to load and are listed as failures' },
      ],
      footnote: 'Every speed number names the machine that ran each step.',
      cta: 'See All Benchmarks',
    },
    roadmap: {
      eyebrow: 'ROADMAP',
      title: 'What’s Next.',
      lead: 'Development follows my own needs. Nothing below has shipped yet.',
      items: {
        render: { title: 'Multi-Level Rendering', body: 'A fast pass with just skeletons and a rough storyboard to lock the shots, a second pass for characters, then the final render.' },
        voice: { title: 'TTS and Voice Transfer', body: 'My own TTS system — with room to plug in others.' },
        upscale: { title: 'Super-Resolution and Frame Interpolation', body: 'A few techniques are chosen and being integrated.' },
        sliders: { title: 'Generation Plug-ins and Sliders', body: 'Finer control through sliders and LoRA styles.' },
        models: { title: 'Broader Model Support', body: 'Third-party modules and models — Suno music, for example.' },
        optimise: { title: 'VAE and DiT Optimization', body: 'Video VAE encode and decode is still the heaviest step. A few experiments to go.' },
      },
      note: 'Ideas from ArtCraft are on the list too — not integrated yet.',
    },
    closing: {
      title: 'Your ideas, in motion.',
      lead: 'Source code and architecture notes will be published once they’re ready. Follow phasyn on GitHub and Hugging Face to hear first.',
      about: 'About the Project',
    },
  },
};
