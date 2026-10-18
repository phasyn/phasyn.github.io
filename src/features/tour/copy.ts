import type { Copy } from '../../i18n/locale.tsx';
import type { ChapterId } from './chapters.ts';
import type { UiKey } from './screens.ts';

/*
 * Tour copy. Inline markup in rich strings (see RichText.tsx):
 *   [[Label]]  an exact English UI label (work/product/ui-map.md), set as a label chip with lang="en";
 *   `id`       a component id, tool name or literal value, set in mono.
 * "What you'll see" steps follow the chapter subtitles (docs/film/captions.json); chapters.ts holds each step's anchor line and
 * badge. Product, area and model names, component ids and units are never translated (BRIEF §5).
 */

export interface StepCopy {
  text: string;
  /** What the step's measured badge is: shown after the number. */
  measure?: string;
}

export interface ChapterCopy {
  title: string;
  /** Short title for the chapter index (rail and chips). */
  short: string;
  summary: string;
  steps: readonly StepCopy[];
  note?: { tone: 'info' | 'warning'; text: string };
}

export interface TourCopy {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    stats: { chapters: string; minutes: string; gpus: string; gpusSub: string };
    start: string;
    agent: string;
    capture: string;
  };
  index: { heading: string; total: (chapters: number, minutes: number) => string };
  chapter: {
    label: (n: number) => string;
    lengthLabel: string;
    whatYoullSee: string;
    playFrom: (time: string) => string;
    nowPlaying: string;
    timesNote: string;
    playerTitle: (n: number, title: string) => string;
    screensTitle: string;
  };
  chapters: Record<ChapterId, ChapterCopy>;
  screens: {
    pendingTitle: string;
    pendingBody: string;
    enlarge: (caption: string) => string;
    close: string;
    captures: Record<UiKey, string>;
  };
  agent: { eyebrow: string; title: string; body: string };
  notes: { title: string; items: readonly string[] };
  closing: { title: string; lead: string; benchmarks: { body: string; cta: string }; about: { body: string; cta: string } };
}

export const TOUR: Copy<TourCopy> = {
  'zh-hant': {
    hero: {
      eyebrow: 'TOUR · 5 CHAPTERS · REAL SCREENS',
      title: '看它實際怎麼動。',
      lead: '五個章節，都是在英文介面上的真實操作，只有等待機器運算的片段才加速。錄影製作中。',
      stats: { chapters: '個章節', minutes: '分鐘', gpus: '顆 GPU', gpusSub: '兩台機器' },
      start: '從第 1 章開始',
      agent: '或交給 Agent',
      capture: '真實畫面：Image Studio 裡生成完成的 take',
    },
    index: { heading: '章節', total: (chapters, minutes) => `共 ${chapters} 章 · 約 ${minutes} 分鐘` },
    chapter: {
      label: (n) => `第 ${n} 章`,
      lengthLabel: '影片長度',
      whatYoullSee: '影片中會看到',
      playFrom: (time) => `從 ${time} 開始播放`,
      nowPlaying: '播放中',
      timesNote: '時間都是實測，並標出跑該步驟的機器；影片中可能是另一次執行。',
      playerTitle: (n, title) => `第 ${n} 章：${title}（操作錄影）`,
      screensTitle: '實際畫面',
    },
    chapters: {
      c1: {
        title: '從文字到圖片，再到影片',
        short: '文字 → 圖片 → 影片',
        summary: '在 Image Studio 用 Qwen-Image 2.1 把 Prompt 變成一張圖，再把這張圖當成影片鏡頭的第一格。接著一次渲染用上兩台機器、三顆 GPU，每個階段都回報實測耗時。',
        steps: [
          { text: '在 [[Image Studio]] 寫一段 Prompt，選好 [[Output size]] 和 seed。' },
          { text: '[[Start Required Components]] 只喚醒這張圖需要的模型。', measure: '啟動圖片 DiT（今天）' },
          { text: '[[Generate Image]]：邊生成邊看預覽，結果留成可以比較的 take。', measure: '每張劇照，端到端（今天四次）' },
          { text: '[[Use in Video Shot…]] → [[fl2va first frame]]：用這張圖開一個新鏡頭。' },
          { text: '[[Render Engine]]：文字在 DGX Spark，DiT 與影像在 RTX 5080，聲音在 RTX 3060。' },
          { text: '[[Stages]] 回報每一步的實測耗時，鏡頭從你的圖開始動起來。', measure: '每段 5.17 秒含聲音片段（今天四次）' },
        ],
        note: { tone: 'warning', text: '在 App 裡，從素材庫選圖當第一格的這條路徑，仍標示為 [[Not yet verified on GPU]]。' },
      },
      c2: {
        title: '參考素材與 Prompt Advisor',
        short: '參考素材與 Advisor',
        summary: '角色設定圖與一段音樂成為 `@Image1`、`@Audio1`，各自對應到 H3 的標籤。Prompt Advisor 邊打邊用 74 條規則檢查，每條建議都標出依據。',
        steps: [
          { text: '[[Add from Library]] 與 [[Upload File]]：加入角色設定圖，以及我們自己用 Suno 做的一段音樂。' },
          { text: '每個素材都有 @ 名稱，每個 @ 都對應到 H3 的標籤，例如 [[H3: <Picture 1>]]。' },
          { text: '用 [[Templates]] 從官方的六段格式開始寫。' },
          { text: '[[Fixes & Suggestions]] 邊打邊檢查 74 條規則，每條建議都標上 [[Official]]、[[Code]] 或 [[Guide Advice]]。' },
          { text: '[[Apply Fix…]] 先以差異預覽修改，按 [[Apply]] 才會套用。' },
          { text: '按 [[Render Shot]]：圖片與音樂參考一起渲染成一個鏡頭。', measure: '每段片段，一張參考圖（今天兩次）' },
        ],
        note: { tone: 'info', text: 'Prompt Advisor 說明它檢查了什麼；這些建議能不能讓影片變好，還沒有量測過。' },
      },
      c3: {
        title: '剪輯、效果與匯出',
        short: '剪輯與匯出',
        summary: '渲染好的鏡頭放上真正的時間軸，逐格分割、修剪、吸附。加上溶接、不變音高的變速和標題，最後由 FFmpeg 匯出一支 MP4。',
        steps: [
          { text: '在 [[V1 Video]] 軌道上拖曳片段，排好順序。' },
          { text: '[[Split at Playhead]] 與修剪把手都精準到格，還會自動吸附。' },
          { text: '到 [[Effects]]，用 [[Cross Dissolve]] 讓鏡頭之間溶接。' },
          { text: '[[Speed]] → 1.5×：聲音變速但音高不變；再用 [[Text]] 放上標題。' },
          { text: '[[Export Sequence…]] → [[Start Export]]：由 FFmpeg 輸出一支 MP4。', measure: '兩段未加效果的片段（先前示範）' },
        ],
      },
      c4: {
        title: '圖片反推 Prompt',
        short: '圖片反推 Prompt',
        summary: '從一張圖反推出可以編輯的 Prompt：DGX Spark 上的視覺模型填好八段場景，提出核心與完整兩種 Prompt，再把每個候選重新生成並評分。',
        steps: [
          { text: '[[Image to Prompt]] → [[New Image-to-Prompt Study]]，從素材庫裡的一張圖開始。' },
          { text: '[[Analyze Source Image]]：視覺模型在 DGX Spark 上分析。', measure: '分析一張圖（先前實測）' },
          { text: '[[Scene & Candidates]] 填好八個段落，從 [[Subject]] 到 [[Visible Text]]。' },
          { text: '[[Candidate Prompts]] 提供核心版與完整版，可以直接修改。' },
          { text: '[[Generate & Compare]] 把每個候選重新生成並以 [[Loss]] 評分；[[Apply to Image Studio]] 把最好的送回去。' },
        ],
        note: { tone: 'info', text: '[[Loss]] 是機器評審給的差異分數（0 代表每個段落都相符），不是準確率。' },
      },
      c5: {
        title: '管線、元件與紀錄',
        short: '管線、元件與紀錄',
        summary: '每次渲染都是一條可以打開的管線：每個節點都是獨立程序，跑在你選的機器上，精度可以逐元件設定。渲染之後，Records 告訴你每一秒花在哪裡，全部實測，不靠猜。',
        steps: [
          { text: '[[Components]] → [[Pipelines]] → [[Graph]]：每個節點都是獨立程序，跑在你選的機器上。' },
          { text: '在 [[Component Instance]] 換一個 DiT；清單只列出相容的引擎。', measure: '啟動影片 DiT（今天）' },
          { text: '在 [[Precision (each field is independent)]] 可逐元件設定精度，量化時可讓指定的層保留 BF16。' },
          { text: '[[Run History]] → [[Step Timeline]]：每一步都放在跑它的機器上。' },
          { text: '[[Time Conclusion (Measured Values Only)]]：沒量到的就顯示 [[Not measured]]，絕不填 0。', measure: '個指標，各有單位與量測方法' },
          { text: '最多比較八筆紀錄；seed 不同之類的干擾因素會先標出來。' },
        ],
      },
    },
    screens: {
      pendingTitle: '真實畫面擷取中',
      pendingBody: '這裡會放上 Phasyn Studio 的實際畫面。',
      enlarge: (caption) => `放大檢視：${caption}`,
      close: '關閉',
      captures: {
        'image-studio-generating': 'Image Studio：生成中，預覽即時更新',
        'image-studio-takes': 'Image Studio：生成完成的 take',
        'render-engine-image': 'Generation Engine：圖片模型都在 RTX 5080，每個節點只載一個 DiT',
        'render-engine-three-machines': 'Render Engine：一次渲染用上兩台機器、三顆 GPU',
        'render-progress': '渲染進度與各階段的實測耗時',
        'video-studio-editor': 'Video Studio 的剪輯畫面',
        'references-mentions': '參考素材與 @ 名稱',
        'prompt-advisor': 'Prompt Advisor：修正與建議',
        'timeline-effects': '時間軸與效果',
        'export-dialog': '匯出序列',
        'image-to-prompt-result': '圖片反推 Prompt 的結果',
        'components-pipeline-graph': 'fl2va 管線的節點圖',
        'component-inspector-precision': 'dit-5080 的元件設定與精度',
        'records-run-steps': '雨夜片段的執行紀錄：每一步與它的機器',
        'records-compare': '比較紀錄，先標出干擾因素',
        'terminal-phasynctl': '終端機裡的 phasynctl',
      },
    },
    agent: {
      eyebrow: 'AGENT SKILL · PHASYNCTL · MCP',
      title: '或者，交給 Agent。',
      body: 'Phasyn Studio 的 skill 讓 Agent 使用 `phasynctl` 命令列工具，以及可選的 MCP 伺服器（22 個工具）。它能讀取即時狀態、比較執行，並在送出前先 dry run。',
    },
    notes: {
      title: '關於這些錄影',
      items: [
        '每一章都是英文介面上的真實操作，錄影製作中。等待的片段會加速或剪掉，時間一律寫明跑在哪台機器。',
        '這裡展示的是圖片反推 Prompt；影片反推還沒有用真正的模型跑過，所以沒有收錄。',
        'One-Click Character Swap（一鍵換角）仍在測試中，不在這次的導覽裡。請只使用你擁有權利的素材，不要冒用真人身分。',
        '白底版本是把圖片放到白色背景上；真正的去背功能即將加入。',
      ],
    },
    closing: {
      title: '接下來，看數字。',
      lead: '這個網站上的每個速度，都寫明每一步是哪台機器跑的。',
      benchmarks: { body: '在同一張 RTX 5080 上測了 40 個 DiT 版本：37 個產出影片，3 個無法載入。', cta: '看數據分析' },
      about: { body: '為什麼一個人要做一套橫跨兩台機器、三顆 GPU 的 AI 影片工作台。', cta: '讀這個故事' },
    },
  },

  ja: {
    hero: {
      eyebrow: 'TOUR · 5 CHAPTERS · REAL SCREENS',
      title: '実際の操作を、そのまま。',
      lead: '全 5 章、英語 UI での実際の操作を、マシンの処理を待つ場面だけ早送りして収録します。録画は現在制作中です。',
      stats: { chapters: 'チャプター', minutes: '分', gpus: 'GPU', gpusSub: '2 台のマシン' },
      start: '第 1 章から見る',
      agent: 'エージェントに任せる',
      capture: '実際の画面：Image Studio で生成を終えたテイク',
    },
    index: { heading: 'チャプター', total: (chapters, minutes) => `全 ${chapters} 章 · 約 ${minutes} 分` },
    chapter: {
      label: (n) => `第 ${n} 章`,
      lengthLabel: '動画の長さ',
      whatYoullSee: '映像の流れ',
      playFrom: (time) => `${time} から再生`,
      nowPlaying: '再生中',
      timesNote: '時間はすべて実測値で、そのステップを実行したマシンを明記しています。動画には別の実行が映っている場合があります。',
      playerTitle: (n, title) => `第 ${n} 章：${title}（操作の録画）`,
      screensTitle: '実際の画面',
    },
    chapters: {
      c1: {
        title: 'テキストから画像、そして映像へ',
        short: 'テキスト → 画像 → 映像',
        summary: 'Image Studio で Prompt を Qwen-Image 2.1 の静止画にし、その画像を動画ショットの先頭フレームにします。1 回のレンダリングは 2 台のマシン、3 つの GPU にまたがり、各ステージが実測時間を報告します。',
        steps: [
          { text: '[[Image Studio]] で Prompt を 1 つ書き、[[Output size]] と seed を選びます。' },
          { text: '[[Start Required Components]] で、この画像に必要なモデルだけを起動します。', measure: '画像 DiT の起動（今日）' },
          { text: '[[Generate Image]] を押すと生成中もプレビューが更新され、結果は比較できるテイクとして残ります。', measure: '静止画 1 枚、エンドツーエンド（今日の 4 回）' },
          { text: '[[Use in Video Shot…]] → [[fl2va first frame]] で、この画像から新しいショットを始めます。' },
          { text: '[[Render Engine]]：テキストは DGX Spark、DiT と映像は RTX 5080、音声は RTX 3060 です。' },
          { text: '[[Stages]] が各ステップの実測時間を報告し、ショットはあなたの画像から動き出します。', measure: '音声付き 5.17 秒のクリップ 1 本（今日の 4 回）' },
        ],
        note: { tone: 'warning', text: 'アプリでは、ライブラリの画像を先頭フレームに選ぶ経路に、まだ [[Not yet verified on GPU]] と表示されています。' },
      },
      c2: {
        title: '参照素材と Prompt Advisor',
        short: '参照素材と Advisor',
        summary: 'キャラクターシートと音楽クリップが `@Image1`・`@Audio1` になり、それぞれ H3 のタグに対応します。Prompt Advisor は入力中に 74 のルールでチェックし、指摘ごとに根拠を示します。',
        steps: [
          { text: '[[Add from Library]] と [[Upload File]] で、キャラクターシートと自作の Suno 楽曲のクリップを追加します。' },
          { text: '素材ごとに @ 名前が付き、@ はそれぞれ [[H3: <Picture 1>]] のような H3 のタグに対応します。' },
          { text: '[[Templates]] で、公式の 6 セクション形式から書き始めます。' },
          { text: '[[Fixes & Suggestions]] が入力中に 74 のルールをチェックし、指摘には [[Official]]・[[Code]]・[[Guide Advice]] のバッジが付きます。' },
          { text: '[[Apply Fix…]] で変更を差分としてプレビューし、[[Apply]] を押すまで何も変わりません。' },
          { text: '[[Render Shot]] で、画像と音楽の参照がひとつのショットになります。', measure: 'クリップ 1 本、参照画像 1 枚（今日の 2 回）' },
        ],
        note: { tone: 'info', text: 'Prompt Advisor が示すのはチェックの内容です。助言で映像が良くなるかは、まだ計測していません。' },
      },
      c3: {
        title: '編集・エフェクト・書き出し',
        short: '編集と書き出し',
        summary: 'レンダリングしたショットを本物のタイムラインに並べ、フレーム単位で分割・トリム・スナップします。ディゾルブ、ピッチを保つ速度変更、タイトルを加え、FFmpeg で 1 本の MP4 に書き出します。',
        steps: [
          { text: '[[V1 Video]] トラックでクリップをドラッグして並べます。' },
          { text: '[[Split at Playhead]] とトリムハンドルはフレーム単位で、スナップも効きます。' },
          { text: '[[Effects]] の [[Cross Dissolve]] で、ショットをなめらかにつなぎます。' },
          { text: '[[Speed]] → 1.5× にしても音声のピッチは変わりません。[[Text]] でタイトルも入れます。' },
          { text: '[[Export Sequence…]] → [[Start Export]] で、FFmpeg が 1 本の MP4 を書き出します。', measure: 'エフェクトなし 2 クリップ（以前のデモ）' },
        ],
      },
      c4: {
        title: '画像から Prompt へ',
        short: '画像から Prompt へ',
        summary: '画像から編集できる Prompt を逆推定します。DGX Spark の視覚モデルが 8 セクションのシーンを埋め、コアと詳細の Prompt を提案し、候補ごとに再生成してスコアを付けます。',
        steps: [
          { text: '[[Image to Prompt]] → [[New Image-to-Prompt Study]] で、ライブラリの画像から始めます。' },
          { text: '[[Analyze Source Image]] で、DGX Spark の視覚モデルが解析します。', measure: '画像 1 枚の解析（以前の実測）' },
          { text: '[[Scene & Candidates]] に、[[Subject]] から [[Visible Text]] まで 8 つのセクションが埋まります。' },
          { text: '[[Candidate Prompts]] にコア版と詳細版が出て、そのまま編集できます。' },
          { text: '[[Generate & Compare]] で候補ごとに再生成して [[Loss]] で採点し、[[Apply to Image Studio]] でいちばん良いものを戻します。' },
        ],
        note: { tone: 'info', text: '[[Loss]] は機械の判定による差分スコア（0 は全セクション一致）で、正解率ではありません。' },
      },
      c5: {
        title: 'パイプライン・コンポーネント・記録',
        short: 'パイプラインと記録',
        summary: 'レンダリングはすべて、開いて見られるパイプラインです。ノードはそれぞれ独立したプロセスとして好きなマシンで動き、精度はコンポーネントごとに設定できます。そのあと Records で、時間の行き先を推測ではなく実測で確かめます。',
        steps: [
          { text: '[[Components]] → [[Pipelines]] → [[Graph]]。ノードはそれぞれ独立したプロセスで、選んだマシンで動きます。' },
          { text: '[[Component Instance]] で DiT を差し替えます。候補は互換性のあるエンジンだけです。', measure: '動画 DiT の起動（今日）' },
          { text: '[[Precision (each field is independent)]] でコンポーネントごとに精度を設定でき、量子化時は指定した層を BF16 のまま残せます。' },
          { text: '[[Run History]] → [[Step Timeline]] に、各ステップが実行したマシンごとに並びます。' },
          { text: '[[Time Conclusion (Measured Values Only)]]：計測していない値は [[Not measured]] と表示され、0 にはなりません。', measure: 'の指標（単位と計測方法付き）' },
          { text: '最大 8 件の記録を比較でき、seed の違いなどの交絡要因を先に警告します。' },
        ],
      },
    },
    screens: {
      pendingTitle: '実際の画面を取得中',
      pendingBody: 'ここに Phasyn Studio の実際の画面が入ります。',
      enlarge: (caption) => `拡大表示：${caption}`,
      close: '閉じる',
      captures: {
        'image-studio-generating': 'Image Studio：生成中のプレビュー',
        'image-studio-takes': 'Image Studio：生成を終えたテイク',
        'render-engine-image': 'Generation Engine：画像モデルはすべて RTX 5080、ノードごとに DiT は 1 つ',
        'render-engine-three-machines': 'Render Engine：1 回のレンダリングが 2 台のマシン、3 つの GPU に',
        'render-progress': 'レンダリングの進捗とステージごとの実測時間',
        'video-studio-editor': 'Video Studio の編集画面',
        'references-mentions': '参照素材と @ 名前',
        'prompt-advisor': 'Prompt Advisor：修正と提案',
        'timeline-effects': 'タイムラインとエフェクト',
        'export-dialog': 'シーケンスの書き出し',
        'image-to-prompt-result': '画像からの逆推定の結果',
        'components-pipeline-graph': 'fl2va パイプラインのノードグラフ',
        'component-inspector-precision': 'dit-5080 のコンポーネント設定と精度',
        'records-run-steps': '雨の街クリップの実行記録：ステップと実行マシン',
        'records-compare': '記録の比較と交絡要因の警告',
        'terminal-phasynctl': 'ターミナルの phasynctl',
      },
    },
    agent: {
      eyebrow: 'AGENT SKILL · PHASYNCTL · MCP',
      title: 'エージェントに任せる',
      body: 'Phasyn Studio のスキルで、エージェントは `phasynctl` CLI と、任意の MCP サーバー（22 ツール）を使えます。ライブの状態を読み、実行を比較し、送信前にドライランで確かめます。',
    },
    notes: {
      title: 'この録画について',
      items: [
        '各章は英語 UI での実際の操作です（録画は制作中）。待ち時間は早送りかカットし、時間には必ず実行したマシンを記します。',
        '紹介しているのは画像からの逆推定です。動画からの逆推定は実モデルでまだ動かしていないため、収録していません。',
        'One-Click Character Swap（ワンクリックのキャラクター差し替え）はテスト中のため、このガイドには含めていません。権利を持つ素材だけを使い、実在の人物になりすまさないでください。',
        '白背景のコピーは、画像を白い背景に置いたものです。背景除去そのものは近日追加予定です。',
      ],
    },
    closing: {
      title: '次は、数字を。',
      lead: 'このサイトの速度には、すべて各ステップを実行したマシンを明記しています。',
      benchmarks: { body: '1 枚の RTX 5080 で 40 の DiT バリアントを計測しました。37 が映像を出力し、3 つは読み込めませんでした。', cta: 'ベンチマークを見る' },
      about: { body: 'なぜ 1 人で、2 台のマシンと 3 つの GPU にまたがる AI 映像制作ワークベンチを作ったのか。', cta: 'ストーリーを読む' },
    },
  },

  en: {
    hero: {
      eyebrow: 'TOUR · 5 CHAPTERS · REAL SCREENS',
      title: 'See it work, for real.',
      lead: 'Five chapters of real sessions in the English\u00a0UI, sped up only where the machines are working. The recordings are in production.',
      stats: { chapters: 'chapters', minutes: 'minutes', gpus: 'GPUs', gpusSub: 'on 2 machines' },
      start: 'Start Chapter 1',
      agent: 'Or Hand It to an Agent',
      capture: 'Real screen: a finished take in Image Studio',
    },
    index: { heading: 'Chapters', total: (chapters, minutes) => `${chapters} chapters · about ${minutes} min` },
    chapter: {
      label: (n) => `Chapter ${n}`,
      lengthLabel: 'Video length',
      whatYoullSee: 'What You’ll See',
      playFrom: (time) => `Play from ${time}`,
      nowPlaying: 'Now playing',
      timesNote: 'Times are measured runs on the machines named; the video may show a different run.',
      playerTitle: (n, title) => `Chapter ${n}: ${title} — recorded session`,
      screensTitle: 'Real Screens',
    },
    chapters: {
      c1: {
        title: 'Text to Image to Video',
        short: 'Text → Image → Video',
        summary: 'A prompt becomes a Qwen-Image 2.1 still in Image Studio, and the still becomes the first frame of a video shot. One render then runs on three GPUs across two machines, and every stage reports its measured time.',
        steps: [
          { text: 'Write one prompt in [[Image Studio]], then pick an [[Output size]] and a seed.' },
          { text: '[[Start Required Components]] wakes only the models this image needs.', measure: 'to start the image DiT, today' },
          { text: '[[Generate Image]]: the preview updates while it renders, and the result stays as a take.', measure: 'per still, end to end · today’s four runs' },
          { text: '[[Use in Video Shot…]] → [[fl2va first frame]] opens a new shot on the image.' },
          { text: '[[Render Engine]]: text on DGX Spark, DiT and video on the RTX 5080, audio on the RTX 3060.' },
          { text: '[[Stages]] reports each step’s measured time, and the shot opens on your image.', measure: 'per 5.17 s clip with audio · today’s four runs' },
        ],
        note: { tone: 'warning', text: 'Choosing a library image as the first frame is still marked [[Not yet verified on GPU]] in the app.' },
      },
      c2: {
        title: 'References and Prompt Advisor',
        short: 'References and Advisor',
        summary: 'A character sheet and a music clip become `@Image1` and `@Audio1`, each mapped to an H3 tag. Prompt Advisor checks the prompt with 74 rules as you type and cites a source for every finding.',
        steps: [
          { text: '[[Add from Library]] and [[Upload File]] bring in a character sheet and a music clip — our own Suno track.' },
          { text: 'Each one gets an @name, and every mention maps to an H3 tag, such as [[H3: <Picture 1>]].' },
          { text: '[[Templates]] starts the prompt from the official six-section format.' },
          { text: '[[Fixes & Suggestions]] checks 74 rules as you type; each finding is badged [[Official]], [[Code]] or [[Guide Advice]].' },
          { text: '[[Apply Fix…]] previews the change as a diff; nothing changes until [[Apply]].' },
          { text: '[[Render Shot]]: the image and music references render into one shot.', measure: 'per clip with one reference image · today’s two runs' },
        ],
        note: { tone: 'info', text: 'Prompt Advisor reports what it checks; whether its advice improves the video hasn’t been measured.' },
      },
      c3: {
        title: 'Edit, Add Effects, Export',
        short: 'Edit and Export',
        summary: 'Rendered shots go on a real timeline: split, trim and snap, frame by frame. Add a dissolve, a speed change that keeps the pitch and a title — then FFmpeg exports one MP4.',
        steps: [
          { text: 'Drag clips along the [[V1 Video]] track to set the order.' },
          { text: '[[Split at Playhead]] and the trim handles work frame by frame, with snapping.' },
          { text: 'In [[Effects]], [[Cross Dissolve]] blends one shot into the next.' },
          { text: '[[Speed]] → 1.5×: the audio changes speed without changing pitch; [[Text]] adds a title.' },
          { text: '[[Export Sequence…]] → [[Start Export]]: FFmpeg writes one MP4.', measure: 'two plain clips · earlier demo' },
        ],
      },
      c4: {
        title: 'Image to Prompt',
        short: 'Image to Prompt',
        summary: 'Start from an image and get an editable prompt back: the vision model on DGX Spark fills an eight-section scene, proposes core and detailed prompts, then regenerates and scores each candidate.',
        steps: [
          { text: '[[Image to Prompt]] → [[New Image-to-Prompt Study]] starts from an image in the library.' },
          { text: '[[Analyze Source Image]] runs the vision model on the DGX Spark.', measure: 'to analyze one image · earlier measurement' },
          { text: '[[Scene & Candidates]] fills eight sections, from [[Subject]] to [[Visible Text]].' },
          { text: '[[Candidate Prompts]] offers a core and a detailed version, ready to edit.' },
          { text: '[[Generate & Compare]] regenerates each candidate and scores it with [[Loss]]; [[Apply to Image Studio]] sends the best one back.' },
        ],
        note: { tone: 'info', text: '[[Loss]] is a difference score from a machine judge (0 means every section matches), not an accuracy rate.' },
      },
      c5: {
        title: 'Pipelines, Components and Records',
        short: 'Pipelines and Records',
        summary: 'Every render is a pipeline you can open: each node is its own process on the machine you choose, with precision set per component. Afterwards, Records shows where every second went — measured, never guessed.',
        steps: [
          { text: '[[Components]] → [[Pipelines]] → [[Graph]]: each node is its own process, on the machine you choose.' },
          { text: 'Swap the DiT in [[Component Instance]]; only compatible engines are offered.', measure: 'to start a video DiT, today' },
          { text: 'Set precision per component in [[Precision (each field is independent)]], and keep chosen layers in BF16 when quantizing.' },
          { text: '[[Run History]] → [[Step Timeline]] puts every step on the machine that ran it.' },
          { text: '[[Time Conclusion (Measured Values Only)]]: anything not measured reads [[Not measured]], never zero.', measure: 'metrics, each with a unit and a method' },
          { text: 'Compare up to eight recordings; confounders, such as a different seed, are flagged first.' },
        ],
      },
    },
    screens: {
      pendingTitle: 'Real capture pending',
      pendingBody: 'A real Phasyn Studio screen goes here.',
      enlarge: (caption) => `Enlarge: ${caption}`,
      close: 'Close',
      captures: {
        'image-studio-generating': 'Image Studio, mid-render with a live preview',
        'image-studio-takes': 'Image Studio: a finished take',
        'render-engine-image': 'Generation Engine: the image models on the RTX 5080, one DiT per node',
        'render-engine-three-machines': 'Render Engine: one render on three GPUs across two machines',
        'render-progress': 'Render progress and measured stage times',
        'video-studio-editor': 'The Video Studio editor',
        'references-mentions': 'References and @mentions',
        'prompt-advisor': 'Prompt Advisor: fixes and suggestions',
        'timeline-effects': 'Timeline and effects',
        'export-dialog': 'The Export Sequence dialog',
        'image-to-prompt-result': 'Image to Prompt results',
        'components-pipeline-graph': 'The fl2va pipeline as a node graph',
        'component-inspector-precision': 'Settings and precision for dit-5080',
        'records-run-steps': 'The rain clip’s run record: each step and its machine',
        'records-compare': 'Comparing recordings, confounders first',
        'terminal-phasynctl': 'phasynctl in a terminal',
      },
    },
    agent: {
      eyebrow: 'AGENT SKILL · PHASYNCTL · MCP',
      title: 'Or Hand It to an Agent.',
      body: 'The Phasyn Studio skill gives an agent the `phasynctl` CLI and an optional MCP server with 22 tools. It reads live status, compares runs and dry-runs a render before anything is sent.',
    },
    notes: {
      title: 'About These Recordings',
      items: [
        'Each chapter is a real session in the English UI; the recordings are in production. Waits are sped up or cut, and every time names the machine that ran it.',
        'Image to prompt is shown; video to prompt isn’t, because it hasn’t run on the real model yet.',
        'One-Click Character Swap is in testing and isn’t part of this tour. Only use material you have the rights to, and never impersonate a real person.',
        'The white-background copy places the image on white; background removal itself is coming.',
      ],
    },
    closing: {
      title: 'Now See the Numbers.',
      lead: 'Every speed on this site names the machine that ran each step.',
      benchmarks: { body: '40 DiT variants timed on one RTX 5080: 37 produced video, 3 failed to load.', cta: 'See Benchmarks' },
      about: { body: 'Why one person built an AI filmmaking workbench that spans two machines and three GPUs.', cta: 'Read the Story' },
    },
  },
};
