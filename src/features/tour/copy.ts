import type { Copy } from '../../i18n/locale.tsx';
import type { ChapterId, MachineRole } from './chapters.ts';
import type { ExplainerId, UiKey } from './screens.ts';

/*
 * Tour copy. Inline markup in rich strings (see RichText.tsx):
 *   [[Label]]  an exact English UI label (work/product/ui-map.md), rendered as a label chip with lang="en";
 *   `id`       a component id, tool name or literal value, rendered as mono code.
 * "What you'll see" steps follow the chapter subtitles (docs/film/captions.json); chapters.ts maps each step to its cues.
 * Product, area and model names, component ids and units are never translated (BRIEF §5).
 */

export interface ChapterNote {
  tone: 'info' | 'warning';
  text: string;
}

export interface ChapterCopy {
  title: string;
  summary: string;
  steps: readonly string[];
  /** What the counted-up readout measures, and where it ran. */
  readout: string;
  /** Shown instead of the machine list when the chapter needs no GPU. */
  machinesNote?: string;
  notes?: readonly ChapterNote[];
  output?: { input: string; clip: string; caption: string };
}

export interface ExplainerCopy {
  title: string;
  intro: string;
  /** Where the numbers in the step readouts come from. */
  caption: string;
  steps: readonly { title: string; body: string }[];
}

export interface TourCopy {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    stats: { chapters: string; minutes: string; machines: string };
    start: string;
    screens: string;
    reelLabel: string;
    reelPause: string;
    reelPlay: string;
    reelCaption: string;
    goTo: (n: number, title: string) => string;
  };
  index: { heading: string; total: (chapters: number, minutes: number) => string };
  chapter: {
    label: (n: number) => string;
    lengthLabel: string;
    whatYoullSee: string;
    playFrom: (time: string) => string;
    nowPlaying: string;
    runsOn: string;
    measured: string;
    spedUp: string;
    playerTitle: (n: number, title: string) => string;
    outputTitle: string;
    screensTitle: string;
  };
  roles: Record<MachineRole, string>;
  chapters: Record<ChapterId, ChapterCopy>;
  screens: {
    eyebrow: string;
    title: string;
    lead: string;
    real: string;
    pendingTitle: string;
    pendingBody: string;
    enlarge: (caption: string) => string;
    close: string;
    controls: { prev: string; next: string; play: string; pause: string; step: (n: number, total: number) => string; steps: string };
    captures: Record<UiKey, string>;
    explainers: Record<ExplainerId, ExplainerCopy>;
  };
  notes: { eyebrow: string; title: string; items: readonly string[] };
  closing: {
    title: string;
    lead: string;
    benchmarks: { body: string; cta: string };
    about: { body: string; cta: string };
  };
}

export const TOUR: Copy<TourCopy> = {
  'zh-hant': {
    hero: {
      eyebrow: 'TOUR · 8 CHAPTERS · REAL SESSIONS',
      title: '看它實際怎麼動。',
      lead: '八個章節，每一段都是在英文介面上實際操作的錄影。只有等待機器運算的片段才加速。',
      stats: { chapters: '個章節', minutes: '分鐘', machines: '台機器' },
      start: '從第 1 章開始',
      screens: '看真實畫面',
      reelLabel: '章節預覽',
      reelPause: '暫停章節預覽',
      reelPlay: '播放章節預覽',
      reelCaption: '畫面都是用 Phasyn Studio 生成的：Qwen-Image 2.1 劇照與 H3 片段。',
      goTo: (n, title) => `前往第 ${n} 章：${title}`,
    },
    index: { heading: '章節', total: (chapters, minutes) => `共 ${chapters} 章 · 約 ${minutes} 分鐘` },
    chapter: {
      label: (n) => `第 ${n} 章`,
      lengthLabel: '影片長度',
      whatYoullSee: '影片中會看到',
      playFrom: (time) => `從 ${time} 開始播放`,
      nowPlaying: '播放中',
      runsOn: '在哪台機器執行',
      measured: '實測',
      spedUp: '等待運算的片段已加速',
      playerTitle: (n, title) => `第 ${n} 章：${title}（操作錄影）`,
      outputTitle: '今天的實際產出',
      screensTitle: '實際畫面',
    },
    roles: {
      text: '文字編碼',
      imageGen: '文字編碼、DiT 與 VAE（Qwen-Image 2.1）',
      prepCompose: '前處理與合成圖片',
      encode: '影像編碼',
      denoise: 'DiT 去噪',
      videoDecode: '影像解碼',
      audio: '音訊 VAE',
      mux: '合併影音',
      concat: '以 FFmpeg 串接與編碼',
      vision: '視覺模型（Qwen3-VL-4B）',
      promptTools: 'Prompt 組合與評分',
      regenerate: '重新生成候選（Qwen-Image 2.1）',
    },
    chapters: {
      v1: {
        title: '文字生圖',
        summary: '在 Image Studio 寫一段 Prompt，由 Qwen-Image 2.1 生成一張圖。只啟動這張圖需要的模型，生成途中就看得到預覽，每個結果都留成可以比較的 take。',
        steps: [
          '打開 [[Image Studio]]，按 [[Add Image]] 開始一張圖。',
          'Prompt 只寫一次，再選 [[Output size]] 和 seed，預設是 [[Random per image (seed -1)]]。',
          '[[Generation Engine]] → [[Start Required Components]]，只把這張圖要用的模型載入 RTX 5080。',
          '按 [[Generate Image]]：take 外框發光，[[Preview (not the final result)]] 隨取樣更新。',
          '每個結果都成為一個編號的 take，例如 [[Take 1]]，和其他結果並排比較。',
          '[[Add to Library (White Background)]]：把白底版本存進專案素材庫。',
        ],
        readout: '每張 1152×672 劇照的端到端時間 · 今天四次實測，RTX 5080',
        notes: [{ tone: 'info', text: '今天啟動圖片 DiT 花了 11.3 秒；它會先停掉閒置的影片 DiT。' }],
      },
      v2: {
        title: '從首幀到影片',
        summary: '把這張圖設為新影片鏡頭的第一格。接著一次渲染橫跨三台機器：文字在 DGX Spark，DiT 與影像在 RTX 5080，聲音在 RTX 3060，每個階段都回報實測耗時。',
        steps: [
          '在 take 上選 [[Use in Video Shot…]] → [[fl2va first frame]] → [[Add Shot and Apply]]：這張圖成為新鏡頭的第一格。',
          '在鏡頭的 [[Prompt]] 分頁，描述接下來發生的事。',
          '[[Render Engine]] 列出每個步驟與機器：文字在 DGX Spark，DiT 與影像在 RTX 5080，聲音在 RTX 3060。',
          '按 [[Render Shot]]，[[DiT Denoising Progress]] 一步一步即時更新。',
          '[[Stages]] 回報每個步驟的實測耗時，以及跑它的機器。',
          '[[View in Edit]]：完成的鏡頭從你的圖開始動起來。',
        ],
        readout: '每段 5.17 秒含聲音片段的端到端時間 · 今天四次 FL2VA 實測',
        notes: [{ tone: 'warning', text: '在 App 裡，從素材庫選圖當第一格的這條路徑，仍標示為 [[Not yet verified on GPU]]。' }],
        output: {
          input: 'Qwen-Image 2.1 劇照（第一格）',
          clip: 'H3 FL2VA 片段',
          caption: '今天用 Phasyn Studio 做的：這張劇照成為片段的第一格，端到端 57.2 秒；片段 5.17 秒、768×448，含生成的聲音。',
        },
      },
      v3: {
        title: '參考素材與 Prompt Advisor',
        summary: '角色設定圖與一段音樂成為 `@Image1`、`@Audio1`，各自對應到 H3 的標籤。Prompt Advisor 邊打邊用 74 條規則檢查，每條建議都標出依據，修正先預覽再套用。',
        steps: [
          '[[References]] → [[Add from Library]] 與 [[Upload File]]，加入角色設定圖和一段音樂，分別成為 `@Image1`、`@Audio1`。',
          '輸入 @ 插入參考素材；每個 @ 都對應到 H3 的標籤，例如 [[H3: <Picture 1>]]。',
          '在 [[Pro Prompt Editor]] 裡，用 [[Templates]] 插入官方的六段格式。',
          '[[Fixes & Suggestions]] 邊打邊檢查 74 條規則，每條建議都標上 [[Official]]、[[Code]] 或 [[Guide Advice]]。',
          '[[Apply Fix…]] 先以差異預覽修改，按 [[Apply]] 才會套用。',
          '按 [[Render Shot]]：圖片與音樂參考一起渲染成一個鏡頭。',
        ],
        readout: '每段 5.17 秒片段（一張參考圖）的端到端時間 · 今天兩次 Ref2VA 實測',
        notes: [
          { tone: 'info', text: '錄影中的 `@Audio1` 是一段音樂，來自我們自己用 Suno 做的曲子。' },
          { tone: 'info', text: 'Prompt Advisor 說明它檢查了什麼；這些建議能不能讓影片變好，還沒有量測過。' },
        ],
        output: {
          input: '角色設定圖（@Image1）',
          clip: 'H3 Ref2VA 片段',
          caption: '今天用 Phasyn Studio 做的：以角色設定圖作為 `@Image1`，生成這段 Ref2VA 片段，端到端 108 秒；片段 5.17 秒、768×448，含生成的聲音。',
        },
      },
      v4: {
        title: '剪輯、效果與匯出',
        summary: '渲染好的鏡頭放上真正的時間軸，逐格分割、修剪、吸附。加上溶接、不變音高的變速和標題，最後由 FFmpeg 匯出一支 MP4。',
        steps: [
          '在 [[V1 Video]] 軌道上拖曳片段，排好順序。',
          '[[Split at Playhead]] 與修剪把手都精準到格，還會自動吸附。',
          '到 [[Effects]]，用 [[Transition]] → [[Cross Dissolve]] 讓鏡頭之間溶接。',
          '[[Speed]] → [[Common Speeds]] → 1.5×：聲音變速，音高不變。',
          '[[Text]] → [[Title text]]，在片段上放標題字。',
          '[[Export Sequence…]] → [[Start Export]]：由 FFmpeg 輸出一支 MP4。',
        ],
        readout: '在 CPU 上串接並匯出兩段未加效果的片段（先前的示範）；加上效果後的匯出時間尚未量測',
        notes: [{ tone: 'info', text: '效果預覽只是近似，以匯出的 MP4 為準。' }],
      },
      v5: {
        title: '圖片反推 Prompt',
        summary: '從一張圖開始，反推出可以編輯的 Prompt。DGX Spark 上的視覺模型填好八個段落的場景，提出核心與完整兩種 Prompt，再把每個候選重新生成並評分。',
        steps: [
          '[[Inference Studio]] → [[Image to Prompt]] → [[New Image-to-Prompt Study]]，從素材庫裡的一張圖開始。',
          '[[Analyze Source Image]]：視覺模型在 DGX Spark 上分析。',
          '[[Scene & Candidates]] 填好八個段落，從 [[Subject]] 到 [[Visible Text]]。',
          '[[Candidate Prompts]] 提供核心版與完整版，可以直接修改。',
          '[[Generate & Compare]] 把每個候選重新生成並評分；[[Loss]] 越低，越接近原圖。',
          '[[Apply to Image Studio]] 把選定的 Prompt 送回 Image Studio，成為一張新圖；要你按下才會生成。',
        ],
        readout: '在 DGX Spark 分析一張圖（先前實測）；視覺模型未啟動時，另需 62.5 秒載入',
        notes: [{ tone: 'info', text: '[[Loss]] 是機器評審給的差異分數（0 代表每個段落都相符），不是準確率。' }],
      },
      v6: {
        title: '元件與管線',
        summary: '每次渲染都是一條可以打開來看的管線。每個節點都是獨立程序，跑在你選的機器上；可以把 DiT 換成相容的版本，按元件甚至按層設定精度，再對照要求的設定與實際執行的設定。',
        steps: [
          '[[Components]] → [[Pipelines]] → [[Graph]]，把渲染打開成節點圖。',
          '每個節點都是獨立的程序，放在你指定的機器上。',
          '選取 [[dit]] 節點，打開 [[Component Instance]] 更換 DiT。',
          '清單只列出相容的元件，接線不會壞掉。',
          '用 [[Precision (each field is independent)]] 與 [[Parts]]，按元件甚至按層設定精度。',
          '[[Compare]] 並列顯示要求的、生效的與實際觀測到的設定。',
        ],
        readout: '在 RTX 5080 上啟動影片 DiT 的時間（今天實測）',
        machinesNote: '只檢視與調整設定不需要 GPU；啟動 DiT 才會用到 RTX 5080。',
        notes: [{ tone: 'info', text: '每個節點一次只載一個 DiT：啟動另一個時，會先停掉閒置的那個。' }],
      },
      v7: {
        title: '執行紀錄與比較',
        summary: '每次執行都在 Records 留下紀錄：每一步、跑它的機器，以及時間花在哪裡，全部實測，不靠猜。最多比較八筆紀錄、先標出干擾因素，再匯出 JSONL、CSV 或診斷 ZIP。',
        steps: [
          '[[Run History]] 打開任一次執行；[[Step Timeline]] 把每一步放在跑它的機器上。',
          '[[Time Conclusion (Measured Values Only)]] 告訴你時間花在哪裡。',
          '沒量到的就顯示 [[Not measured]]，絕不填 0。',
          '用 [[Add to Compare]] 收集最多八筆紀錄。',
          '[[Open Comparison]] 先標出干擾因素，例如 seed 不同，再讓你下結論。',
          '[[Export]]：[[JSONL]]、[[CSV]] 或 [[Diagnostics ZIP]]。',
        ],
        readout: 'Recorder 的指標定義，每個都有單位與量測方法',
        machinesNote: '不需要 GPU：這一章只讀取既有的紀錄。',
        notes: [{ tone: 'info', text: '比較只列出差異，不會判定誰勝出。' }],
      },
      v8: {
        title: '交給 Agent',
        summary: '習慣用終端機？Agent 透過 Phasyn Studio 的 skill 操作同一套系統。它讀取即時狀態、逐步比較兩次執行，並先 dry run，每個參數都檢查過才送出。',
        steps: [
          '在終端機用英文直接提問；Agent 透過 Phasyn Studio 的 skill（`phasynctl` 與 MCP 工具）動手。',
          '`phasyn_status` 直接從主控讀取節點、元件與執行的即時狀態。',
          '`phasyn_runs_compare` 逐步比較兩次執行。',
          'dry run 依即時的參數定義檢查每個參數；不上傳檔案，也不建立執行。',
          '規則寫在工具裡：每個節點一次只載一個 DiT、不會自動重送、破壞性操作要先確認。',
          '在一組實測中，介面與 Agent 的執行結果逐位元相同。',
        ],
        readout: 'skill 提供的 MCP 工具；查詢狀態約 0.2 秒回應（先前實測）',
        machinesNote: '這段操作不需要 GPU：Agent 只讀取狀態、比較並做 dry run。',
        notes: [{ tone: 'info', text: '逐位元相同來自一組實測，不代表每次都如此。' }],
      },
    },
    screens: {
      eyebrow: 'REAL SCREENS · STEP BY STEP',
      title: '真實畫面，逐步拆解。',
      lead: '每一張都是從 Phasyn Studio 實際擷取的畫面，沒有重做。一步一步看，鏡頭會移到正在說明的地方。',
      real: '真實擷取',
      pendingTitle: '真實畫面擷取中',
      pendingBody: '這裡會放上 Phasyn Studio 的實際畫面。',
      enlarge: (caption) => `放大檢視：${caption}`,
      close: '關閉',
      controls: { prev: '上一步', next: '下一步', play: '自動播放', pause: '暫停自動播放', step: (n, total) => `第 ${n} 步，共 ${total} 步`, steps: '步驟' },
      captures: {
        'image-studio-generating': 'Image Studio：生成中，預覽即時更新',
        'image-studio-takes': 'Image Studio：每個結果都是一個 take',
        'video-studio-editor': 'Video Studio 的剪輯畫面',
        'render-engine-three-machines': 'Render Engine：一次渲染的元件分布在三台機器',
        'render-progress': '渲染進度與各階段的實測耗時',
        'references-mentions': '參考素材與 @ 名稱',
        'prompt-advisor': 'Prompt Advisor：修正與建議',
        'timeline-effects': '時間軸與效果',
        'export-dialog': '匯出序列',
        'image-to-prompt-result': '圖片反推 Prompt 的結果',
        'components-pipeline-graph': '管線節點圖',
        'component-inspector-precision': '元件的精度設定',
        'records-run-steps': '執行紀錄：每一步與它的機器',
        'records-compare': '比較紀錄，先標出干擾因素',
        'terminal-phasynctl': '終端機裡的 phasynctl',
      },
      explainers: {
        render: {
          title: '一次渲染，三台機器',
          intro: '先在 Render Engine 看每一步落在哪台機器，再看渲染時每個階段回報的實測耗時。',
          caption: '步驟時間取自今天渲染雨夜片段的實測（fl2va-pc，端到端 57.2 秒）；擷取畫面上的數字可能來自另一次執行。',
          steps: [
            { title: '文字在 DGX Spark', body: '`te-gb10` 在 DGX Spark 上把 Prompt 編碼，渲染之間一直常駐。' },
            { title: 'DiT 在 RTX 5080', body: '`dit-5080` 在 RTX 5080 上逐層串流，同時為畫面與聲音去噪。' },
            { title: '影像解碼在 RTX 5080', body: '`vae-5080` 負責解碼畫面；權重平時放在鎖定記憶體，每次呼叫才搬上 GPU。' },
            { title: '聲音在 RTX 3060', body: '`audio-3060` 在第二張 GPU 上解碼聲音，與影像同時進行。' },
            { title: 'DiT 即時進度', body: '[[DiT Denoising Progress]] 每完成一步就更新一次。' },
            { title: '每個階段都實測', body: '[[Stages]] 顯示每一步的實測耗時，以及跑它的機器。' },
          ],
        },
        advisor: {
          title: '每條建議，都有出處',
          intro: 'Prompt Advisor 邊打邊用 74 條規則，對照 MiniMax 官方指南與已安裝的程式碼檢查 Prompt。它說明檢查了什麼；這些建議能不能讓影片變好，還沒有量測過。',
          caption: '擷取自第 3 章使用的參考素材與 Prompt。',
          steps: [
            { title: '參考素材變成 @ 名稱', body: '每個參考素材都有 @ 名稱，例如 `@Image1`、`@Audio1`，並對應到 H3 的標籤。' },
            { title: '74 條規則即時檢查', body: '[[Fixes & Suggestions]] 依嚴重度統計：Error、Warning、Suggestion、Info。' },
            { title: '每條都標出依據', body: '每張建議卡都有來源標籤：[[Official]]、[[Code]] 或 [[Guide Advice]]，並可展開 [[Full Details & Source]]。' },
            { title: '先預覽，再套用', body: '[[Apply Fix…]] 先以差異顯示修改內容，按 [[Apply]] 才會改動。' },
          ],
        },
        records: {
          title: '時間花在哪裡',
          intro: '每次執行都留下紀錄：每一步、跑它的機器與實測耗時。比較紀錄時，先列出干擾因素，再看數字。',
          caption: '擷取自 Records 裡的真實執行紀錄。',
          steps: [
            { title: '每一步，跑在哪裡', body: '[[Step Timeline]] 每個資源群組一條軌道，一眼看出哪台機器跑了哪一步。' },
            { title: '實測的耗時', body: '每一步都附上實測時間，最慢的那一步一看就知道。' },
            { title: '先看干擾因素', body: '[[Compare]] 先標出紀錄之間的差異，例如 seed 不同，再列出數字。' },
            { title: '未知就是未知', body: '沒有記錄到的值顯示為 [[Not measured]] 或 [[Not reported]]，絕不當成 0。' },
          ],
        },
      },
    },
    notes: {
      eyebrow: 'ABOUT THESE RECORDINGS',
      title: '關於這些錄影',
      items: [
        '每一章都是在英文介面上的真實操作。等待的片段會加速或剪掉，每一章都寫明實際耗時，以及每一步用的機器。',
        '這裡展示的是圖片反推 Prompt；影片反推還沒有用真正的模型跑過，所以沒有收錄。',
        'One-Click Character Swap（一鍵換角）仍在測試中，不在這次的導覽裡。請只使用你擁有權利的素材，不要冒用真人身分。',
        '白底版本是把圖片放到白色背景上；真正的去背功能即將加入。',
        '這一頁的介面畫面都是實際擷取的，沒有重做；還沒擷取的位置會標示「真實畫面擷取中」。',
        'Phasyn Studio 是單人使用、跑在可信任區網上的工具：刻意不做登入與 TLS。',
      ],
    },
    closing: {
      title: '接下來，看數字。',
      lead: '這個網站上的每個速度，都寫明每一步是哪台機器跑的。',
      benchmarks: { body: '在同一張 RTX 5080 上測了 40 個 DiT 版本：37 個產出影片，3 個無法載入。', cta: '看數據分析' },
      about: { body: '為什麼一個人要做一套橫跨三台機器的 AI 影片工作台。', cta: '讀這個故事' },
    },
  },

  ja: {
    hero: {
      eyebrow: 'TOUR · 8 CHAPTERS · REAL SESSIONS',
      title: '実際の操作を、そのまま。',
      lead: '全 8 章、すべて英語 UI で実際に操作した録画です。速めているのは、マシンの処理を待つ場面だけです。',
      stats: { chapters: 'チャプター', minutes: '分', machines: '台のマシン' },
      start: '第 1 章から見る',
      screens: '実際の画面を見る',
      reelLabel: 'チャプターのプレビュー',
      reelPause: 'プレビューを一時停止',
      reelPlay: 'プレビューを再生',
      reelCaption: 'ここに映る画面は、すべて Phasyn Studio で生成した Qwen-Image 2.1 の静止画と H3 のクリップです。',
      goTo: (n, title) => `第 ${n} 章へ：${title}`,
    },
    index: { heading: 'チャプター', total: (chapters, minutes) => `全 ${chapters} 章 · 約 ${minutes} 分` },
    chapter: {
      label: (n) => `第 ${n} 章`,
      lengthLabel: '動画の長さ',
      whatYoullSee: '映像の流れ',
      playFrom: (time) => `${time} から再生`,
      nowPlaying: '再生中',
      runsOn: '実行するマシン',
      measured: '実測',
      spedUp: '処理待ちの場面は早送り',
      playerTitle: (n, title) => `第 ${n} 章：${title}（操作の録画）`,
      outputTitle: '今日の実際の出力',
      screensTitle: '実際の画面',
    },
    roles: {
      text: 'テキストエンコード',
      imageGen: 'テキストエンコーダー・DiT・VAE（Qwen-Image 2.1）',
      prepCompose: '前処理と画像の合成',
      encode: '画像エンコード',
      denoise: 'DiT デノイズ',
      videoDecode: '映像デコード',
      audio: '音声 VAE',
      mux: '映像と音声の多重化',
      concat: 'FFmpeg で結合・エンコード',
      vision: '視覚モデル（Qwen3-VL-4B）',
      promptTools: 'Prompt の組み立てと採点',
      regenerate: '候補の再生成（Qwen-Image 2.1）',
    },
    chapters: {
      v1: {
        title: 'テキストから画像へ',
        summary: 'Image Studio で Prompt を 1 つ書き、Qwen-Image 2.1 で静止画を生成します。必要なモデルだけを起動し、生成中もプレビューが更新され、結果はすべて比較できるテイクとして残ります。',
        steps: [
          '[[Image Studio]] を開き、[[Add Image]] で 1 枚目の画像を始めます。',
          'Prompt は一度だけ書き、[[Output size]] と seed を選びます。既定は [[Random per image (seed -1)]] です。',
          '[[Generation Engine]] → [[Start Required Components]] で、この画像に必要なモデルだけを RTX 5080 に読み込みます。',
          '[[Generate Image]] を押すとテイクの枠が光り、[[Preview (not the final result)]] がサンプリング中に更新されます。',
          '結果は [[Take 1]] のような番号付きのテイクになり、ほかの結果と並べて比較できます。',
          '[[Add to Library (White Background)]] で、白背景のコピーをプロジェクトのライブラリへ保存します。',
        ],
        readout: '1152×672 の静止画 1 枚あたりのエンドツーエンド時間 · 今日の 4 回の実測、RTX 5080',
        notes: [{ tone: 'info', text: '今日の実測では、画像 DiT の起動に 11.3 秒かかりました。先にアイドル中の動画 DiT を停止します。' }],
      },
      v2: {
        title: '先頭フレームから映像へ',
        summary: '静止画を新しい動画ショットの先頭フレームにします。1 回のレンダリングは 3 台のマシンにまたがり、テキストは DGX Spark、DiT と映像は RTX 5080、音声は RTX 3060 で処理されます。各ステージは実測時間を報告します。',
        steps: [
          'テイクから [[Use in Video Shot…]] → [[fl2va first frame]] → [[Add Shot and Apply]]。画像が新しいショットの先頭フレームになります。',
          'ショットの [[Prompt]] タブに、このあと起きることを書きます。',
          '[[Render Engine]] に各ステップとマシンが並びます。テキストは DGX Spark、DiT と映像は RTX 5080、音声は RTX 3060 です。',
          '[[Render Shot]] を押すと、[[DiT Denoising Progress]] がステップごとに進みます。',
          '[[Stages]] に、各ステップの実測時間と実行したマシンが表示されます。',
          '[[View in Edit]] で、完成したショットがあなたの画像から始まります。',
        ],
        readout: '音声付き 5.17 秒のクリップ 1 本あたりのエンドツーエンド時間 · 今日の FL2VA 実測 4 回',
        notes: [{ tone: 'warning', text: 'アプリでは、ライブラリの画像を先頭フレームに選ぶ経路に、まだ [[Not yet verified on GPU]] と表示されています。' }],
        output: {
          input: 'Qwen-Image 2.1 の静止画（先頭フレーム）',
          clip: 'H3 FL2VA のクリップ',
          caption: '今日 Phasyn Studio で作成：この静止画を先頭フレームにしたクリップです。エンドツーエンド 57.2 秒、5.17 秒・768×448、生成音声付き。',
        },
      },
      v3: {
        title: '参照素材と Prompt Advisor',
        summary: 'キャラクターシートと音楽クリップが `@Image1`・`@Audio1` になり、それぞれ H3 のタグに対応します。Prompt Advisor は入力中に 74 のルールでチェックし、指摘ごとに根拠を示し、修正は適用前にプレビューできます。',
        steps: [
          '[[References]] → [[Add from Library]] と [[Upload File]] で、キャラクターシートと音楽クリップを追加します。それぞれ `@Image1`・`@Audio1` になります。',
          '@ を入力して参照を挿入します。@ はそれぞれ [[H3: <Picture 1>]] のような H3 のタグに対応します。',
          '[[Pro Prompt Editor]] の [[Templates]] から、公式の 6 セクション形式を挿入します。',
          '[[Fixes & Suggestions]] が入力中に 74 のルールをチェックし、指摘には [[Official]]・[[Code]]・[[Guide Advice]] のバッジが付きます。',
          '[[Apply Fix…]] で変更を差分としてプレビューし、[[Apply]] を押すまで何も変わりません。',
          '[[Render Shot]] で、画像と音楽の参照がひとつのショットになります。',
        ],
        readout: '参照画像 1 枚・5.17 秒のクリップ 1 本あたりのエンドツーエンド時間 · 今日の Ref2VA 実測 2 回',
        notes: [
          { tone: 'info', text: '録画では、自作の Suno 楽曲のクリップを `@Audio1` に使っています。' },
          { tone: 'info', text: 'Prompt Advisor が示すのはチェックの内容です。助言で映像が良くなるかは、まだ計測していません。' },
        ],
        output: {
          input: 'キャラクターシート（@Image1）',
          clip: 'H3 Ref2VA のクリップ',
          caption: '今日 Phasyn Studio で作成：キャラクターシートを `@Image1` にした Ref2VA クリップです。エンドツーエンド 108 秒、5.17 秒・768×448、生成音声付き。',
        },
      },
      v4: {
        title: '編集・エフェクト・書き出し',
        summary: 'レンダリングしたショットを本物のタイムラインに並べ、フレーム単位で分割・トリム・スナップします。ディゾルブ、ピッチを保つ速度変更、タイトルを加え、FFmpeg で 1 本の MP4 に書き出します。',
        steps: [
          '[[V1 Video]] トラックでクリップをドラッグして並べます。',
          '[[Split at Playhead]] とトリムハンドルはフレーム単位で、スナップも効きます。',
          '[[Effects]] の [[Transition]] → [[Cross Dissolve]] で、ショットをなめらかにつなぎます。',
          '[[Speed]] → [[Common Speeds]] → 1.5×。音声は速さだけが変わり、ピッチは変わりません。',
          '[[Text]] → [[Title text]] で、クリップにタイトルを重ねます。',
          '[[Export Sequence…]] → [[Start Export]] で、FFmpeg が 1 本の MP4 を書き出します。',
        ],
        readout: 'エフェクトなしの 2 クリップを CPU で結合・書き出し（以前のデモ）。エフェクト付きの時間はまだ計測していません',
        notes: [{ tone: 'info', text: 'エフェクトのプレビューは近似です。書き出した MP4 が基準になります。' }],
      },
      v5: {
        title: '画像から Prompt へ',
        summary: '画像から、編集できる Prompt を逆推定します。DGX Spark の視覚モデルが 8 セクションのシーンを埋め、コアと詳細の Prompt を提案し、候補ごとに再生成してスコアを付けます。',
        steps: [
          '[[Inference Studio]] → [[Image to Prompt]] → [[New Image-to-Prompt Study]] で、ライブラリの画像から始めます。',
          '[[Analyze Source Image]] で、DGX Spark の視覚モデルが解析します。',
          '[[Scene & Candidates]] に、[[Subject]] から [[Visible Text]] まで 8 つのセクションが埋まります。',
          '[[Candidate Prompts]] にコア版と詳細版が出て、そのまま編集できます。',
          '[[Generate & Compare]] で候補ごとに再生成してスコアを付けます。[[Loss]] が低いほど元の画像に近い結果です。',
          '[[Apply to Image Studio]] で、選んだ Prompt を Image Studio の新しい画像として送ります。生成は自分で始めたときだけです。',
        ],
        readout: 'DGX Spark で画像 1 枚を解析する時間（以前の実測）。視覚モデルが停止中なら、読み込みに別途 62.5 秒',
        notes: [{ tone: 'info', text: '[[Loss]] は機械の判定による差分スコア（0 は全セクション一致）で、正解率ではありません。' }],
      },
      v6: {
        title: 'コンポーネントとパイプライン',
        summary: 'レンダリングはすべて、グラフで開けるパイプラインです。ノードごとに独立したプロセスが好きなマシンで動きます。DiT を互換バリアントに差し替え、精度をコンポーネントやレイヤー単位で設定し、要求した設定と実際に動いた設定を比較できます。',
        steps: [
          '[[Components]] → [[Pipelines]] → [[Graph]] で、レンダリングをノードグラフとして開きます。',
          'ノードはそれぞれ独立したプロセスで、指定したマシンで動きます。',
          '[[dit]] ノードを選び、[[Component Instance]] で DiT を差し替えます。',
          '候補は互換性のあるインスタンスだけなので、配線は崩れません。',
          '[[Precision (each field is independent)]] と [[Parts]] で、精度をコンポーネントごと、レイヤーごとに設定します。',
          '[[Compare]] で、要求した設定・有効になった設定・観測された設定を並べて比較します。',
        ],
        readout: 'RTX 5080 で動画 DiT を起動する時間（今日の実測）',
        machinesNote: '閲覧と設定の変更だけなら GPU は使いません。DiT を起動するときだけ RTX 5080 を使います。',
        notes: [{ tone: 'info', text: 'ノードごとに DiT は 1 つです。別の DiT を起動すると、先にアイドル中のものを停止します。' }],
      },
      v7: {
        title: '記録と比較',
        summary: 'すべての実行が Records に記録されます。各ステップ、それを動かしたマシン、時間の行き先まで、推測ではなく実測です。最大 8 件の記録を交絡要因の警告付きで比較し、JSONL・CSV・診断 ZIP で書き出せます。',
        steps: [
          '[[Run History]] から実行を開くと、[[Step Timeline]] に各ステップが実行したマシンごとに並びます。',
          '[[Time Conclusion (Measured Values Only)]] で、時間の行き先がわかります。',
          '計測していない値は [[Not measured]] と表示され、0 にはなりません。',
          '[[Add to Compare]] で最大 8 件の記録を集めます。',
          '[[Open Comparison]] は、seed の違いなどの交絡要因を、結論を出す前に警告します。',
          '[[Export]] から [[JSONL]]・[[CSV]]・[[Diagnostics ZIP]] で書き出せます。',
        ],
        readout: 'Recorder の指標定義の数（単位と計測方法付き）',
        machinesNote: 'GPU は使いません。この章では既存の記録を読むだけです。',
        notes: [{ tone: 'info', text: '比較は違いを並べるだけで、勝ち負けは判定しません。' }],
      },
      v8: {
        title: 'エージェントに任せる',
        summary: 'ターミナル派なら、エージェントが Phasyn Studio のスキルで同じシステムを操作します。ライブの状態を読み、2 つの実行をステップごとに比較し、ドライランで全パラメーターを検証してから送信します。',
        steps: [
          'ターミナルで英語で頼むと、エージェントが Phasyn Studio のスキル（`phasynctl` と MCP ツール）で操作します。',
          '`phasyn_status` が、ノード・コンポーネント・実行の状態をコントローラーからライブで読み取ります。',
          '`phasyn_runs_compare` で、2 つの実行をステップごとに比較します。',
          'ドライランは全パラメーターをライブのスキーマで検証し、アップロードも実行の作成もしません。',
          'ルールはツール側にあります。ノードごとに DiT は 1 つ、自動再送なし、破壊的な操作は確認してから。',
          '実測した 1 組では、UI とエージェントの実行結果がビット単位で一致しました。',
        ],
        readout: 'スキルの MCP ツールの数。状態の取得は約 0.2 秒（以前の実測）',
        machinesNote: 'この操作で GPU は使いません。エージェントは状態の取得・比較・ドライランだけを行います。',
        notes: [{ tone: 'info', text: 'ビット単位の一致は実測した 1 組の結果で、常に保証されるものではありません。' }],
      },
    },
    screens: {
      eyebrow: 'REAL SCREENS · STEP BY STEP',
      title: '実際の画面を、ひとつずつ。',
      lead: 'どれも Phasyn Studio から実際に取得した画面で、作り直したものではありません。ステップを進めると、説明している場所へカメラが寄ります。',
      real: '実際の画面',
      pendingTitle: '実際の画面を取得中',
      pendingBody: 'ここに Phasyn Studio の実際の画面が入ります。',
      enlarge: (caption) => `拡大表示：${caption}`,
      close: '閉じる',
      controls: { prev: '前へ', next: '次へ', play: '自動再生', pause: '自動再生を一時停止', step: (n, total) => `ステップ ${n} / ${total}`, steps: 'ステップ' },
      captures: {
        'image-studio-generating': 'Image Studio：生成中のプレビュー',
        'image-studio-takes': 'Image Studio：結果はテイクとして並ぶ',
        'video-studio-editor': 'Video Studio の編集画面',
        'render-engine-three-machines': 'Render Engine：1 回のレンダリングが 3 台のマシンに',
        'render-progress': 'レンダリングの進捗とステージごとの実測時間',
        'references-mentions': '参照素材と @ 名前',
        'prompt-advisor': 'Prompt Advisor：修正と提案',
        'timeline-effects': 'タイムラインとエフェクト',
        'export-dialog': 'シーケンスの書き出し',
        'image-to-prompt-result': '画像からの逆推定の結果',
        'components-pipeline-graph': 'パイプラインのノードグラフ',
        'component-inspector-precision': 'コンポーネントの精度設定',
        'records-run-steps': '実行記録：ステップと実行マシン',
        'records-compare': '記録の比較と交絡要因の警告',
        'terminal-phasynctl': 'ターミナルの phasynctl',
      },
      explainers: {
        render: {
          title: '1 回のレンダリングに、3 台のマシン',
          intro: 'まず Render Engine で各ステップがどのマシンに載るかを確認し、レンダリング中に各ステージが報告する実測時間を見ます。',
          caption: 'ステップ時間は今日の雨の街クリップの実測値（fl2va-pc、エンドツーエンド 57.2 秒）です。取得画面の数値は別の実行のものの場合があります。',
          steps: [
            { title: 'テキストは DGX Spark', body: '`te-gb10` が DGX Spark で Prompt をエンコードし、レンダリングの合間も常駐します。' },
            { title: 'DiT は RTX 5080', body: '`dit-5080` が RTX 5080 でレイヤーをストリーミングしながら、映像と音声を一緒にデノイズします。' },
            { title: '映像デコードは RTX 5080', body: '`vae-5080` がフレームをデコードします。重みはピン留めメモリに置き、呼び出しごとに GPU へ移します。' },
            { title: '音声は RTX 3060', body: '`audio-3060` が 2 枚目の GPU で音声をデコードし、映像と並行して進みます。' },
            { title: 'DiT のライブ進捗', body: '[[DiT Denoising Progress]] がステップの完了ごとに進みます。' },
            { title: 'ステージごとに実測', body: '[[Stages]] に、各ステップの実測時間と実行したマシンが表示されます。' },
          ],
        },
        advisor: {
          title: '指摘には、すべて根拠を',
          intro: 'Prompt Advisor は入力中の Prompt を、74 のルールで MiniMax の公式ガイドとインストール済みのコードに照らしてチェックします。示すのはチェックの内容で、助言で映像が良くなるかはまだ計測していません。',
          caption: '第 3 章で使った参照素材と Prompt の画面です。',
          steps: [
            { title: '参照素材が @ 名前に', body: '参照素材には `@Image1`・`@Audio1` のような @ 名前が付き、H3 のタグに対応します。' },
            { title: '74 のルールをリアルタイムに', body: '[[Fixes & Suggestions]] が、Error・Warning・Suggestion・Info の重要度別に件数を表示します。' },
            { title: '根拠を必ず表示', body: '指摘カードには [[Official]]・[[Code]]・[[Guide Advice]] の出典バッジが付き、[[Full Details & Source]] で詳細を開けます。' },
            { title: 'プレビューしてから適用', body: '[[Apply Fix…]] で変更を差分で確認し、[[Apply]] を押すまで何も変わりません。' },
          ],
        },
        records: {
          title: '時間はどこへ',
          intro: 'すべての実行に、各ステップ・実行したマシン・実測時間が記録されます。記録の比較では、数値より先に交絡要因を示します。',
          caption: 'Records にある実際の実行記録の画面です。',
          steps: [
            { title: 'どのステップが、どこで', body: '[[Step Timeline]] はリソースグループごとに 1 本のトラックで、どのマシンが何を動かしたかがひと目でわかります。' },
            { title: '実測の時間', body: '各ステップに実測時間が付き、いちばん遅いステップがすぐにわかります。' },
            { title: 'まず交絡要因', body: '[[Compare]] は、seed の違いなど記録間の差を、数値より先に示します。' },
            { title: '未計測は未計測のまま', body: '記録のない値は [[Not measured]] や [[Not reported]] と表示され、0 にはなりません。' },
          ],
        },
      },
    },
    notes: {
      eyebrow: 'ABOUT THESE RECORDINGS',
      title: 'この録画について',
      items: [
        '各章は英語 UI での実際の操作です。待ち時間は早送りかカットし、実際にかかった時間と各ステップのマシンを章ごとに記載しています。',
        '紹介しているのは画像からの逆推定です。動画からの逆推定は実モデルでまだ動かしていないため、収録していません。',
        'One-Click Character Swap（ワンクリックのキャラクター差し替え）はテスト中のため、このガイドには含めていません。権利を持つ素材だけを使い、実在の人物になりすまさないでください。',
        '白背景のコピーは、画像を白い背景に置いたものです。背景除去そのものは近日追加予定です。',
        'このページの画面はすべて実際に取得したもので、作り直してはいません。まだ取得していない場所には「実際の画面を取得中」と表示します。',
        'Phasyn Studio は、信頼できるローカルネットワークで 1 人が使うツールです。ログインや TLS は意図的に設けていません。',
      ],
    },
    closing: {
      title: '次は、数字を。',
      lead: 'このサイトの速度には、すべて各ステップを実行したマシンを明記しています。',
      benchmarks: { body: '1 枚の RTX 5080 で 40 の DiT バリアントを計測しました。37 が映像を出力し、3 つは読み込めませんでした。', cta: 'ベンチマークを見る' },
      about: { body: 'なぜ 1 人で、3 台のマシンにまたがる AI 映像制作ワークベンチを作ったのか。', cta: 'ストーリーを読む' },
    },
  },

  en: {
    hero: {
      eyebrow: 'TOUR · 8 CHAPTERS · REAL SESSIONS',
      title: 'See it work, for real.',
      lead: 'Eight chapters, each a real session recorded in the English UI — sped up only where the machines are working.',
      stats: { chapters: 'chapters', minutes: 'minutes', machines: 'machines' },
      start: 'Start Chapter 1',
      screens: 'See the Real Screens',
      reelLabel: 'Chapter preview',
      reelPause: 'Pause chapter preview',
      reelPlay: 'Play chapter preview',
      reelCaption: 'Every frame here was made with Phasyn Studio: Qwen-Image 2.1 stills and H3 clips.',
      goTo: (n, title) => `Go to chapter ${n}: ${title}`,
    },
    index: { heading: 'Chapters', total: (chapters, minutes) => `${chapters} chapters · about ${minutes} min` },
    chapter: {
      label: (n) => `Chapter ${n}`,
      lengthLabel: 'Video length',
      whatYoullSee: 'What You’ll See',
      playFrom: (time) => `Play from ${time}`,
      nowPlaying: 'Now playing',
      runsOn: 'Runs On',
      measured: 'Measured',
      spedUp: 'Waits sped up',
      playerTitle: (n, title) => `Chapter ${n}: ${title} — recorded session`,
      outputTitle: 'Real Output, Made Today',
      screensTitle: 'Real Screens',
    },
    roles: {
      text: 'Text encoding',
      imageGen: 'Text encoder, DiT and VAE (Qwen-Image 2.1)',
      prepCompose: 'Image preparation and compositing',
      encode: 'Image encoding',
      denoise: 'DiT denoising',
      videoDecode: 'Video decoding',
      audio: 'Audio VAE',
      mux: 'Muxing video and audio',
      concat: 'Joining and encoding with FFmpeg',
      vision: 'Vision model (Qwen3-VL-4B)',
      promptTools: 'Prompt compiling and scoring',
      regenerate: 'Regenerating candidates (Qwen-Image 2.1)',
    },
    chapters: {
      v1: {
        title: 'Text to Image',
        summary: 'One prompt in Image Studio becomes a still with Qwen-Image 2.1. Only the models this image needs start, previews update while it renders, and every result stays as a take you can compare.',
        steps: [
          'Open [[Image Studio]] and start one image with [[Add Image]].',
          'Write the prompt once, then pick the [[Output size]] and a seed — [[Random per image (seed -1)]] by default.',
          '[[Generation Engine]] → [[Start Required Components]] loads only the image models, on the RTX 5080.',
          '[[Generate Image]]: the take tile glows while [[Preview (not the final result)]] updates during sampling.',
          'Each result lands as a numbered take, such as [[Take 1]], kept beside the others for comparison.',
          '[[Add to Library (White Background)]] keeps a clean copy in the project library.',
        ],
        readout: 'per 1152×672 still, end to end · today’s four runs on the RTX 5080',
        notes: [{ tone: 'info', text: 'Starting the image DiT took 11.3 s today; it stops the idle video DiT first.' }],
      },
      v2: {
        title: 'First Frame to Video',
        summary: 'The still becomes the first frame of a new video shot. One render then crosses three machines — text on DGX Spark, DiT and video on the RTX 5080, audio on the RTX 3060 — and every stage reports its measured time.',
        steps: [
          'On the take, [[Use in Video Shot…]] → [[fl2va first frame]] → [[Add Shot and Apply]] opens a new shot on the image.',
          'In the shot’s [[Prompt]] tab, describe what happens next.',
          '[[Render Engine]] lists every step and its machine: text on DGX Spark, DiT and video on the RTX 5080, audio on the RTX 3060.',
          '[[Render Shot]], and [[DiT Denoising Progress]] counts the steps live.',
          '[[Stages]] reports each step’s measured time and the machine that ran it.',
          '[[View in Edit]]: the finished shot opens on your image.',
        ],
        readout: 'per 5.17 s clip with audio, end to end · today’s four FL2VA runs',
        notes: [{ tone: 'warning', text: 'Choosing a library image as the first frame is still marked [[Not yet verified on GPU]] in the app.' }],
        output: {
          input: 'Qwen-Image 2.1 still (first frame)',
          clip: 'H3 FL2VA clip',
          caption: 'Made with Phasyn Studio today: this still became the first frame of the clip — 57.2 s end to end for 5.17 s at 768×448, with generated audio.',
        },
      },
      v3: {
        title: 'References and Prompt Advisor',
        summary: 'A character sheet and a music clip become `@Image1` and `@Audio1`, each mapped to an H3 tag. Prompt Advisor checks the prompt with 74 rules as you type, cites a source for every finding, and previews each fix before you apply it.',
        steps: [
          '[[References]] → [[Add from Library]] and [[Upload File]] bring in a character sheet and a music clip; they become `@Image1` and `@Audio1`.',
          'Type @ to place a reference; each mention maps to an H3 tag, such as [[H3: <Picture 1>]].',
          'In the [[Pro Prompt Editor]], [[Templates]] inserts the official six-section format.',
          '[[Fixes & Suggestions]] checks 74 rules as you type; each finding is badged [[Official]], [[Code]] or [[Guide Advice]].',
          '[[Apply Fix…]] shows the change as a diff; nothing changes until [[Apply]].',
          '[[Render Shot]]: the image and music references render into one shot.',
        ],
        readout: 'per 5.17 s clip with one reference image, end to end · today’s two Ref2VA runs',
        notes: [
          { tone: 'info', text: 'The recorded session uses a music clip — our own Suno track — as `@Audio1`.' },
          { tone: 'info', text: 'Prompt Advisor reports what it checks; whether its advice improves the video hasn’t been measured.' },
        ],
        output: {
          input: 'Character sheet (@Image1)',
          clip: 'H3 Ref2VA clip',
          caption: 'Made with Phasyn Studio today: the character sheet as `@Image1` became this Ref2VA clip — 108 s end to end for 5.17 s at 768×448, with generated audio.',
        },
      },
      v4: {
        title: 'Edit, Add Effects, Export',
        summary: 'Rendered shots go on a real timeline: split, trim and snap, frame by frame. Add a dissolve, a speed change that keeps the pitch, and a title — then FFmpeg exports one MP4.',
        steps: [
          'Drag clips along the [[V1 Video]] track to arrange the sequence.',
          '[[Split at Playhead]] and the trim handles work frame by frame, with snapping.',
          'In [[Effects]], [[Transition]] → [[Cross Dissolve]] blends one shot into the next.',
          '[[Speed]] → [[Common Speeds]] → 1.5×: the audio changes speed without changing pitch.',
          '[[Text]] → [[Title text]] adds a title over the clip.',
          '[[Export Sequence…]] → [[Start Export]]: FFmpeg writes one MP4.',
        ],
        readout: 'to join and export two plain clips on the CPU (earlier demo); export with effects isn’t measured yet',
        notes: [{ tone: 'info', text: 'The effects preview is approximate; the exported MP4 is the reference.' }],
      },
      v5: {
        title: 'Image to Prompt',
        summary: 'Start from an image and get an editable prompt back. The vision model on DGX Spark fills an eight-section scene, proposes core and detailed prompts, then regenerates and scores each candidate.',
        steps: [
          '[[Inference Studio]] → [[Image to Prompt]] → [[New Image-to-Prompt Study]] starts from an image in the library.',
          '[[Analyze Source Image]] runs the vision model on the DGX Spark.',
          '[[Scene & Candidates]] fills eight sections, from [[Subject]] to [[Visible Text]].',
          '[[Candidate Prompts]] offers a core and a detailed version, ready to edit.',
          '[[Generate & Compare]] regenerates each candidate and scores it; a lower [[Loss]] means a closer match.',
          '[[Apply to Image Studio]] sends the chosen prompt back as a new image, generated only when you start it.',
        ],
        readout: 'to analyze one image on DGX Spark (earlier measurement), plus 62.5 s to load the vision model when it’s stopped',
        notes: [{ tone: 'info', text: '[[Loss]] is a difference score from a machine judge (0 means every section matches), not an accuracy rate.' }],
      },
      v6: {
        title: 'Components and Pipelines',
        summary: 'Every render is a pipeline you can open as a graph. Each node is its own process on the machine you choose: swap the DiT for a compatible variant, set precision per component or even per layer, and compare what was asked with what ran.',
        steps: [
          '[[Components]] → [[Pipelines]] → [[Graph]] opens the render as a node graph.',
          'Each node is its own process, placed on the machine you choose.',
          'Select the [[dit]] node and open [[Component Instance]] to swap the DiT.',
          'The picker offers only compatible instances, so the wiring stays valid.',
          '[[Precision (each field is independent)]] and [[Parts]] set precision per component, even per layer.',
          '[[Compare]] lines up what was requested, what took effect and what was observed.',
        ],
        readout: 'to start a video DiT on the RTX 5080 · today’s runs',
        machinesNote: 'Inspecting and editing settings needs no GPU; only starting a DiT uses the RTX 5080.',
        notes: [{ tone: 'info', text: 'One DiT per node: starting another one stops the idle one first.' }],
      },
      v7: {
        title: 'Records and Comparisons',
        summary: 'Every run keeps its own record in Records: each step, the machine that ran it, and where the time went — measured, never guessed. Compare up to eight recordings with confounders flagged, then export JSONL, CSV or a diagnostics ZIP.',
        steps: [
          '[[Run History]] opens any run; [[Step Timeline]] puts each step on the machine that ran it.',
          '[[Time Conclusion (Measured Values Only)]] shows where the time went.',
          'Anything that wasn’t measured says [[Not measured]] — never zero.',
          '[[Add to Compare]] collects up to eight recordings.',
          '[[Open Comparison]] flags confounders, such as a different seed, before you draw conclusions.',
          '[[Export]]: [[JSONL]], [[CSV]] or a [[Diagnostics ZIP]].',
        ],
        readout: 'metric definitions in the recorder, each with a unit and a method',
        machinesNote: 'No GPU: this chapter only reads existing records.',
        notes: [{ tone: 'info', text: 'A comparison lists what differs; it never declares a winner.' }],
      },
      v8: {
        title: 'Hand It to an Agent',
        summary: 'Prefer a terminal? An agent drives the same system through the Phasyn Studio skill. It reads live status, compares two runs step by step, and dry-runs a render so every parameter is checked before anything is sent.',
        steps: [
          'Ask from a terminal in plain English; the agent works through the Phasyn Studio skill (`phasynctl` and MCP tools).',
          '`phasyn_status` reads nodes, components and runs live from the controller.',
          '`phasyn_runs_compare` lines up two runs step by step.',
          'A dry run checks every parameter against the live schemas; nothing is uploaded and no run is created.',
          'The rules live in the tool: one DiT per node, no automatic resend, confirmation before anything destructive.',
          'In one measured pair, a UI run and an agent run produced bit-identical output.',
        ],
        readout: 'MCP tools in the skill; a status call returns in about 0.2 s (earlier measurement)',
        machinesNote: 'No GPU for this session: the agent only reads status, compares and dry-runs.',
        notes: [{ tone: 'info', text: 'Bit-identical output comes from one measured pair of runs, not a general guarantee.' }],
      },
    },
    screens: {
      eyebrow: 'REAL SCREENS · STEP BY STEP',
      title: 'Real Screens, Step by Step.',
      lead: 'Every image here is a real capture of Phasyn Studio — nothing is re-created. Step through each one and the camera moves to the part being explained.',
      real: 'Real capture',
      pendingTitle: 'Real capture pending',
      pendingBody: 'A real Phasyn Studio screen goes here.',
      enlarge: (caption) => `Enlarge: ${caption}`,
      close: 'Close',
      controls: { prev: 'Previous Step', next: 'Next Step', play: 'Play Steps', pause: 'Pause Steps', step: (n, total) => `Step ${n} of ${total}`, steps: 'Steps' },
      captures: {
        'image-studio-generating': 'Image Studio, mid-render with a live preview',
        'image-studio-takes': 'Image Studio: every result is a take',
        'video-studio-editor': 'The Video Studio editor',
        'render-engine-three-machines': 'Render Engine: one render across three machines',
        'render-progress': 'Render progress and measured stage times',
        'references-mentions': 'References and @mentions',
        'prompt-advisor': 'Prompt Advisor: fixes and suggestions',
        'timeline-effects': 'Timeline and effects',
        'export-dialog': 'The Export Sequence dialog',
        'image-to-prompt-result': 'Image to Prompt results',
        'components-pipeline-graph': 'A pipeline as a node graph',
        'component-inspector-precision': 'Component precision settings',
        'records-run-steps': 'A run record: each step and its machine',
        'records-compare': 'Comparing recordings, confounders first',
        'terminal-phasynctl': 'phasynctl in a terminal',
      },
      explainers: {
        render: {
          title: 'One Render, Three Machines',
          intro: 'First the Render Engine shows which machine each step lands on; then, while it renders, every stage reports its measured time.',
          caption: 'Step times from today’s run of the rain clip (fl2va-pc, 57.2 s end to end); numbers in the capture may come from a different run.',
          steps: [
            { title: 'Text on DGX Spark', body: '`te-gb10` encodes the prompt on the DGX Spark and stays resident between renders.' },
            { title: 'DiT on the RTX 5080', body: '`dit-5080` denoises picture and sound together, streaming its layers on the RTX 5080.' },
            { title: 'Video Decode on the RTX 5080', body: '`vae-5080` decodes the frames; its weights wait in pinned memory and move to the GPU per call.' },
            { title: 'Audio on the RTX 3060', body: '`audio-3060` decodes the soundtrack on the second GPU, side by side with video.' },
            { title: 'Live DiT Progress', body: '[[DiT Denoising Progress]] counts the steps as they finish.' },
            { title: 'Measured, per Stage', body: '[[Stages]] shows each step’s measured time and the machine that ran it.' },
          ],
        },
        advisor: {
          title: 'Every Finding Cites Its Source',
          intro: 'Prompt Advisor checks the prompt with 74 rules as you type, against MiniMax’s official guides and the installed code. It reports what it checks; whether its advice improves the video hasn’t been measured.',
          caption: 'Captured with the references and prompt from chapter 3.',
          steps: [
            { title: 'References Become @Names', body: 'Each reference gets an @name — `@Image1`, `@Audio1` — mapped to an H3 tag.' },
            { title: '74 Rules, Live', body: '[[Fixes & Suggestions]] counts findings by severity: Error, Warning, Suggestion, Info.' },
            { title: 'A Source for Every Finding', body: 'Each card carries its source badge — [[Official]], [[Code]] or [[Guide Advice]] — and opens [[Full Details & Source]].' },
            { title: 'Preview, Then Apply', body: '[[Apply Fix…]] shows the change as a diff; nothing changes until [[Apply]].' },
          ],
        },
        records: {
          title: 'Where the Time Went',
          intro: 'Every run keeps a record: each step, the machine that ran it and its measured time. Comparisons list the confounders before any numbers.',
          caption: 'Captured from real run records in Records.',
          steps: [
            { title: 'Each Step, Where It Ran', body: '[[Step Timeline]] draws one track per resource group, so you see which machine ran which step.' },
            { title: 'Measured Times', body: 'Every step carries its measured time; the slowest one stands out at a glance.' },
            { title: 'Confounders First', body: '[[Compare]] flags what differs between recordings — such as the seed — before the numbers.' },
            { title: 'Unknown Stays Unknown', body: 'Values that weren’t recorded read [[Not measured]] or [[Not reported]], never zero.' },
          ],
        },
      },
    },
    notes: {
      eyebrow: 'ABOUT THESE RECORDINGS',
      title: 'About These Recordings',
      items: [
        'Every chapter is a real session in the English UI. Waits are sped up or cut, and each chapter states the real time and the machine that ran each step.',
        'Image to prompt is shown; video to prompt isn’t, because it hasn’t run on the real model yet.',
        'One-Click Character Swap is in testing and isn’t part of this tour. Only use material you have the rights to, and never impersonate a real person.',
        'The white-background copy places the image on white; background removal itself is coming.',
        'Every screen on this page is a real capture of the app — nothing is re-created. Where a capture hasn’t landed yet, the frame says so.',
        'Phasyn Studio is a single-user tool for a trusted local network: no login or TLS, by design.',
      ],
    },
    closing: {
      title: 'Now See the Numbers.',
      lead: 'Every speed on this site names the machine that ran each step.',
      benchmarks: { body: '40 DiT variants timed on one RTX 5080: 37 produced video, 3 failed to load.', cta: 'See Benchmarks' },
      about: { body: 'Why one person built an AI filmmaking workbench that spans three machines.', cta: 'Read the Story' },
    },
  },
};
