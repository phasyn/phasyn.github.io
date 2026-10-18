import type { Copy } from '../../i18n/locale.tsx';
import type { HotspotId, ScreenKey } from './screens.ts';

// Home page copy. zh-hant is the source language; ja uses です・ます; en uses US spelling and Apple HIG title case for headings
// and buttons. Product, area, model and component names stay untranslated. Facts and numbers follow work/product/product-analysis.md
// and src/features/home/data.ts; numbers about a real screen are the ones that screen shows. Planned work is always labelled
// planned.

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

/** One manifesto line; `hot` are the exact substrings tinted as pain points (in reading order). */
export interface ManifestoBeat {
  text: string;
  hot: string[];
}

export interface HomeCopy {
  hero: {
    eyebrow: string;
    title: string;
    /** Two sentences, shown as two lines. */
    lead: [string, string];
    /** Caption of the real stills in the hero's film strip. */
    strip: string;
    watch: string;
    tour: string;
    pause: string;
    play: string;
  };
  film: SectionHeading & { videoTitle: string };
  manifesto: {
    eyebrow: string;
    heading: string;
    /** The five pain points, in the author's order. */
    beats: ManifestoBeat[];
    /** The turn: `hot` is the brand-gradient keyword inside `text`. */
    final: { text: string; hot: string };
    /** Tag on the HUD visuals: they dramatise the words, they are not measurements. */
    illustration: string;
    signature: string;
    readMore: string;
  };
  pipeline: SectionHeading & {
    stepsLabel: string;
    steps: { label: string; title: string; body: string; points: string[] }[];
    /** What each step's real screen or real output shows (visible caption under it). */
    notes: string[];
    firstFrame: string;
    clipLabel: string;
    /** Note under the clip: the web copy's audio is loudness-normalised. */
    loudness: string;
    realBadge: string;
    caption: string;
    sound: string;
    mute: string;
    play: string;
    pause: string;
    replay: string;
  };
  features: SectionHeading & {
    reverse: TextBlock & { note: string };
    /** `note`: responsible-use line (MIGRATION decision #13). */
    swap: TextBlock & { note: string };
    advisor: TextBlock & { sources: string };
    /** `spec`: measured output and export format. */
    timeline: TextBlock & { spec: string };
    /** `license`: model licences of the outputs shown. */
    imageStudio: TextBlock & { caption: string; chips: string[]; removeBackground: string; license: string };
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
    /** Captions of the real screens next to the diagram. */
    real: { graph: string; timeline: string; inspector: string };
    /** Which GPUs have runtimes today, and what multiple machines are for. */
    runtimes: string;
    multi: string;
    process: TextBlock;
    direct: TextBlock;
    rent: TextBlock & { steps: string[]; today: string };
    setup: string;
    pause: string;
    play: string;
  };
  diagnostics: SectionHeading & {
    facts: string[];
    runCaption: string;
    compareCaption: string;
    agentTitle: string;
    agentBody: string;
    /** Scripting line around the `code` command. */
    agentScript: { before: string; code: string; after: string };
    terminalCaption: string;
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
  ticker: {
    label: string;
    items: { te: string; venc: string; dit: string; video: string; audio: string; mux: string; render: string; fastest: string; still: string; fileRef: string; metrics: string; engines: string };
  };
  /** Real-screen frames (RealScreen): badge, pending frame, alt text per screen, callout labels. */
  screens: {
    real: string;
    pendingTitle: string;
    pendingBody: string;
    callouts: string;
    alt: Record<ScreenKey, string>;
    hotspots: Record<HotspotId, string>;
  };
}


export const HOME: Copy<HomeCopy> = {
  'zh-hant': {
    hero: {
      eyebrow: 'PHASE · FRAME · SYNTHESIS',
      title: '從分鏡，到成片。',
      lead: ['一個人打造的 AI 影片工作台。', '文字、圖片與影片串成一條可控制的流程，在你自己的機器上執行。'],
      strip: 'Phasyn Studio 實際輸出 · Qwen‑Image 2.1 · 1152×672 · 每張約 27 秒（RTX 5080）',
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
      beats: [
        { text: '市面上的影片生成方案，又爛又貴。', hot: ['又爛又貴'] },
        { text: '生成點數，根本是在吸人骨髓。', hot: ['吸人骨髓'] },
        { text: '一次又一次重新生成，出片也沒有比較快。', hot: ['一次又一次重新生成', '沒有比較快'] },
        { text: '粗製濫造的商業產品，還要你付錢。', hot: ['粗製濫造', '還要你付錢'] },
        { text: '本地方案，例如 ComfyUI，完全不考慮真正的操作需求與加速需求。', hot: ['操作需求', '加速需求'] },
      ],
      final: { text: '所以，我決定自己開發。', hot: '自己開發' },
      illustration: '示意',
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
          body: '在 Image Studio 以 Qwen‑Image 2.1 生成圖片、用 1–4 張參考圖轉換風格、塗遮罩修改局部，再把選中的那一張送進影片鏡頭。',
          points: ['文字生成圖片', '圖生圖', '遮罩編輯'],
        },
        {
          label: '影片',
          title: '讓它動起來，連同聲音。',
          body: '文字、圖片、影片與聲音都能當作參考。MiniMax H3 同時生成畫面與同步的聲音。',
          points: ['t2va · 文字', 'fl2va · 首幀', 'ref2va · 參考素材'],
        },
      ],
      notes: [
        'Image Studio 的實際畫面：提示詞送出後，先在 Text Conditioning 做文字編碼。',
        'Image Studio 的實際畫面：生成完成的 take，在檢視器裡標示為 In Use。',
        '實際輸出：以這張 Qwen‑Image 2.1 靜態圖為首幀，H3 fl2va 生成了含聲音的影片（run cfa759df）。',
      ],
      firstFrame: '首幀',
      clipLabel: '以這張首幀生成的 fl2va 影片',
      loudness: '網頁版已做響度正規化；原始輸出約 −37～−50 LUFS、AAC 32 kHz。',
      realBadge: '實際輸出',
      caption:
        '介面是 Phasyn Studio 的實際畫面（英文介面）。靜態圖與影片是實際輸出。靜態圖：以 Image Studio 所用的 t2i‑pc 流程、Qwen‑Image 2.1 生成（1152×672，端到端約 27 秒：文字編碼、DiT 與 VAE 在 RTX 5080，合成在 CPU）。影片：以這張圖為首幀，用 H3 fl2va 生成（768×448、24 fps、124 幀＝5.17 秒、含生成的聲音）。它就是下方 Records 畫面裡的 run cfa759df，端到端 57.2 秒：文字編碼在 DGX Spark GB10，DiT 與影片解碼在 RTX 5080，音訊解碼在 RTX 3060。',
      sound: '開啟聲音',
      mute: '關閉聲音',
      play: '播放片段',
      pause: '暫停片段',
      replay: '重播',
    },
    features: {
      eyebrow: 'FEATURES',
      title: '為真正的創作而做。',
      lead: '每個功能，都從實際的需求出發。',
      reverse: {
        title: '反推 Prompt',
        body: '把一張圖交給 Qwen3‑VL，拆成 8 個段落的場景描述與候選提示詞，再用 Qwen‑Image 重新生成、逐段評分，看提示詞與原圖有多接近。',
        note: '影片反推已實作，尚未完成驗證。',
      },
      swap: {
        title: '一鍵替換角色',
        body: '五個步驟：來源影片、角色、場景切點偵測、分段規劃、輸出。設計目標是把約 1 分鐘的影片分批轉換，並保留原本的聲音。',
        note: '請只使用你擁有權利的素材，不要冒用真人身分。',
      },
      advisor: {
        title: 'Prompt Advisor',
        body: '74 條規則檢查提示詞：45 條依 MiniMax 官方指南、21 條依實際安裝的程式碼、8 條是寫作指南的建議；其中 21 條可以一鍵修正，套用前先預覽差異。',
        sources: '每條規則都標出來源',
      },
      timeline: {
        title: '時間軸與效果',
        body: '剪輯、效果、渲染一次完成：分割、修剪、吸附，交叉溶解、淡入淡出、不變調的變速、調色與標題，最後用 FFmpeg 匯出 MP4。',
        spec: '目前實測的輸出：768×448、24 fps、124 幀（5.17 秒），聲音 AAC 32 kHz 立體聲。匯出：MP4（H.264＋AAC，完整重新編碼；畫質預設 CRF 18／23／28）。',
      },
      imageStudio: {
        title: 'Image Studio',
        body: '文字生成圖片、最多 4 張參考圖的圖生圖、遮罩局部修改；每次生成都留下 take，可以並排比較，再一鍵送進影片鏡頭。',
        caption: 'Phasyn Studio 實際輸出 · Qwen‑Image 2.1，經 Image Studio 所用的 t2i‑pc 流程 · 1152×672 · 每張端到端約 27 秒（文字編碼、DiT 與 VAE 在 RTX 5080，合成在 CPU）',
        chips: ['文字生成圖片', '圖生圖', '遮罩編輯'],
        removeBackground: '去背',
        license: 'Qwen‑Image 2.1 為研究、非商用授權；MiniMax H3 依 Community License（含地域限制與使用規範）。商用前請自行確認授權條款。',
      },
    },
    architecture: {
      eyebrow: 'DISTRIBUTED',
      title: '元件拆得夠細，放在你選的機器上。',
      lead: '每個模型元件都是獨立的程序，放在你指定的機器上。latent、影片等大型中間檔在節點之間直接傳遞，不經過主控。',
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
        mux: '封裝（mux）',
        control: '控制',
        data: '資料 · FileRef',
        caption:
          '瀏覽器連到 Controller；Controller 透過每台機器上的 NodeGateway 下指令。文字編碼在 DGX Spark 上執行，結果以 FileRef 直接交給 PC 上的 DiT；DiT 的輸出再分給 RTX 5080 上的影片 VAE 與 RTX 3060 上的音訊 VAE，最後在 CPU 上封裝（mux）。',
      },
      real: {
        graph: '實際畫面 · Components：fl2va‑pc 流程的節點圖。te 在 DGX Spark（GB10）；venc、dit 與 video 在 RTX 5080；audio 在 RTX 3060。',
        timeline:
          '實際畫面 · Records：同一條流程的一次實際渲染，6 個步驟共 57.156 秒。Step Timeline 為每個資源群組畫一條軌道：DGX Spark 的 GB10、PC 的 RTX 5080 與 RTX 3060，以及 CPU。兩台機器、三顆 GPU。',
        inspector: '實際畫面 · Components：dit‑5080 的元件檢視器。每個元件都能單獨啟動、停止、重新啟動；同一個 Node 一次只載入一個 DiT。',
      },
      runtimes: '目前的執行環境：RTX 50 系列、RTX 30 系列、DGX Spark（GB10）；RTX 40 系列（例如 4090）還沒有對應的執行環境。',
      multi: '多機的用途是把同一次渲染的各個元件分到不同 GPU；目前一次執行一個 run，不是多支影片平行運算。',
      process: {
        title: '一個元件，一個程序',
        body: '文字編碼、DiT、影片 VAE、音訊 VAE、封裝（mux）各自獨立執行；載入、精度與卸載都能逐一設定。某個模型當掉，也不會拖垮整個應用程式。',
      },
      direct: {
        title: '節點之間直接傳遞',
        body: 'latent 與影片以 FileRef 在節點之間搬運；Controller 負責調度、紀錄，並提供你上傳的檔案。實測：PC 上的 DiT 從 DGX Spark 取得 219–322 KB 的條件資料，只花 30–34 ms。',
      },
      rent: {
        title: '下一步：租一台機器，用一兩個小時',
        body: '元件化的架構就是為此而設計：部署、啟動、處理、匯出、關機。',
        steps: ['部署', '啟動', '處理', '匯出', '關機'],
        today:
          '目前還沒有打包成現成流程。現在要加入一台 GPU 節點需要手動安裝，執行環境只支援 RTX 50 系列、RTX 30 系列與 GB10；系統沒有登入與 TLS，雲端節點必須放在私有網路裡。',
      },
      setup: '目前的設定：文字編碼在 DGX Spark（GB10）上；DiT 與影片 VAE 在 RTX 5080；音訊 VAE 在 RTX 3060；封裝（mux）在 CPU。',
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
      runCaption: '實際畫面 · Records：一次 fl2va 渲染的執行紀錄。6 個步驟全部完成，共 57.156 秒；最慢的是 RTX 5080 上的 dit（31.951 秒）。',
      compareCaption: 'Records · Compare：最多 8 份紀錄並排，比較設定差異與量測值。',
      agentTitle: '交給 Agent，或寫成腳本。',
      agentBody: 'Phasyn Studio 附帶 Agent Skill：phasynctl 命令列工具，以及可選用、提供 22 個工具的 MCP 伺服器。',
      agentScript: { before: '用 ', code: 'phasynctl runs create / wait / download', after: ' 寫腳本，就能批次送出、等完成、下載結果；Video Studio 也有 Batch Render。Agent 用同一組工具檢查、比較與調校。' },
      terminalCaption: '終端機：Agent 用 phasynctl 檢查系統、比較紀錄。',
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: '實測數字，照實公開。',
      lead: '40 個 H3 DiT 引擎（22 個用於文字與首幀、18 個用於參考素材），全部在同一張 RTX 5080 上測過。依照自己的硬體，挑一種適合的跑法。',
      stats: [
        { value: '57.2', unit: 's', label: '一段 5.17 秒、有聲音的影片', detail: 'fl2va · 768×448 · run cfa759df · 文字編碼在 DGX Spark，DiT 與影片 VAE 在 RTX 5080，音訊在 RTX 3060' },
        { value: '33.2', unit: 's', label: '最快的文字生成影片 DiT', detail: 'DiT 階段實耗（其中去噪運算 26.0 s）· INT8 · PAI 8 步 · RTX 5080' },
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
        optimise: { title: 'VAE 與 DiT 最佳化', body: '影片 VAE 的編碼與解碼負擔仍然太重，還有幾項實驗要做。' },
      },
      note: '另外也參考了 ArtCraft 的相關功能，目前還沒有整合。',
    },
    ticker: {
      label: '實測數據',
      items: {
        te: '文字編碼 · te‑gb10',
        venc: '影片編碼 · venc‑5080',
        dit: 'DiT · dit‑5080',
        video: '影片 VAE · vae‑5080',
        audio: '音訊 VAE · audio‑3060',
        mux: '封裝（mux）· CPU',
        render: '同一次 fl2va 渲染 · 端到端',
        fastest: '最快 t2va DiT 階段 · INT8 PAI 8',
        still: 'Qwen‑Image 2.1 · 1152×672',
        fileRef: 'FileRef DGX → PC',
        metrics: 'Recorder 指標',
        engines: '跑完的 DiT 引擎',
      },
    },
    closing: {
      title: '讓你的想法動起來。',
      lead: '原始碼與架構說明整理好後就會公開。追蹤 GitHub 與 Hugging Face 上的 phasyn，第一時間收到消息。',
      about: '關於這個專案',
    },
    screens: {
      real: '實際畫面',
      pendingTitle: '真實畫面擷取中',
      pendingBody: '這裡會放上 Phasyn Studio 的實際畫面。',
      callouts: '畫面標註',
      alt: {
        'image-studio-generating': 'Image Studio 生成中的實際畫面：Text Conditioning 正在執行，下方的新 take 顯示 Generating。',
        'image-studio-takes': 'Image Studio 生成完成的實際畫面：檢視器顯示選用中的 take，下方是 Takes 列，右側是設定面板。',
        'render-engine-image': 'Generation Engine 面板：這張圖的流程需要的元件（文字編碼、DiT 與 VAE 在 RTX 5080，合成在 CPU），每個都能單獨啟動。',
        'video-studio-editor': 'Video Studio 的編輯畫面：檢視器、Inspector 與時間軸。',
        'prompt-advisor': 'Video Studio 的 Prompt Fixes & Suggestions：每條建議都附上來源。',
        'references-mentions': 'Video Studio 的提示詞編輯器，用 @ 指定圖片、影片與聲音參考。',
        'render-engine-three-machines': 'Render Engine：一次渲染的每個元件，以及它在哪台機器上執行。',
        'render-progress': 'Video Studio 正在渲染一個鏡頭。',
        'timeline-effects': 'Video Studio 的時間軸，片段上套用了效果。',
        'export-dialog': 'Export Sequence 對話框：片段、總長度與編碼設定。',
        'image-to-prompt-result': 'Inference Studio 的 Image to Prompt：一張圖的場景段落與評分過的候選提示詞。',
        'components-pipeline-graph': 'Components 裡 fl2va‑pc 流程的節點圖：te 在 DGX Spark（GB10），venc、dit 與 video 在 RTX 5080，audio 在 RTX 3060。',
        'component-inspector-precision': 'Components 的元件檢視器：dit‑5080 可以單獨啟動、停止與重新啟動，並提示每個 Node 一次只能載入一個 DiT。',
        'records-run-steps': 'Records 的實際執行紀錄：一次 fl2va 渲染的 6 個步驟全部完成，共 57.156 秒；Step Timeline 為每個資源群組畫一條軌道。',
        'records-compare': 'Records 的 Compare：並排比較多份紀錄的設定差異與量測值。',
        'terminal-phasynctl': '終端機裡，Agent 用 phasynctl 檢查系統、比較紀錄。',
      },
      hotspots: {
        'generating.flow': '生成流程：Prompt → Generation → Refine/Library',
        'generating.te': '提示詞先做文字編碼',
        'generating.take': '新的 take 正在生成',
        'takes.inUse': '選用中的 take',
        'takes.strip': '每次生成都留下 take',
        'takes.video': '同一個專案，切到 Video Studio',
        'run.elapsed': '6/6 個步驟完成 · 57.156 s',
        'run.slowest': '最慢的一步：dit · 31.951 s',
        'run.timeline': '每個資源群組一條軌道',
        'run.compare': '比較這次執行的紀錄',
        'run.te': 'te · 1.333 s · DGX Spark（GB10）',
        'run.audio': 'audio · 854 ms · RTX 3060',
        'run.mux': 'mux · 297 ms · CPU',
        'graph.te': 'te · DGX Spark（GB10）',
        'graph.dit': 'dit · RTX 5080',
        'graph.audio': 'audio · RTX 3060',
      },
    },
  },
  ja: {
    hero: {
      eyebrow: 'PHASE · FRAME · SYNTHESIS',
      title: '絵コンテから、完成映像まで。',
      lead: ['個人で開発している AI 映像制作のワークベンチです。', 'テキスト、画像、映像をひとつの制御可能なパイプラインにまとめ、自分のマシンで動かします。'],
      strip: 'Phasyn Studio の実際の出力 · Qwen‑Image 2.1 · 1152×672 · 1 枚あたり約 27 秒（RTX 5080）',
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
      beats: [
        { text: '市販の映像生成サービスは、質が悪いうえに高すぎます。', hot: ['質が悪い', '高すぎます'] },
        { text: '生成クレジットは、骨の髄まで吸い取ります。', hot: ['骨の髄まで吸い取ります'] },
        { text: '何度生成し直しても、仕上がりが速くなるわけではありません。', hot: ['何度生成し直しても', '速くなるわけではありません'] },
        { text: '粗製乱造の商用サービスに、お金まで払わされます。', hot: ['粗製乱造', 'お金まで払わされます'] },
        { text: 'ComfyUI のようなローカルのツールは、実際の操作性も高速化も、まったく考えていません。', hot: ['操作性', '高速化'] },
      ],
      final: { text: 'だから、自分で作ることにしました。', hot: '自分で作る' },
      illustration: 'イメージ',
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
          body: 'Image Studio では Qwen‑Image 2.1 で画像を生成し、1〜4 枚の参照画像で変換し、マスクで一部だけを描き直せます。選んだ一枚は、そのまま映像のショットに送れます。',
          points: ['テキストから画像', '画像から画像', 'マスク編集'],
        },
        {
          label: '映像',
          title: '動かします。音も一緒に。',
          body: 'テキスト、画像、映像、音声を参照にできます。MiniMax H3 が映像と同期した音声を同時に生成します。',
          points: ['t2va · テキスト', 'fl2va · 最初のフレーム', 'ref2va · 参照素材'],
        },
      ],
      notes: [
        'Image Studio の実際の画面です。送信したプロンプトは、まず Text Conditioning でエンコードされます。',
        'Image Studio の実際の画面です。生成が終わった take が、ビューアーで In Use になっています。',
        '実際の出力です。この Qwen‑Image 2.1 の静止画を最初のフレームに、H3 fl2va が音声付きの映像を生成しました（run cfa759df）。',
      ],
      firstFrame: '最初のフレーム',
      clipLabel: 'この最初のフレームから生成した fl2va 映像',
      loudness: 'Web 版はラウドネスを正規化しています（元の出力は約 −37〜−50 LUFS、AAC 32 kHz）。',
      realBadge: '実際の出力',
      caption:
        'UI は Phasyn Studio の実際の画面（英語 UI）です。静止画と映像は実際の出力です。静止画は Image Studio と同じ t2i‑pc パイプラインの Qwen‑Image 2.1 で生成しました（1152×672、エンドツーエンド約 27 秒：テキストエンコーダー・DiT・VAE は RTX 5080、合成は CPU）。映像はこの画像を最初のフレームにして H3 fl2va で生成しました（768×448、24 fps、124 フレーム＝5.17 秒、生成した音声付き）。下の Records の画面と同じ run cfa759df で、エンドツーエンド 57.2 秒でした（テキストエンコードは DGX Spark GB10、DiT と映像デコードは RTX 5080、音声デコードは RTX 3060）。',
      sound: '音声をオン',
      mute: '音声をオフ',
      play: 'クリップを再生',
      pause: 'クリップを一時停止',
      replay: 'もう一度再生',
    },
    features: {
      eyebrow: 'FEATURES',
      title: '本気の制作のために。',
      lead: 'どの機能も、実際に必要だったことから生まれました。',
      reverse: {
        title: 'リバースプロンプト',
        body: '画像を Qwen3‑VL で 8 つの項目からなるシーン記述とプロンプト候補に分解し、Qwen‑Image で生成し直して項目ごとに採点し、元の画像にどれだけ近いかを確かめます。',
        note: '映像のリバースプロンプトは実装済みですが、検証はまだ完了していません。',
      },
      swap: {
        title: 'ワンクリックでキャラクター置換',
        body: '元の映像、キャラクター、カット検出、セグメント計画、出力の 5 ステップです。約 1 分の映像をバッチに分けて変換し、元の音声を残すように設計しています。',
        note: '権利を持っている素材だけを使い、実在の人物になりすますことはしないでください。',
      },
      advisor: {
        title: 'Prompt Advisor',
        body: '74 のルールでプロンプトを確認します（公式ガイド 45、インストール済みのコード 21、作成ガイドの提案 8）。そのうち 21 件はワンクリックで修正でき、適用前に差分を確認できます。',
        sources: 'すべてのルールに出典を表示',
      },
      timeline: {
        title: 'タイムラインとエフェクト',
        body: '編集、エフェクト、レンダリングまでひと続きで行えます。分割、トリム、スナップ、クロスディゾルブ、フェード、ピッチを保つ速度変更、色調整、タイトル。最後は FFmpeg で MP4 に書き出します。',
        spec: '現在実測している出力：768×448、24 fps、124 フレーム（5.17 秒）、音声は AAC 32 kHz ステレオ。書き出し：MP4（H.264＋AAC、完全に再エンコード。画質プリセットは CRF 18／23／28）。',
      },
      imageStudio: {
        title: 'Image Studio',
        body: 'テキストからの画像生成、最大 4 枚の参照画像による画像変換、マスクによる部分編集を行えます。生成のたびに take が残り、並べて比較し、ワンクリックで映像のショットに送れます。',
        caption: 'Phasyn Studio の実際の出力 · Qwen‑Image 2.1、Image Studio と同じ t2i‑pc パイプライン · 1152×672 · 1 枚あたりエンドツーエンド約 27 秒（テキストエンコーダー・DiT・VAE は RTX 5080、合成は CPU）',
        chips: ['テキストから画像', '画像から画像', 'マスク編集'],
        removeBackground: '背景除去',
        license: 'Qwen‑Image 2.1 は研究・非商用のライセンス、MiniMax H3 は Community License（地域の制限と利用規定を含む）に従います。商用で使う前に、各ライセンスの条項をご確認ください。',
      },
    },
    architecture: {
      eyebrow: 'DISTRIBUTED',
      title: 'コンポーネントを細かく分けて、選んだマシンで。',
      lead: 'モデルの各コンポーネントは独立したプロセスとして、指定したマシンで動きます。latent や映像などの大きな中間ファイルは、コントローラーを経由せずノード間で直接受け渡されます。',
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
      real: {
        graph: '実際の画面 · Components：fl2va‑pc パイプラインのノードグラフです。te は DGX Spark（GB10）、venc・dit・video は RTX 5080、audio は RTX 3060 で動きます。',
        timeline:
          '実際の画面 · Records：同じパイプラインで実際にレンダリングした 1 回分で、6 ステップの合計は 57.156 秒です。Step Timeline はリソースグループごとに 1 本のトラックを描きます。DGX Spark の GB10、PC の RTX 5080 と RTX 3060、そして CPU。2 台のマシン、3 つの GPU です。',
        inspector: '実際の画面 · Components：dit‑5080 のコンポーネントインスペクターです。コンポーネントごとに起動・停止・再起動でき、1 つの Node で読み込む DiT は一度に 1 つです。',
      },
      runtimes: '現在の実行環境：RTX 50 シリーズ、RTX 30 シリーズ、DGX Spark（GB10）。RTX 40 シリーズ（4090 など）にはまだ対応していません。',
      multi: '複数のマシンを使うのは、1 回のレンダリングのコンポーネントを別々の GPU に分けるためです。現在は一度に 1 つの run を実行し、複数の映像を並列に処理するものではありません。',
      process: {
        title: '1 コンポーネント、1 プロセス',
        body: 'テキストエンコーダー、DiT、映像 VAE、音声 VAE、mux がそれぞれ独立して動き、ロード、精度、オフロードを個別に設定できます。ひとつのモデルが落ちても、アプリ全体が止まることはありません。',
      },
      direct: {
        title: 'ノードからノードへ',
        body: 'latent や映像は FileRef としてノード間を直接移動します。Controller はスケジュールと記録、アップロードしたファイルの提供を担当します。実測では、PC 上の DiT が DGX Spark から 219〜322 KB の条件データを 30〜34 ms で受け取りました。',
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
      runCaption: '実際の画面 · Records：fl2va レンダリング 1 回分の実行記録です。6 ステップすべてが完了し、合計 57.156 秒。いちばん遅いのは RTX 5080 の dit（31.951 秒）でした。',
      compareCaption: 'Records · Compare：最大 8 件の記録を並べて、設定の差分と計測値を比べます。',
      agentTitle: 'エージェントに任せる。スクリプトにもできます。',
      agentBody: 'Phasyn Studio には Agent Skill が付属しています。phasynctl コマンドラインツールと、必要に応じて使える 22 ツールの MCP サーバーです。',
      agentScript: { before: '', code: 'phasynctl runs create / wait / download', after: ' でスクリプトを書けば、まとめて送信し、完了を待ち、結果をダウンロードできます。Video Studio には Batch Render もあります。エージェントも同じツールで確認、比較、調整を行います。' },
      terminalCaption: 'ターミナル：エージェントが phasynctl でシステムを確認し、記録を比較します。',
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: '実測した数字を、そのまま公開します。',
      lead: 'H3 の DiT エンジン 40 種（テキスト・先頭フレーム用 22、参照素材用 18）を、すべて同じ RTX 5080 で計測しました。お手持ちのハードウェアに合った動かし方を選べます。',
      stats: [
        { value: '57.2', unit: 's', label: '音声付き 5.17 秒の映像', detail: 'fl2va · 768×448 · run cfa759df · テキストエンコードは DGX Spark、DiT と映像 VAE は RTX 5080、音声は RTX 3060' },
        { value: '33.2', unit: 's', label: 'テキストから映像の最速 DiT', detail: 'DiT ステップの実時間（ノイズ除去の計算は 26.0 s）· INT8 · PAI 8 ステップ · RTX 5080' },
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
        optimise: { title: 'VAE と DiT の最適化', body: '映像 VAE のエンコードとデコードは、今も負荷が大きすぎます。残りの実験を進めます。' },
      },
      note: 'ArtCraft の機能も参考にしていますが、まだ統合していません。',
    },
    ticker: {
      label: '実測データ',
      items: {
        te: 'テキストエンコード · te‑gb10',
        venc: '映像エンコード · venc‑5080',
        dit: 'DiT · dit‑5080',
        video: '映像 VAE · vae‑5080',
        audio: '音声 VAE · audio‑3060',
        mux: 'Mux · CPU',
        render: '同じ fl2va レンダリング · エンドツーエンド',
        fastest: '最速 t2va DiT ステップ · INT8 PAI 8',
        still: 'Qwen‑Image 2.1 · 1152×672',
        fileRef: 'FileRef DGX → PC',
        metrics: 'Recorder の指標',
        engines: '完走した DiT エンジン',
      },
    },
    closing: {
      title: 'あなたのアイデアを、動く映像に。',
      lead: 'ソースコードとアーキテクチャ解説は、準備ができしだい公開します。最新情報は GitHub と Hugging Face の phasyn でお知らせします。',
      about: 'このプロジェクトについて',
    },
    screens: {
      real: '実際の画面',
      pendingTitle: '実際の画面を取得中',
      pendingBody: 'ここに Phasyn Studio の実際の画面が入ります。',
      callouts: '画面の注記',
      alt: {
        'image-studio-generating': '生成中の Image Studio の実際の画面。Text Conditioning が実行中で、下の新しい take には Generating と表示されています。',
        'image-studio-takes': '生成が終わった Image Studio の実際の画面。ビューアーに使用中の take、下に Takes、右に設定パネルがあります。',
        'render-engine-image': 'Generation Engine パネル。この画像のパイプラインに必要なコンポーネント（テキストエンコーダー・DiT・VAE は RTX 5080、合成は CPU）を個別に起動できます。',
        'video-studio-editor': 'Video Studio の編集画面。ビューアー、Inspector、タイムライン。',
        'prompt-advisor': 'Video Studio の Prompt Fixes & Suggestions。提案ごとに出典が付きます。',
        'references-mentions': 'Video Studio のプロンプトエディター。@ で画像・映像・音声の参照を指定します。',
        'render-engine-three-machines': 'Render Engine。1 回のレンダリングの各コンポーネントと、それを実行するマシン。',
        'render-progress': 'Video Studio でショットをレンダリングしているところ。',
        'timeline-effects': 'Video Studio のタイムライン。クリップにエフェクトが適用されています。',
        'export-dialog': 'Export Sequence ダイアログ。クリップ、合計時間、エンコード設定。',
        'image-to-prompt-result': 'Inference Studio の Image to Prompt。画像のシーン項目と、採点されたプロンプト候補。',
        'components-pipeline-graph': 'Components にある fl2va‑pc パイプラインのノードグラフ。te は DGX Spark（GB10）、venc・dit・video は RTX 5080、audio は RTX 3060 です。',
        'component-inspector-precision': 'Components のコンポーネントインスペクター。dit‑5080 を個別に起動・停止・再起動でき、Node ごとに読み込める DiT は 1 つだけと表示されています。',
        'records-run-steps': 'Records の実行記録。fl2va レンダリング 1 回分の 6 ステップがすべて完了し、合計 57.156 秒でした。Step Timeline はリソースグループごとに 1 本のトラックです。',
        'records-compare': 'Records の Compare。複数の記録の設定差分と計測値を並べて比較します。',
        'terminal-phasynctl': 'ターミナルで、エージェントが phasynctl を使ってシステムを確認し、記録を比較します。',
      },
      hotspots: {
        'generating.flow': '生成の流れ：Prompt → Generation → Refine/Library',
        'generating.te': 'まずプロンプトをテキストエンコード',
        'generating.take': '新しい take を生成中',
        'takes.inUse': '使用中の take',
        'takes.strip': '生成のたびに take が残ります',
        'takes.video': '同じプロジェクトのまま Video Studio へ',
        'run.elapsed': '6/6 ステップ完了 · 57.156 s',
        'run.slowest': 'いちばん遅いステップ：dit · 31.951 s',
        'run.timeline': 'リソースグループごとに 1 トラック',
        'run.compare': 'この実行の記録を比較',
        'run.te': 'te · 1.333 s · DGX Spark（GB10）',
        'run.audio': 'audio · 854 ms · RTX 3060',
        'run.mux': 'mux · 297 ms · CPU',
        'graph.te': 'te · DGX Spark（GB10）',
        'graph.dit': 'dit · RTX 5080',
        'graph.audio': 'audio · RTX 3060',
      },
    },
  },
  en: {
    hero: {
      eyebrow: 'PHASE · FRAME · SYNTHESIS',
      title: 'From storyboard to synthesis.',
      lead: ['A personal AI filmmaking workbench.', 'Text, image and video in one controllable pipeline — running on your own machines.'],
      strip: 'Real Phasyn Studio output · Qwen‑Image 2.1 · 1152×672 · about 27 s each (RTX 5080)',
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
      beats: [
        { text: 'Most video generation services are bad. And expensive.', hot: ['bad', 'expensive'] },
        { text: 'Credit systems bleed you dry.', hot: ['bleed you dry'] },
        { text: 'You regenerate again and again, and it’s still slow.', hot: ['again and again', 'still slow'] },
        { text: 'Sloppy commercial products — and you pay for them.', hot: ['Sloppy', 'you pay for them'] },
        { text: 'Local tools like ComfyUI ignore how people actually work, and how fast it could run.', hot: ['how people actually work', 'how fast it could run'] },
      ],
      final: { text: 'So I built my own.', hot: 'built my own' },
      illustration: 'Illustration',
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
          body: 'In Image Studio, generate with Qwen‑Image 2.1, restyle with one to four reference images, or paint a mask to change one region — then send the frame you like to a video shot.',
          points: ['Text to image', 'Image to image', 'Masked edit'],
        },
        {
          label: 'Video',
          title: 'Bring It to Life — Sound Included.',
          body: 'Text, image, video and audio can all be references. MiniMax H3 generates the picture and synchronized sound together.',
          points: ['t2va · text', 'fl2va · first frame', 'ref2va · references'],
        },
      ],
      notes: [
        'The real Image Studio: once you send a prompt, Text Conditioning encodes it first.',
        'The real Image Studio: the finished take, marked In Use in the viewer.',
        'Real output: with this Qwen‑Image 2.1 still as the first frame, H3 fl2va generated the clip, sound included (run cfa759df).',
      ],
      firstFrame: 'First frame',
      clipLabel: 'The fl2va clip generated from this first frame',
      loudness: 'The web copy is loudness-normalized; the raw output is about −37 to −50 LUFS, AAC 32 kHz.',
      realBadge: 'Real output',
      caption:
        'The interface is the real Phasyn Studio (English UI). The still and the clip are real output. Still: Qwen‑Image 2.1 through t2i‑pc, the pipeline Image Studio uses (1152×672, about 27 s end to end: text encoder, DiT and VAE on the RTX 5080, compositing on the CPU). Clip: H3 fl2va with that still as its first frame (768×448, 24 fps, 124 frames = 5.17 s, with generated sound). It is run cfa759df, the run in the Records screen below: 57.2 s end to end, with text encoding on DGX Spark GB10, DiT and video decode on RTX 5080, audio decode on RTX 3060.',
      sound: 'Turn Sound On',
      mute: 'Turn Sound Off',
      play: 'Play Clip',
      pause: 'Pause Clip',
      replay: 'Replay',
    },
    features: {
      eyebrow: 'FEATURES',
      title: 'Made for Real Work.',
      lead: 'Every feature started as something I actually needed.',
      reverse: {
        title: 'Reverse Prompt',
        body: 'Qwen3‑VL breaks an image into an eight-part scene and candidate prompts. Qwen‑Image renders them again and scores every part, to show how closely the prompt matches.',
        note: 'Video reverse prompting is implemented but not yet verified.',
      },
      swap: {
        title: 'One-Click Character Swap',
        body: 'Five steps: source video, characters, scene-cut detection, segment plan, output. Designed to convert a video of about a minute in batches and keep its original audio.',
        note: 'Only use material you have the rights to, and never impersonate a real person.',
      },
      advisor: {
        title: 'Prompt Advisor',
        body: '74 rules check your prompt: 45 from MiniMax’s official guides, 21 from the installed code and 8 from a prompt-writing guide. 21 offer a one-click fix, previewed as a diff before you apply it.',
        sources: 'Every rule cites its source',
      },
      timeline: {
        title: 'Timeline and Effects',
        body: 'Edit, add effects and render in one place: split, trim, snap, cross dissolves, fades, pitch-preserving speed, color and titles — then export an MP4 with FFmpeg.',
        spec: 'Measured output today: 768×448, 24 fps, 124 frames (5.17 s), AAC 32 kHz stereo. Export: MP4 (H.264 + AAC, fully re-encoded; CRF 18 / 23 / 28 presets).',
      },
      imageStudio: {
        title: 'Image Studio',
        body: 'Text to image, image to image with up to four references, and masked edits. Every generation stays as a take you can compare side by side and send to a video shot.',
        caption: 'Real Phasyn Studio output · Qwen‑Image 2.1 through t2i‑pc, the pipeline Image Studio uses · 1152×672 · about 27 s each end to end (text encoder, DiT and VAE on the RTX 5080, compositing on the CPU)',
        chips: ['Text to image', 'Image to image', 'Masked edit'],
        removeBackground: 'Remove background',
        license: 'Qwen‑Image 2.1 is licensed for research and non-commercial use; MiniMax H3 follows its Community License, including regional restrictions and a usage policy. Check the license terms before any commercial use.',
      },
    },
    architecture: {
      eyebrow: 'DISTRIBUTED',
      title: 'Small Components. Your Machines.',
      lead: 'Every model component runs as its own process, on the machine you choose. Large intermediates (latents, video) move node to node, not through the controller.',
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
      real: {
        graph: 'Real screen · Components: the fl2va‑pc pipeline graph. te on the DGX Spark (GB10); venc, dit and video on the RTX 5080; audio on the RTX 3060.',
        timeline:
          'Real screen · Records: one real render of that pipeline, 6 steps in 57.156 s. The Step Timeline draws one track per resource group: the GB10 in the DGX Spark, the RTX 5080 and RTX 3060 in the PC, and the CPU — three GPUs on two machines.',
        inspector: 'Real screen · Components: the dit‑5080 component inspector. Each component starts, stops and restarts on its own; a Node loads one DiT at a time.',
      },
      runtimes: 'Runtimes today: RTX 50 series, RTX 30 series and DGX Spark (GB10). No RTX 40 series runtime yet.',
      multi: 'Multiple machines split the components of one render across GPUs. Today it runs one run at a time — not several videos in parallel.',
      process: {
        title: 'One Process per Component',
        body: 'Text encoder, DiT, video VAE, audio VAE and mux each run on their own, with their own load, precision and offload settings. A crashing model doesn’t take the app down with it.',
      },
      direct: {
        title: 'Node to Node',
        body: 'Latents and video travel between nodes as FileRefs; the Controller schedules, keeps records and serves the files you upload. Measured: the DiT on the PC received 219–322 KB of conditioning from the DGX Spark in 30–34 ms.',
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
      runCaption: 'Real screen · Records: the run details of one fl2va render. All 6 steps done in 57.156 s; the slowest was dit on the RTX 5080 (31.951 s).',
      compareCaption: 'Records · Compare: up to eight recordings side by side — settings differences and measured values.',
      agentTitle: 'Hand It to an Agent — or a Script.',
      agentBody: 'Phasyn Studio ships with an agent skill: the phasynctl CLI plus an optional MCP server with 22 tools.',
      agentScript: { before: 'Script ', code: 'phasynctl runs create / wait / download', after: ' to submit in batches, wait for completion and download the results; Video Studio also has Batch Render. An agent uses the same tools to check, compare and tune.' },
      terminalCaption: 'Terminal: an agent uses phasynctl to check the system and compare runs.',
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: 'Measured. Published As Is.',
      lead: '40 H3 DiT engines (22 for text and first frame, 18 for references), all benchmarked on the same RTX 5080 — so you can choose a setup that fits your hardware.',
      stats: [
        { value: '57.2', unit: 's', label: 'A 5.17-second clip with sound', detail: 'fl2va · 768×448 · run cfa759df · text encoding on DGX Spark, DiT and video VAE on RTX 5080, audio on RTX 3060' },
        { value: '33.2', unit: 's', label: 'Fastest text-to-video DiT', detail: 'DiT step wall time (denoise compute 26.0 s) · INT8 · PAI 8-step · RTX 5080' },
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
        optimise: { title: 'VAE and DiT Optimization', body: 'Video VAE encode and decode is still too heavy. A few experiments to go.' },
      },
      note: 'Ideas from ArtCraft are on the list too — not integrated yet.',
    },
    ticker: {
      label: 'Measured values',
      items: {
        te: 'Text encode · te‑gb10',
        venc: 'Video encode · venc‑5080',
        dit: 'DiT · dit‑5080',
        video: 'Video VAE · vae‑5080',
        audio: 'Audio VAE · audio‑3060',
        mux: 'Mux · CPU',
        render: 'Same fl2va render · end to end',
        fastest: 'Fastest t2va DiT step · INT8 PAI 8',
        still: 'Qwen‑Image 2.1 · 1152×672',
        fileRef: 'FileRef DGX → PC',
        metrics: 'Recorder metrics',
        engines: 'DiT engines completed',
      },
    },
    closing: {
      title: 'Your ideas, in motion.',
      lead: 'Source code and architecture notes will be published once they’re ready. Follow phasyn on GitHub and Hugging Face to hear first.',
      about: 'About the Project',
    },
    screens: {
      real: 'Real screen',
      pendingTitle: 'Real capture pending',
      pendingBody: 'A real Phasyn Studio screen goes here.',
      callouts: 'Callouts',
      alt: {
        'image-studio-generating': 'Image Studio mid-generation: Text Conditioning is running and the new take shows Generating.',
        'image-studio-takes': 'Image Studio after generation: the viewer shows the take in use, with the Takes strip below and the settings panel on the right.',
        'render-engine-image': 'The Generation Engine sheet: the components this image’s pipeline needs (text encoder, DiT and VAE on the RTX 5080, compositing on the CPU), each started on its own.',
        'video-studio-editor': 'Video Studio’s editor: viewer, inspector and timeline.',
        'prompt-advisor': 'Prompt Fixes & Suggestions in Video Studio, each finding with its source.',
        'references-mentions': 'Video Studio’s prompt editor, with @ references to images, video and audio.',
        'render-engine-three-machines': 'The Render Engine sheet: each component of one render and the machine it runs on.',
        'render-progress': 'Video Studio rendering a shot.',
        'timeline-effects': 'Video Studio’s timeline, with effects on the clips.',
        'export-dialog': 'The Export Sequence dialog: clips, total duration and encoding settings.',
        'image-to-prompt-result': 'Image to Prompt in Inference Studio: an image’s scene sections and scored candidate prompts.',
        'components-pipeline-graph': 'The fl2va‑pc pipeline graph in Components: te on the DGX Spark (GB10); venc, dit and video on the RTX 5080; audio on the RTX 3060.',
        'component-inspector-precision': 'The component inspector in Components: dit‑5080 starts, stops and restarts on its own, with a note that each Node loads one DiT at a time.',
        'records-run-steps': 'A real run in Records: all 6 steps of one fl2va render done in 57.156 s, with a Step Timeline that draws one track per resource group.',
        'records-compare': 'Compare in Records: settings differences and measured values of recordings side by side.',
        'terminal-phasynctl': 'A terminal where an agent uses phasynctl to check the system and compare runs.',
      },
      hotspots: {
        'generating.flow': 'Flow: Prompt → Generation → Refine/Library',
        'generating.te': 'The prompt is text-encoded first',
        'generating.take': 'A new take is generating',
        'takes.inUse': 'The take in use',
        'takes.strip': 'Every generation stays as a take',
        'takes.video': 'Same project, on to Video Studio',
        'run.elapsed': '6/6 steps · 57.156 s',
        'run.slowest': 'Slowest step: dit · 31.951 s',
        'run.timeline': 'One track per resource group',
        'run.compare': 'Compare this run’s recordings',
        'run.te': 'te · 1.333 s · DGX Spark (GB10)',
        'run.audio': 'audio · 854 ms · RTX 3060',
        'run.mux': 'mux · 297 ms · CPU',
        'graph.te': 'te · DGX Spark (GB10)',
        'graph.dit': 'dit · RTX 5080',
        'graph.audio': 'audio · RTX 3060',
      },
    },
  },
};
