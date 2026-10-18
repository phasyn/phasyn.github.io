import type { Copy } from '../../i18n/locale.tsx';
import type { ClipKey } from './data.ts';
import type { HotspotId, ScreenKey } from './screens.ts';

// Home page copy. zh-hant is the source language; ja uses です・ます; en uses US spelling and Apple HIG title case for headings
// and buttons. Product, area, model and component names stay untranslated. Facts and numbers follow work/product/product-analysis.md,
// studio/gen/RUNS.md and src/features/home/data.ts; numbers about a real screen are the ones that screen shows. Dates are absolute
// (never "today"). Planned work is always labelled. Structure follows the marketing review (work/reviews/marketing, copy-deck.md).

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

/** A command inside a sentence: rendered as `<code>` between the two text parts. */
interface CodeLine {
  before: string;
  code: string;
  after: string;
}

/** One manifesto line; `hot` are the exact substrings tinted as pain points (in reading order). */
export interface ManifestoBeat {
  text: string;
  hot: string[];
}

export type FeatureKey = 'imageStudio' | 'advisor' | 'references' | 'timeline' | 'imageToPrompt';
export type LabStatus = 'inTesting' | 'unverified' | 'coming' | 'designGoal' | 'inDevelopment' | 'planned';

export interface HomeCopy {
  hero: {
    /** Brand line in the eyebrow position (the old headline). */
    brand: string;
    title: string;
    /** Two sentences, shown as two lines. */
    lead: [string, string];
    watch: string;
    showcase: string;
    numbers: string;
    /** Caption of the real stills in the hero's film strip. */
    strip: string;
    pause: string;
    play: string;
  };
  /** Four plain proof numbers under the hero. */
  proof: {
    label: string;
    items: { value: string; unit: string; label: string }[];
    footnote: string;
  };
  /** "Made with Phasyn Studio": the intro film and the real clips with their receipts. */
  made: SectionHeading & {
    videoTitle: string;
    filmNote: string;
    wallTitle: string;
    clips: Record<ClipKey, string>;
    /** `{seed}` and `{s}` come from data.ts. */
    receipt: string;
    machines: string;
    play: string;
    pause: string;
    seeAll: string;
    footnote: string;
  };
  manifesto: {
    eyebrow: string;
    heading: string;
    /** The pain points, in the author's words (condensed). */
    beats: ManifestoBeat[];
    /** The turn: `hot` is the brand-gradient keyword inside `text`. */
    final: { text: string; hot: string };
    /** One line of evidence under the turn. */
    proof: string;
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
  /** Verified features only; a card shows a real screen only once its capture exists. */
  features: SectionHeading & {
    cards: Record<FeatureKey, TextBlock>;
    /** Image Studio modes as tags (not headline claims). */
    tags: string[];
    /** Measured output and export format, under the timeline card. */
    spec: string;
  };
  /** "Under the hood": architecture and diagnostics in one chapter. */
  hood: SectionHeading & {
    caption: string;
    process: TextBlock;
    inspectorCaption: string;
    direct: TextBlock;
    metrics: TextBlock;
    agents: { title: string; body: string; tools: string; dryRun: CodeLine; evidence: string; script: CodeLine };
    differs: { title: string; items: string[] };
    runtimes: string;
    multi: string;
    details: string;
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
    graphCaption: string;
    runCaption: string;
    tour: string;
    pause: string;
    play: string;
  };
  benchmarks: SectionHeading & {
    stats: { value: string; unit: string; label: string; detail: string }[];
    footnote: string;
    cta: string;
  };
  /** What is not shipped yet, one line each, every item with its status. */
  lab: SectionHeading & {
    unverified: string;
    items: { status: LabStatus; title: string; body: string }[];
    note: string;
    cta: string;
  };
  /** "Can I use it today?" — hardware, cost, licences, timing. */
  usable: {
    eyebrow: string;
    title: string;
    items: { label: string; body: string }[];
    /** Phasyn Studio is a framework: it bundles no model weights. */
    framework: string;
    /** Label before the two licence links. */
    licenses: string;
  };
  closing: {
    title: string;
    lead: string;
    github: string;
    huggingface: string;
    email: string;
    about: string;
  };
  /** Real-screen frames (RealScreen): badge, pending frame, alt text per screen, callout labels, enlarge view. */
  screens: {
    real: string;
    pendingTitle: string;
    pendingBody: string;
    callouts: string;
    enlarge: string;
    close: string;
    tapHint: string;
    alt: Record<ScreenKey, string>;
    hotspots: Record<HotspotId, string>;
  };
}

export const HOME: Copy<HomeCopy> = {
  'zh-hant': {
    hero: {
      brand: '從分鏡，到成片。',
      title: '用自己的 GPU，做 AI 影片。',
      lead: ['寫一句提示詞，先定下畫面，再渲染成連聲音都有的鏡頭。', '文字、圖片、影片在同一條流程裡，每一步都看得見，也都有實測時間。'],
      watch: '觀看影片',
      showcase: '看它做出了什麼',
      numbers: '看實測數字',
      strip: '實際輸出 · 1152×672 · 每張約 27 秒（RTX 5080）',
      pause: '暫停背景動畫',
      play: '播放背景動畫',
    },
    proof: {
      label: '實測數字',
      items: [
        { value: '≈27', unit: 's', label: '一張 1152×672 靜態圖，端對端' },
        { value: '57–76', unit: 's', label: '一段 5.17 秒有聲影片，端對端' },
        { value: '2 · 3', unit: '', label: '一次渲染：兩台機器、三顆 GPU' },
        { value: '37/40', unit: '', label: '在同一張 RTX 5080 上跑完的 H3 DiT 變體' },
      ],
      footnote: '2026-10-18 實測。靜態圖：每一步都在 RTX 5080。影片：4 次 fl2va 渲染，文字編碼在 DGX Spark（GB10），DiT 與影片解碼在 RTX 5080，音訊在 RTX 3060。',
    },
    made: {
      eyebrow: 'MADE WITH PHASYN STUDIO',
      title: '一個角色，13個實際輸出。',
      lead: '原創角色 The Courier：從角色設定稿、靜態圖，到有聲音的影片片段，全部用 Phasyn Studio 在兩台機器上渲染。總渲染時間大約 11 分鐘。',
      videoTitle: 'Phasyn Studio 介紹影片',
      filmNote: '介紹影片：從文字到圖片，再到有聲影片，約 1 分鐘。',
      wallTitle: '四張靜態圖，四段有聲影片。',
      clips: { rain: '雨夜的巷子', ocean: '極光下的海', portrait: '在微光中醒來', cliff: '黎明的懸崖' },
      receipt: 'fl2va · seed {seed} · 端對端 {s} 秒',
      machines: '文字 GB10 · DiT 與影片 RTX 5080 · 音訊 RTX 3060',
      play: '播放',
      pause: '暫停',
      seeAll: '看全部成果',
      footnote: '時間是 Controller 記錄的端對端時間，不含模型啟動（每次切換 11–46 秒）。影片原始輸出為 768×448；網頁版只做了響度正規化（原始約 −37～−50 LUFS、AAC 32 kHz）。',
    },
    manifesto: {
      eyebrow: 'WHY',
      heading: '為什麼要自己開發？',
      beats: [
        { text: '市面上的影片生成服務，又爛又貴，還要你買點數。', hot: ['又爛又貴', '還要你買點數'] },
        { text: '本地方案，例如 ComfyUI，完全不考慮真正的操作需求與加速需求。', hot: ['操作需求', '加速需求'] },
      ],
      final: { text: '所以，我決定自己開發。', hot: '自己開發' },
      proof: '每個模型元件都是一支獨立程式，放在我選的 GPU 上；每一次呼叫都有紀錄。',
      illustration: '示意（不是任何真實服務的數字）',
      signature: '開發者 DennySORA',
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
          body: '在 Image Studio 以 Qwen‑Image 2.1 生成圖片。每次生成都留成一個 take，可以並排比較，再挑一張當影片鏡頭的首幀。',
          points: ['文字生成圖片', '圖生圖', '遮罩編輯'],
        },
        {
          label: '影片',
          title: '讓它動起來，連聲音一起。',
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
        '介面是 Phasyn Studio 的實際畫面（英文介面）。靜態圖與影片是實際輸出。靜態圖：以 Image Studio 所用的 t2i‑pc 管線、Qwen‑Image 2.1 生成（1152×672，端對端約 27 秒：文字編碼、DiT 與 VAE 在 RTX 5080，合成在 CPU）。影片：以這張圖為首幀，用 H3 fl2va 生成（768×448、24 fps、124 幀＝5.17 秒、含生成的聲音）。它就是下方 Records 畫面裡的 run cfa759df，端對端 57.2 秒：文字編碼在 DGX Spark GB10，DiT 與影片解碼在 RTX 5080，音訊解碼在 RTX 3060。',
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
      cards: {
        imageStudio: { title: 'Image Studio', body: '用文字生成圖片；每次生成都留成一個 take，可以並排比較，再拿來當影片鏡頭的首幀。' },
        advisor: { title: 'Prompt Advisor', body: '74 條規則邊寫邊檢查：45 條來自 MiniMax 官方指南、21 條來自實際安裝的程式碼、8 條來自寫作指南。其中 21 條可以一鍵修正，套用前先看差異。每條規則都標出來源。' },
        references: { title: '@ 參考素材', body: '用 @Image1、@Video1、@Audio1 指定參考素材，直接對應到 H3 自己的標籤。' },
        timeline: { title: '時間軸與匯出', body: '分割、吸附、交叉溶解、變速、調色、標題，最後用 FFmpeg 匯出 MP4。' },
        imageToPrompt: { title: '圖片反推提示詞', body: '丟一張圖進去，DGX Spark 上的視覺模型會寫回場景描述與候選提示詞。' },
      },
      tags: ['文字生成圖片', '圖生圖', '遮罩編輯'],
      spec: '2026-10-18 實測的輸出：768×448、24 fps、124 幀（5.17 秒），聲音 AAC 32 kHz 立體聲。匯出：MP4（H.264＋AAC，完整重新編碼；畫質預設 CRF 18／23／28）。',
    },
    hood: {
      eyebrow: 'UNDER THE HOOD',
      title: '一次渲染，兩台機器，三顆 GPU。',
      lead: '每個模型元件都是一支獨立程式（process），放在你指定的機器上。Recorder 記下每一步的時間；沒量到的就寫「Not measured」，絕不填 0。',
      caption: '實際畫面 · Records：run cfa759df，6/6 個步驟，共 57.156 秒。文字編碼 1.333 秒在 GB10；DiT 31.951 秒與影片解碼 22.359 秒在 RTX 5080；音訊 854 毫秒在 RTX 3060；封裝（mux）297 毫秒在 CPU。',
      process: { title: '一個元件，一支程式', body: '文字編碼、DiT、VAE 與封裝（mux）各自執行，精度與卸載可以逐一設定。某個模型當掉，也不會拖垮整個 App。' },
      inspectorCaption: '實際畫面 · Components：dit‑5080 的元件檢視器。每個元件都能單獨啟動、停止、重新啟動；同一個節點一次只載入一個 DiT。',
      direct: { title: '節點之間直接傳', body: 'latent、影片這類大型中間檔以 FileRef 在機器之間直接搬，不經過 Controller；Controller 負責排程、紀錄，並提供你上傳的檔案。實測：PC 上的 DiT 從 DGX Spark 取得 219–322 KB 的條件資料，只花 30–34 ms。' },
      metrics: { title: '每次執行 102 項指標', body: 'CPU 與 GPU 時間、VRAM、傳輸量。2–8 份紀錄可以並排比較，也能匯出 JSONL、CSV、ZIP 或 trace。' },
      agents: {
        title: '也為 Agent 而做。',
        body: '內附的 Agent Skill 提供 phasynctl 命令列工具，以及可選用的 MCP 伺服器（22 個工具）。',
        tools: 'phasyn_doctor · phasyn_run_create · phasyn_runs_compare · phasyn_recordings_compare …',
        dryRun: { before: '', code: 'phasynctl runs create --dry-run', after: ' 會在上傳任何東西之前，先用即時的 schema 檢查每一個參數。' },
        evidence: '實驗 06 用 Studio 介面跑一次、用 MCP 跑一次，兩次輸出逐位元相同（bit-identical）。',
        script: { before: '用 ', code: 'phasynctl runs create / wait / download', after: ' 寫腳本，就能批次送出、等完成、下載結果；Video Studio 也有 Batch Render。' },
      },
      differs: {
        title: '和其他工具哪裡不一樣',
        items: [
          '節點式工作流程工具通常在一個程序裡執行整張圖；Phasyn Studio 讓每個模型元件（文字編碼、DiT、VAE、封裝）各自是一支獨立程式，所以當掉不會擴散，一次渲染也能橫跨多台機器。',
          '多後端的前端是把整個工作分派到不同機器；Phasyn Studio 拆的是同一次渲染：文字編碼在 DGX Spark，DiT 在 RTX 5080，音訊在 RTX 3060。',
          '雲端服務目前解析度更高；Phasyn Studio 跑在你自己的硬體上，不用點數，而且記下每一秒花在哪裡。',
        ],
      },
      runtimes: '目前的執行環境：RTX 50 系列、RTX 30 系列、DGX Spark（GB10）；RTX 40 系列（例如 4090）還沒有對應的執行環境。',
      multi: '多機的用途是把同一次渲染的各個元件分到不同 GPU；目前一次執行一個 run，不是多支影片平行運算。',
      details: '展開工程細節：架構圖與實際畫面',
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
      graphCaption: '實際畫面 · Components：fl2va‑pc 管線的節點圖。te 在 DGX Spark（GB10）；venc、dit 與 video 在 RTX 5080；audio 在 RTX 3060。',
      runCaption: '實際畫面 · Records：一次 fl2va 渲染的執行紀錄。6 個步驟全部完成，共 57.156 秒；最慢的是 RTX 5080 上的 dit（31.951 秒）。',
      tour: '在操作導覽裡看完整管線',
      pause: '暫停架構圖動畫',
      play: '播放架構圖動畫',
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: '實測、公開，連失敗也列出來。',
      lead: '40 個 H3 DiT 變體，在同一張 RTX 5080 上計時：37 個跑完，3 個 NF4 變體沒能載入，它們也在表格裡。',
      stats: [
        { value: '57–76', unit: 's', label: '一段 5.17 秒有聲影片', detail: 'fl2va · 2026-10-18 實測 4 次 · 文字 DGX Spark · DiT 與影片 RTX 5080 · 音訊 RTX 3060' },
        { value: '33.2', unit: 's', label: '最快的 DiT 階段（冷載入後第一次呼叫）', detail: '其中去噪運算 26.0 s · INT8 · PAI 8 步 · RTX 5080' },
        { value: '37/40', unit: '', label: '跑完的 DiT 變體', detail: '同一張 RTX 5080，共 3.2 小時 · 3 個 NF4 變體載入失敗，照實列為失敗' },
      ],
      footnote: '每個速度數字，都寫明每一步在哪台機器上跑。',
      cta: '找出適合你硬體的跑法',
    },
    lab: {
      eyebrow: 'IN THE LAB',
      title: '還沒推出的，直接說清楚。',
      lead: '測試中、即將加入、設計目標，每一項都標好狀態。開發順序以我自己的需求為主。',
      unverified: '已實作・未驗證',
      items: [
        { status: 'inTesting', title: '一鍵換角', body: '五步精靈已經做好，還沒跑過完整影片。請只使用你有權使用的素材，不要冒用真人身分。' },
        { status: 'unverified', title: '影片反推提示詞', body: '程式已經寫好，還沒用真正的模型驗證過。' },
        { status: 'coming', title: '去背', body: '在 Image Studio 裡直接去背。' },
        { status: 'designGoal', title: '租一台機器，用一兩個小時', body: '部署、啟動、處理、匯出、關機，用完就關。還沒打包成現成流程。' },
        { status: 'inDevelopment', title: '多層級渲染 · TTS 與聲音轉換 · 超解析與補幀', body: '先用簡單畫面快速定鏡頭，再套入人物、出成片；自己開發的 TTS 系統；幾種超解析與補幀技術正在整合。' },
        { status: 'planned', title: '生成外掛與滑桿 · 擴充模型支援 · VAE 與 DiT 最佳化', body: '用滑桿與 LoRA 風格做更細的控制；串接第三方模型，例如 Suno 的音樂；影片 VAE 的編碼與解碼負擔仍然太重。' },
      ],
      note: '另外也參考了 ArtCraft 的相關功能，目前還沒有整合。',
      cta: '追蹤進度',
    },
    usable: {
      eyebrow: 'CAN I USE IT?',
      title: '現在能用嗎？',
      items: [
        { label: '下載', body: '還不行。目前沒有下載、沒有安裝程式，也不用註冊或付費。原始碼整理好後以 Apache-2.0 公開。' },
        { label: '電腦', body: '需要 NVIDIA 顯示卡。執行環境目前只支援 RTX 50 系列、RTX 30 系列與 DGX Spark（GB10）；RTX 40 系列與 Mac 都還不支援。用參考素材生成影片時，16 GB 顯示卡已經很勉強（實測整卡峰值 15.91 GiB）。' },
        { label: '費用', body: '軟體免費；模型權重不隨專案提供，需自行取得並遵守各自授權。' },
        { label: '能不能商用', body: 'Qwen‑Image 2.1 只能用於研究與非商業用途；MiniMax H3 有地區與使用規範。有營利的頻道、業配或接案，請先確認授權。' },
        { label: '想第一時間知道', body: '在 GitHub 或 Hugging Face 追蹤 phasyn，或寫信到 phasyn@phasyn.dev。' },
      ],
      framework: 'Phasyn Studio 是一個框架：不隨附、也不散布任何模型權重；你自備模型，並依各自的授權使用。',
      licenses: '授權原文',
    },
    closing: {
      title: '讓你的想法動起來。',
      lead: '原始碼與架構說明即將公開。在 GitHub 追蹤 phasyn，發佈時第一時間知道；新的影片素材放在 Hugging Face；有想法也歡迎直接寫信。',
      github: '在 GitHub 追蹤',
      huggingface: '在 Hugging Face 追蹤',
      email: '寫信給我',
      about: '關於這個專案',
    },
    screens: {
      real: '實際畫面',
      pendingTitle: '實際畫面擷取中',
      pendingBody: '這裡會放上 Phasyn Studio 的實際畫面。',
      callouts: '畫面標註',
      enlarge: '放大檢視',
      close: '關閉',
      tapHint: '點一下看完整畫面',
      alt: {
        'image-studio-generating': 'Image Studio 生成中的實際畫面：Text Conditioning 正在執行，下方的新 take 顯示 Generating。',
        'image-studio-takes': 'Image Studio 生成完成的實際畫面：檢視器顯示選用中的 take，下方是 Takes 列，右側是設定面板。',
        'render-engine-image': 'Generation Engine 面板：這張圖的管線需要的元件（文字編碼、DiT 與 VAE 在 RTX 5080，合成在 CPU），每個都能單獨啟動。',
        'video-studio-editor': 'Video Studio 的編輯畫面：檢視器、Inspector 與時間軸。',
        'prompt-advisor': 'Video Studio 的 Prompt Fixes & Suggestions：每條建議都附上來源。',
        'references-mentions': 'Video Studio 的提示詞編輯器，用 @ 指定圖片、影片與聲音參考。',
        'render-engine-three-machines': 'Render Engine：一次渲染的每個元件，以及它在哪台機器上執行。',
        'render-progress': 'Video Studio 正在渲染一個鏡頭。',
        'timeline-effects': 'Video Studio 的時間軸，片段上套用了效果。',
        'export-dialog': 'Export Sequence 對話框：片段、總長度與編碼設定。',
        'image-to-prompt-result': 'Inference Studio 的 Image to Prompt：一張圖的場景段落與評分過的候選提示詞。',
        'components-pipeline-graph': 'Components 裡 fl2va‑pc 管線的節點圖：te 在 DGX Spark（GB10），venc、dit 與 video 在 RTX 5080，audio 在 RTX 3060。',
        'component-inspector-precision': 'Components 的元件檢視器：dit‑5080 可以單獨啟動、停止與重新啟動，並提示每個節點一次只能載入一個 DiT。',
        'records-run-steps': 'Records 的實際執行紀錄：一次 fl2va 渲染的 6 個步驟全部完成，共 57.156 秒；Step Timeline 為每個資源群組畫一條軌道。',
        'records-compare': 'Records 的 Compare：並排比較多筆紀錄的設定差異與量測值。',
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
      brand: '絵コンテから、完成映像まで。',
      title: 'AI 映像制作を、自分の GPU で。',
      lead: ['プロンプトを書き、画を決めて、音付きのショットに仕上げます。', 'テキスト・画像・動画をひとつのパイプラインで扱い、すべてのステップの処理時間を記録します。'],
      watch: '映像を見る',
      showcase: '作例を見る',
      numbers: '実測値を見る',
      strip: '実際の出力 · 1152×672 · 1 枚約 27 秒（RTX 5080）',
      pause: '背景アニメーションを一時停止',
      play: '背景アニメーションを再生',
    },
    proof: {
      label: '実測値',
      items: [
        { value: '≈27', unit: 's', label: '1152×672 の静止画 1 枚、エンドツーエンド' },
        { value: '57–76', unit: 's', label: '音声付き 5.17 秒の動画 1 本、エンドツーエンド' },
        { value: '2 · 3', unit: '', label: '1 回のレンダリングに 2 台・3 GPU' },
        { value: '37/40', unit: '', label: '1 枚の RTX 5080 で完走した H3 DiT エンジン' },
      ],
      footnote: '2026-10-18 に実測。静止画は全ステップを RTX 5080 で実行しました。動画は fl2va レンダリング 4 回で、テキストエンコードを DGX Spark（GB10）、DiT と映像デコードを RTX 5080、音声を RTX 3060 で実行しています。',
    },
    made: {
      eyebrow: 'MADE WITH PHASYN STUDIO',
      title: 'ひとりのキャラクター、13の実際の出力。',
      lead: 'オリジナルキャラクター The Courier の設定画から、静止画、音付きの動画クリップまで、すべて Phasyn Studio で 2 台のマシンを使って生成しました。レンダリング時間は合計で約 11 分です。',
      videoTitle: 'Phasyn Studio 紹介映像',
      filmNote: 'テキストから画像、そして音声付きの映像になるまでを、約 1 分の映像で紹介します。',
      wallTitle: '4 枚の静止画から、音付きの動画を 4 本。',
      clips: { rain: '雨の夜の路地', ocean: 'オーロラの海', portrait: '光の粒の中で目覚める', cliff: '夜明けの崖' },
      receipt: 'fl2va · seed {seed} · エンドツーエンド {s} 秒',
      machines: 'テキスト GB10 · DiT と映像 RTX 5080 · 音声 RTX 3060',
      play: '再生',
      pause: '一時停止',
      seeAll: '作例をすべて見る',
      footnote: '時間はコントローラーが記録したエンドツーエンドの値で、モデルの起動（切り替えごとに 11〜46 秒）は含みません。動画の出力解像度は 768×448 です。Web 版はラウドネスの正規化のみ行っています（元の出力は約 −37〜−50 LUFS、AAC 32 kHz）。',
    },
    manifesto: {
      eyebrow: 'WHY',
      heading: 'なぜ自分で作ったのか',
      beats: [
        { text: '市販の映像生成サービスは、質が悪くて高いうえに、クレジット制です。', hot: ['質が悪くて高い', 'クレジット制'] },
        { text: 'ComfyUI のようなローカルツールは、実際の操作性も高速化も考えていません。', hot: ['操作性', '高速化'] },
      ],
      final: { text: 'だから、自分で作ることにしました。', hot: '自分で作る' },
      proof: 'モデルのコンポーネントごとに独立したプロセスを、自分で選んだ GPU で動かし、すべての呼び出しを記録します。',
      illustration: 'イメージ（実在のサービスの数値ではありません）',
      signature: 'DennySORA（開発者）',
      readMore: '開発者の言葉を読む',
    },
    pipeline: {
      eyebrow: 'PIPELINE',
      title: 'テキストも、画像も、動画も、ひとつの流れで。',
      lead: 'ひとつのプロンプトから、音付きの動画まで。どのステップも見えて、どのステップも調整できます。',
      stepsLabel: 'パイプラインのステップ',
      steps: [
        {
          label: 'テキスト',
          title: 'ひとことから、始めます。',
          body: 'プロンプトを書きます。Image Studio はそこから画を生成し、Video Studio では @Image1・@Video1・@Audio1 で参照素材を指定できます。スニペット、ブロック表示、整形ツールもすぐ手元にあります。',
          points: ['プロンプト', '@ 参照素材', 'スニペット'],
        },
        {
          label: '画像',
          title: 'まず、絵を決めます。',
          body: 'Image Studio で Qwen‑Image 2.1 を使って画像を生成します。生成のたびに take が残り、並べて比べてから、動画ショットの先頭フレームにする 1 枚を選べます。',
          points: ['テキストから画像', '画像から画像', 'マスク編集'],
        },
        {
          label: '動画',
          title: '動かします。音も一緒に。',
          body: 'テキスト、画像、動画、音声を参照にできます。MiniMax H3 が、映像と同期した音声を同時に生成します。',
          points: ['t2va · テキスト', 'fl2va · 先頭フレーム', 'ref2va · 参照素材'],
        },
      ],
      notes: [
        'Image Studio の実際の画面です。送信したプロンプトは、まず Text Conditioning でエンコードされます。',
        'Image Studio の実際の画面です。生成が終わったテイクが、ビューアーで In Use になっています。',
        '実際の出力です。この Qwen‑Image 2.1 の静止画を先頭フレームにして、H3 fl2va が音声付きの動画を生成しました（run cfa759df）。',
      ],
      firstFrame: '先頭フレーム',
      clipLabel: 'この先頭フレームから生成した fl2va の動画',
      loudness: 'Web 版はラウドネスを正規化しています（元の出力は約 −37〜−50 LUFS、AAC 32 kHz）。',
      realBadge: '実際の出力',
      caption:
        'UI は Phasyn Studio の実際の画面（英語 UI）です。静止画と動画は実際の出力です。静止画は Image Studio と同じ t2i‑pc パイプラインの Qwen‑Image 2.1 で生成しました（1152×672、エンドツーエンド約 27 秒：テキストエンコーダー・DiT・VAE は RTX 5080、合成は CPU）。動画はこの画像を先頭フレームにして H3 fl2va で生成しました（768×448、24 fps、124 フレーム＝5.17 秒、生成した音声付き）。下の Records の画面と同じ run cfa759df で、エンドツーエンド 57.2 秒でした（テキストエンコードは DGX Spark GB10、DiT と映像デコードは RTX 5080、音声デコードは RTX 3060）。',
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
      cards: {
        imageStudio: { title: 'Image Studio', body: 'テキストから画像を生成します。生成のたびに take が残り、並べて比べたり、動画ショットの先頭フレームにしたりできます。' },
        advisor: { title: 'Prompt Advisor', body: '74 のルールが、書いている途中のプロンプトを確認します（MiniMax 公式ガイド 45、インストール済みのコード 21、作成ガイド 8）。うち 21 件はワンクリックで修正でき、適用前に差分を確認できます。すべてのルールに出典があります。' },
        references: { title: '@ 参照素材', body: '@Image1・@Video1・@Audio1 で参照素材を指定すると、H3 のタグにそのまま対応します。' },
        timeline: { title: 'タイムライン・書き出し', body: '分割、スナップ、ディゾルブ、速度変更、色調整、タイトル。最後は FFmpeg で MP4 に書き出します。' },
        imageToPrompt: { title: '画像からプロンプトへ', body: '画像を渡すと、DGX Spark の視覚モデルがシーンの記述とプロンプト候補を書き起こします。' },
      },
      tags: ['テキストから画像', '画像から画像', 'マスク編集'],
      spec: '2026-10-18 に実測した出力：768×448、24 fps、124 フレーム（5.17 秒）、音声は AAC 32 kHz ステレオ。書き出し：MP4（H.264＋AAC、完全に再エンコード。画質プリセットは CRF 18／23／28）。',
    },
    hood: {
      eyebrow: 'UNDER THE HOOD',
      title: '1 回のレンダリングを、2 台・3 GPU で。',
      lead: 'モデルのコンポーネントはそれぞれ独立したプロセスとして、選んだマシンで動きます。Recorder はすべてのステップの時間を記録し、計測していない値は「Not measured」と表示します。0 にはしません。',
      caption: '実際の画面 · Records：run cfa759df、6/6 ステップ、合計 57.156 秒。テキストエンコードは GB10 で 1.333 秒、DiT 31.951 秒と映像デコード 22.359 秒は RTX 5080、音声 854 ms は RTX 3060、mux 297 ms は CPU。',
      process: { title: '1 コンポーネント、1 プロセス', body: 'テキストエンコーダー、DiT、VAE、mux はそれぞれ別のプロセスで、精度とオフロードを個別に設定できます。ひとつのモデルが落ちても、アプリは止まりません。' },
      inspectorCaption: '実際の画面 · Components：dit‑5080 のコンポーネントインスペクターです。コンポーネントごとに起動・停止・再起動でき、1 つのノードで読み込める DiT は一度に 1 つだけです。',
      direct: { title: 'ノードからノードへ', body: 'latent や映像などの大きな中間ファイルは FileRef としてマシン間を直接移動し、Controller を経由しません。Controller はスケジュールと記録、アップロードしたファイルの提供を担当します。実測では、PC 上の DiT が DGX Spark から 219〜322 KB の条件データを 30〜34 ms で受け取りました。' },
      metrics: { title: '1 回の実行に 102 の指標', body: 'CPU・GPU の時間、VRAM、転送量。2〜8 件の記録を並べて比較し、JSONL・CSV・ZIP・trace で書き出せます。' },
      agents: {
        title: 'エージェントにも。',
        body: '付属の Agent Skill には、phasynctl コマンドラインツールと、必要に応じて使える MCP サーバー（22 ツール）が含まれています。',
        tools: 'phasyn_doctor · phasyn_run_create · phasyn_runs_compare · phasyn_recordings_compare …',
        dryRun: { before: '', code: 'phasynctl runs create --dry-run', after: ' は、何かをアップロードする前に、すべてのパラメーターを現在のスキーマと照合します。' },
        evidence: '実験 06 では、Studio の UI から 1 回、MCP から 1 回実行し、出力はビット単位で一致しました。',
        script: { before: '', code: 'phasynctl runs create / wait / download', after: ' でスクリプトを書けば、まとめて送信し、完了を待ち、結果をダウンロードできます。Video Studio には Batch Render もあります。' },
      },
      differs: {
        title: 'ほかのツールとの違い',
        items: [
          'ノードベースのワークフローツールは、多くの場合グラフ全体をひとつのプロセスで実行します。Phasyn Studio はモデルのコンポーネント（テキストエンコーダー、DiT、VAE、mux）をそれぞれ独立したプロセスで動かすため、クラッシュが広がらず、1 回のレンダリングを複数のマシンにまたがらせることもできます。',
          'マルチバックエンドのフロントエンドは、ジョブ全体を別々のマシンに振り分けます。Phasyn Studio が分けるのは 1 回のレンダリングそのものです。テキストエンコードは DGX Spark、DiT は RTX 5080、音声は RTX 3060 で動きます。',
          'クラウドサービスは、現時点ではより高い解像度に対応しています。Phasyn Studio は自分のハードウェアで動き、クレジットは不要で、1 秒ごとの使い道を記録します。',
        ],
      },
      runtimes: '現在の実行環境：RTX 50 シリーズ、RTX 30 シリーズ、DGX Spark（GB10）。RTX 40 シリーズ（4090 など）にはまだ対応していません。',
      multi: '複数のマシンを使うのは、1 回のレンダリングのコンポーネントを別々の GPU に分けるためです。現在は一度に 1 つの run を実行し、複数の映像を並列に処理するものではありません。',
      details: 'エンジニア向けの詳細：アーキテクチャ図と実際の画面',
      diagram: {
        label: 'アーキテクチャ図：1 回のレンダリングが 2 台のマシン、3 つの GPU にまたがる',
        browser: 'ブラウザー',
        controller: 'Controller',
        controllerSub: 'スケジュールと記録',
        gatewaySub: 'マシンごとに 1 つ',
        textEncoder: 'テキストエンコーダー',
        ditSub: 'レイヤーストリーミング',
        videoVae: '映像 VAE',
        audioVae: '音声 VAE',
        mux: '多重化',
        control: '制御',
        data: 'データ · FileRef',
        caption:
          'ブラウザーは Controller に接続し、Controller は各マシンの NodeGateway に指示を出します。テキストエンコードは DGX Spark で実行され、結果は FileRef として PC 上の DiT に直接渡されます。DiT の出力は RTX 5080 の映像 VAE と RTX 3060 の音声 VAE に分かれ、最後に CPU で多重化します。',
      },
      graphCaption: '実際の画面 · Components：fl2va‑pc パイプラインのノードグラフです。te は DGX Spark（GB10）、venc・dit・video は RTX 5080、audio は RTX 3060 で動きます。',
      runCaption: '実際の画面 · Records：fl2va レンダリング 1 回分の実行記録です。6 ステップすべてが完了し、合計 57.156 秒。いちばん遅いのは RTX 5080 の dit（31.951 秒）でした。',
      tour: '操作ガイドでパイプラインを見る',
      pause: 'アーキテクチャ図のアニメーションを一時停止',
      play: 'アーキテクチャ図のアニメーションを再生',
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: '実測して、公開する。失敗も含めて。',
      lead: 'H3 の DiT エンジン 40 種を 1 枚の RTX 5080 で計測しました。37 種が完走し、NF4 の 3 種は読み込めませんでした。その結果も表に載せています。',
      stats: [
        { value: '57–76', unit: 's', label: '音声付き 5.17 秒の動画', detail: 'fl2va · 2026-10-18 に 4 回実測 · テキスト DGX Spark · DiT と映像 RTX 5080 · 音声 RTX 3060' },
        { value: '33.2', unit: 's', label: '最速の DiT ステージ（コールドロード後の初回呼び出し）', detail: 'ノイズ除去の計算は 26.0 s · INT8 · PAI 8 ステップ · RTX 5080' },
        { value: '37/40', unit: '', label: '完走した DiT エンジン', detail: '同じ RTX 5080 で合計 3.2 時間 · NF4 の 3 種は読み込みに失敗し、失敗として記載' },
      ],
      footnote: 'すべての速度に、各ステップを実行したマシンを明記しています。',
      cta: '自分のハードウェアに合う設定を探す',
    },
    lab: {
      eyebrow: 'IN THE LAB',
      title: 'まだのものは、はっきりと。',
      lead: 'テスト中、近日追加予定、設計目標。すべてに状態を表示しています。開発の順番は、私自身の必要に合わせて決めています。',
      unverified: '実装済み・未検証',
      items: [
        { status: 'inTesting', title: 'ワンクリック差し替え', body: '5 ステップのウィザードはできていますが、動画全体での実行はまだです。権利を持つ素材だけを使い、実在の人物になりすまさないでください。' },
        { status: 'unverified', title: '動画からプロンプトへ', body: '実装済みですが、実モデルでの検証はまだです。' },
        { status: 'coming', title: '背景除去', body: 'Image Studio で、そのまま背景を除去できるようにします。' },
        { status: 'designGoal', title: 'マシンを 1〜2 時間だけ借りる', body: 'デプロイ、起動、処理、書き出し、シャットダウン。使い終わったら止めます。まだパッケージ化していません。' },
        { status: 'inDevelopment', title: 'マルチレベルレンダリング · TTS と音声変換 · 超解像とフレーム補間', body: '簡単な画で素早くカットを決めてから、キャラクターを入れて仕上げます。自作の TTS システム。いくつかの超解像・フレーム補間の技術を統合中です。' },
        { status: 'planned', title: '生成プラグインとスライダー · 対応モデルの拡充 · VAE と DiT の最適化', body: 'スライダーや LoRA スタイルによる細かな制御、Suno の音楽などサードパーティのモデルの接続。映像 VAE のエンコードとデコードは、今も負荷が大きすぎます。' },
      ],
      note: 'ArtCraft の機能も参考にしていますが、まだ統合していません。',
      cta: '進捗をフォロー',
    },
    usable: {
      eyebrow: 'CAN I USE IT?',
      title: '今すぐ使える？',
      items: [
        { label: 'ダウンロード', body: 'まだできません。現在はダウンロードもインストーラーもなく、登録や支払いも必要ありません。ソースコードは整理でき次第、Apache-2.0 で公開します。' },
        { label: 'パソコン', body: 'NVIDIA の GPU が必要です。実行環境が対応しているのは RTX 50 シリーズ、RTX 30 シリーズ、DGX Spark（GB10）だけで、RTX 40 シリーズと Mac にはまだ対応していません。参照素材から動画を生成する場合、16 GB の GPU ではかなり厳しくなります（実測のピークは GPU 全体で 15.91 GiB）。' },
        { label: '費用', body: 'ソフトウェアは無料です。モデルの重みは同梱しないため、各自で入手し、それぞれのライセンスに従ってください。' },
        { label: '商用利用', body: 'Qwen‑Image 2.1 は研究・非商用の用途に限られ、MiniMax H3 には地域の制限と利用規定があります。収益化したチャンネル、タイアップ、受託制作に使う前に、ライセンスを確認してください。' },
        { label: '最新情報', body: 'GitHub か Hugging Face で phasyn をフォローするか、phasyn@phasyn.dev までメールをお送りください。' },
      ],
      framework: 'Phasyn Studio はフレームワークです。モデルの重みを同梱・配布することはありません。モデルは各自で用意し、それぞれのライセンスに従って使ってください。',
      licenses: 'ライセンス原文',
    },
    closing: {
      title: 'あなたのアイデアを、動く映像に。',
      lead: 'ソースコードとアーキテクチャ解説は近日公開です。リリースは GitHub の phasyn で、新しい映像素材は Hugging Face でお知らせします。ご意見はメールでお気軽にどうぞ。',
      github: 'GitHub でフォロー',
      huggingface: 'Hugging Face でフォロー',
      email: 'メールを送る',
      about: 'このプロジェクトについて',
    },
    screens: {
      real: '実際の画面',
      pendingTitle: '実際の画面を準備中',
      pendingBody: 'ここに Phasyn Studio の実際の画面が入ります。',
      callouts: '画面の注記',
      enlarge: '拡大表示',
      close: '閉じる',
      tapHint: 'タップして画面全体を表示',
      alt: {
        'image-studio-generating': '生成中の Image Studio の実際の画面。Text Conditioning が実行中で、下の新しいテイクには Generating と表示されています。',
        'image-studio-takes': '生成が終わった Image Studio の実際の画面。ビューアーに使用中のテイク、下に Takes の列、右に設定パネルがあります。',
        'render-engine-image': 'Generation Engine パネル。この画像のパイプラインに必要なコンポーネント（テキストエンコーダー・DiT・VAE は RTX 5080、合成は CPU）を個別に起動できます。',
        'video-studio-editor': 'Video Studio の編集画面。ビューアー、インスペクター、タイムライン。',
        'prompt-advisor': 'Video Studio の Prompt Fixes & Suggestions。提案ごとに出典が付きます。',
        'references-mentions': 'Video Studio のプロンプトエディター。@ で画像・動画・音声の参照を指定します。',
        'render-engine-three-machines': 'Render Engine。1 回のレンダリングの各コンポーネントと、それを実行するマシン。',
        'render-progress': 'Video Studio でショットをレンダリングしているところ。',
        'timeline-effects': 'Video Studio のタイムライン。クリップにエフェクトが適用されています。',
        'export-dialog': 'Export Sequence ダイアログ。クリップ、合計時間、エンコード設定。',
        'image-to-prompt-result': 'Inference Studio の Image to Prompt。画像のシーン項目と、採点されたプロンプト候補。',
        'components-pipeline-graph': 'Components にある fl2va‑pc パイプラインのノードグラフ。te は DGX Spark（GB10）、venc・dit・video は RTX 5080、audio は RTX 3060 です。',
        'component-inspector-precision': 'Components のコンポーネントインスペクター。dit‑5080 を個別に起動・停止・再起動でき、ノードごとに読み込める DiT は 1 つだけと表示されています。',
        'records-run-steps': 'Records の実行記録。fl2va レンダリング 1 回分の 6 ステップがすべて完了し、合計 57.156 秒でした。Step Timeline はリソースグループごとに 1 本のトラックです。',
        'records-compare': 'Records の Compare。複数の記録の設定差分と計測値を並べて比較します。',
        'terminal-phasynctl': 'ターミナルで、エージェントが phasynctl を使ってシステムを確認し、記録を比較します。',
      },
      hotspots: {
        'generating.flow': '生成の流れ：Prompt → Generation → Refine/Library',
        'generating.te': 'まずプロンプトをテキストエンコード',
        'generating.take': '新しいテイクを生成中',
        'takes.inUse': '使用中のテイク',
        'takes.strip': '生成のたびにテイクが残ります',
        'takes.video': '同じプロジェクトのまま Video Studio へ',
        'run.elapsed': '6/6 ステップ完了 · 57.156 s',
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
      brand: 'From storyboard to synthesis.',
      title: 'AI Filmmaking on Your Own GPUs.',
      lead: ['Write a prompt, lock the look, render the shot — sound included.', 'Text, image and video in one pipeline, with every step visible and timed.'],
      watch: 'Watch the Film',
      showcase: 'See What It Made',
      numbers: 'See the Numbers',
      strip: 'Real output · 1152×672 · about 27 s each (RTX 5080)',
      pause: 'Pause Background Animation',
      play: 'Play Background Animation',
    },
    proof: {
      label: 'Measured',
      items: [
        { value: '≈27', unit: 's', label: 'A 1152×672 still, end to end' },
        { value: '57–76', unit: 's', label: 'A 5.17 s clip with sound, end to end' },
        { value: '2 · 3', unit: '', label: 'One render, two machines, three GPUs' },
        { value: '37/40', unit: '', label: 'H3 DiT variants that ran on one RTX 5080' },
      ],
      footnote: 'Measured 2026-10-18. Stills: every step on the RTX 5080. Clips: four fl2va renders, with text encoding on the DGX Spark (GB10), DiT and video decode on the RTX 5080, audio on the RTX 3060.',
    },
    made: {
      eyebrow: 'MADE WITH PHASYN STUDIO',
      title: 'One Character. Thirteen Real Outputs.',
      lead: 'An original character, The Courier — from a character sheet to stills to clips with sound, all rendered with Phasyn Studio on two machines. About 11 minutes of render time in total.',
      videoTitle: 'Phasyn Studio introduction film',
      filmNote: 'The intro film: from text to image to video with sound, in about a minute.',
      wallTitle: 'Four Stills. Four Clips with Sound.',
      clips: { rain: 'Rainy Night Alley', ocean: 'Aurora Over the Sea', portrait: 'Waking in Light', cliff: 'Cliff at Dawn' },
      receipt: 'fl2va · seed {seed} · {s} s end to end',
      machines: 'text on GB10 · DiT and video on RTX 5080 · audio on RTX 3060',
      play: 'Play',
      pause: 'Pause',
      seeAll: 'See All Outputs',
      footnote: 'Times are end to end as recorded by the controller, not including model start-up (11–46 s per switch). Native video output is 768×448; the web copies are loudness-normalized only (raw output is about −37 to −50 LUFS, AAC 32 kHz).',
    },
    manifesto: {
      eyebrow: 'WHY',
      heading: 'Why I Built It',
      beats: [
        { text: 'Most video generators are bad, expensive, and sold by the credit.', hot: ['bad, expensive', 'sold by the credit'] },
        { text: 'Local tools like ComfyUI ignore how people actually work — and how fast it could run.', hot: ['how people actually work', 'how fast it could run'] },
      ],
      final: { text: 'So I built my own.', hot: 'built my own' },
      proof: 'One process per model component, on the GPU I choose — and every call measured.',
      illustration: 'Illustration — not figures from any real service',
      signature: 'DennySORA, developer',
      readMore: 'Read the Full Story',
    },
    pipeline: {
      eyebrow: 'PIPELINE',
      title: 'Text, Image, Video. One Pipeline.',
      lead: 'From one prompt to a clip with sound. Every step is visible, and every step can be changed.',
      stepsLabel: 'Pipeline steps',
      steps: [
        {
          label: 'Text',
          title: 'Start with Words.',
          body: 'Write a prompt. Image Studio turns it into an image; in Video Studio, @Image1, @Video1 and @Audio1 point to references — with snippets, block view and a formatter right at hand.',
          points: ['Prompt', '@ references', 'Snippets'],
        },
        {
          label: 'Image',
          title: 'Lock the Look.',
          body: 'Generate with Qwen‑Image 2.1 in Image Studio. Every generation stays as a take you can compare — then pick one as a shot’s first frame.',
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
      cards: {
        imageStudio: { title: 'Image Studio', body: 'Generate from text. Every generation stays as a take you can compare and use as a shot’s first frame.' },
        advisor: { title: 'Prompt Advisor', body: '74 rules check your prompt as you write — 45 from MiniMax’s official guides, 21 from the installed code, 8 from a writing guide. 21 offer a one-click fix, previewed as a diff. Every rule cites its source.' },
        references: { title: '@ References', body: 'Point to references with @Image1, @Video1 and @Audio1 — each maps straight to an H3 tag.' },
        timeline: { title: 'Timeline and Export', body: 'Split, snap, dissolve, change speed, grade color and add titles — then export an MP4 with FFmpeg.' },
        imageToPrompt: { title: 'Image to Prompt', body: 'Hand it an image, and a vision model on the DGX Spark writes back the scene and candidate prompts.' },
      },
      tags: ['Text to image', 'Image to image', 'Masked edit'],
      spec: 'Measured output (2026-10-18): 768×448, 24 fps, 124 frames (5.17 s), AAC 32 kHz stereo. Export: MP4 (H.264 + AAC, fully re-encoded; CRF 18 / 23 / 28 presets).',
    },
    hood: {
      eyebrow: 'UNDER THE HOOD',
      title: 'One Render. Two Machines. Three GPUs.',
      lead: 'Every model component runs as its own process, on the machine you choose. The Recorder times every step — and anything it didn’t measure reads “Not measured,” never zero.',
      caption: 'Real screen · Records: run cfa759df, 6 of 6 steps in 57.156 s. Text encoding 1.333 s on the GB10; DiT 31.951 s and video decode 22.359 s on the RTX 5080; audio 854 ms on the RTX 3060; mux 297 ms on the CPU.',
      process: { title: 'One Process per Component', body: 'Text encoder, DiT, VAEs and mux run separately, each with its own precision and offload. A crashing model doesn’t take the app down.' },
      inspectorCaption: 'Real screen · Components: the dit‑5080 component inspector. Each component starts, stops and restarts on its own; a Node loads one DiT at a time.',
      direct: { title: 'Node to Node', body: 'Large intermediates — latents, video — move straight between machines as FileRefs, not through the Controller; the Controller schedules, keeps records and serves the files you upload. Measured: the DiT on the PC received 219–322 KB of conditioning from the DGX Spark in 30–34 ms.' },
      metrics: { title: '102 Metrics per Run', body: 'CPU and GPU time, VRAM, transfers. Compare 2–8 recordings; export JSONL, CSV, ZIP or a trace.' },
      agents: {
        title: 'Built for Agents, Too.',
        body: 'The bundled agent skill gives an agent the phasynctl CLI and an optional MCP server with 22 tools.',
        tools: 'phasyn_doctor · phasyn_run_create · phasyn_runs_compare · phasyn_recordings_compare …',
        dryRun: { before: '', code: 'phasynctl runs create --dry-run', after: ' checks every parameter against the live schemas before anything is uploaded.' },
        evidence: 'Experiment 06 ran once from the Studio UI and once over MCP: bit-identical output.',
        script: { before: 'Script ', code: 'phasynctl runs create / wait / download', after: ' to submit in batches, wait for completion and download the results; Video Studio also has Batch Render.' },
      },
      differs: {
        title: 'How It Differs',
        items: [
          'Node-based workflow tools usually run the whole graph in one process. Phasyn Studio runs each model component — text encoder, DiT, VAEs, mux — as its own process, so a crash stays contained and one render can span several machines.',
          'Multi-backend front ends send whole jobs to different machines. Phasyn Studio splits a single render: text encoding on a DGX Spark, the DiT on an RTX 5080, audio on an RTX 3060.',
          'Hosted services offer higher resolution today. Phasyn Studio runs on hardware you own, with no credits, and records where every second goes.',
        ],
      },
      runtimes: 'Runtimes today: RTX 50 series, RTX 30 series and DGX Spark (GB10). No RTX 40 series runtime yet.',
      multi: 'Multiple machines split the components of one render across GPUs. Today it runs one run at a time — not several videos in parallel.',
      details: 'Engineering Details: Architecture and Real Screens',
      diagram: {
        label: 'Architecture diagram: one render across two machines and three GPUs',
        browser: 'Browser',
        controller: 'Controller',
        controllerSub: 'Schedules runs, keeps records',
        gatewaySub: 'One per machine',
        textEncoder: 'Text encoder',
        ditSub: 'Layer streaming',
        videoVae: 'Video VAE',
        audioVae: 'Audio VAE',
        mux: 'Mux',
        control: 'Control',
        data: 'Data · FileRef',
        caption:
          'The browser connects to the Controller, which instructs a NodeGateway on each machine. Text encoding runs on the DGX Spark and its result goes straight to the DiT on the PC as a FileRef. The DiT output splits to the video VAE on the RTX 5080 and the audio VAE on the RTX 3060, and the CPU joins picture and sound (mux).',
      },
      graphCaption: 'Real screen · Components: the fl2va‑pc pipeline graph. te on the DGX Spark (GB10); venc, dit and video on the RTX 5080; audio on the RTX 3060.',
      runCaption: 'Real screen · Records: the run details of one fl2va render. All 6 steps done in 57.156 s; the slowest was dit on the RTX 5080 (31.951 s).',
      tour: 'See the Pipeline in the Tour',
      pause: 'Pause Diagram Animation',
      play: 'Play Diagram Animation',
    },
    benchmarks: {
      eyebrow: 'BENCHMARKS',
      title: 'Measured. Published. Failures Included.',
      lead: '40 H3 DiT variants timed on one RTX 5080: 37 ran, and the 3 NF4 variants that never loaded are in the table too.',
      stats: [
        { value: '57–76', unit: 's', label: 'A 5.17 s clip with sound', detail: 'fl2va · 4 runs on 2026-10-18 · text on DGX Spark · DiT and video on RTX 5080 · audio on RTX 3060' },
        { value: '33.2', unit: 's', label: 'Fastest DiT stage, first call after a cold load', detail: 'denoise compute 26.0 s · INT8 · PAI 8 · RTX 5080' },
        { value: '37/40', unit: '', label: 'DiT variants that ran', detail: 'One RTX 5080, 3.2 hours in total · 3 NF4 variants failed to load and are listed as failures' },
      ],
      footnote: 'Every speed names the machine that ran each step.',
      cta: 'Find Your Setup',
    },
    lab: {
      eyebrow: 'IN THE LAB',
      title: 'Not Shipped Yet. Said Plainly.',
      lead: 'In testing, coming, or a design goal — each one is labeled. Development follows my own needs.',
      unverified: 'Implemented, not verified',
      items: [
        { status: 'inTesting', title: 'One-Click Character Swap', body: 'The five-step wizard exists; a full-video run hasn’t happened yet. Only use material you have the rights to, and never impersonate a real person.' },
        { status: 'unverified', title: 'Video to Prompt', body: 'Implemented, not yet verified on the real model.' },
        { status: 'coming', title: 'Remove Background', body: 'Background removal right in Image Studio.' },
        { status: 'designGoal', title: 'Rent a Machine for an Hour or Two', body: 'Deploy, start, process, export, shut down — then switch it off. Not packaged yet.' },
        { status: 'inDevelopment', title: 'Multi-Level Rendering · TTS and Voice Transfer · Super-Resolution and Frame Interpolation', body: 'Lock the shots fast with rough frames, then add characters and render; my own TTS system; a few upscaling and interpolation techniques being integrated.' },
        { status: 'planned', title: 'Plug-ins and Sliders · Broader Model Support · VAE and DiT Optimization', body: 'Finer control with sliders and LoRA styles; third-party models such as Suno music; video VAE encode and decode is still too heavy.' },
      ],
      note: 'Ideas from ArtCraft are on the list too — not integrated yet.',
      cta: 'Follow Along',
    },
    usable: {
      eyebrow: 'CAN I USE IT?',
      title: 'Can I Use It Today?',
      items: [
        { label: 'Download', body: 'Not yet. There’s no download or installer today, and nothing to sign up for or pay. The source will be published under Apache-2.0 once it’s ready.' },
        { label: 'Hardware', body: 'You need an NVIDIA GPU. Runtimes today cover only the RTX 50 series, the RTX 30 series and DGX Spark (GB10) — no RTX 40 series and no Mac yet. Reference-to-video is a tight fit on a 16 GB card (measured whole-card peak: 15.91 GiB).' },
        { label: 'Cost', body: 'The software is free. Model weights aren’t included; get them yourself and follow each model’s license.' },
        { label: 'Commercial use', body: 'Qwen‑Image 2.1 is for research and non-commercial use only; MiniMax H3 has regional restrictions and a usage policy. Check the licenses before using it for a monetized channel, sponsored content or client work.' },
        { label: 'Stay posted', body: 'Follow phasyn on GitHub or Hugging Face, or write to phasyn@phasyn.dev.' },
      ],
      framework: 'Phasyn Studio is a framework: it doesn’t bundle or distribute any model weights. You bring your own models and use them under their licenses.',
      licenses: 'License texts',
    },
    closing: {
      title: 'Your Ideas, in Motion.',
      lead: 'Source code and architecture notes are coming soon. Follow phasyn on GitHub to hear about the release, find new media on Hugging Face, or just write to me.',
      github: 'Follow on GitHub',
      huggingface: 'Follow on Hugging Face',
      email: 'Email Me',
      about: 'About the Project',
    },
    screens: {
      real: 'Real screen',
      pendingTitle: 'Real capture pending',
      pendingBody: 'A real Phasyn Studio screen goes here.',
      callouts: 'Callouts',
      enlarge: 'Enlarge',
      close: 'Close',
      tapHint: 'Tap to see the full screen',
      alt: {
        'image-studio-generating': 'Image Studio mid-generation: Text Conditioning is running and the new take shows Generating.',
        'image-studio-takes': 'Image Studio after generation: the viewer shows the take in use, with the Takes strip below and the settings panel on the right.',
        'render-engine-image': 'The Generation Engine sheet: the components this image’s pipeline needs (text encoder, DiT and VAE on the RTX 5080, compositing on the CPU), each of which can be started on its own.',
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
