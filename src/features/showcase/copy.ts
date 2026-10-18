import type { Copy } from '../../i18n/locale.tsx';
import type { ShowcaseCategory, ShowcaseKind } from './types.ts';

/*
 * Showcase copy. Every claim is in docs/BRIEF.md §3, work/reviews/BRIEF.md, studio/gen/RUNS.md or work/product/
 * product-analysis.md; every number on the page comes from the items (data.ts), never from these strings. Product, area,
 * model, pipeline and component names stay untranslated. The media was generated through the controller API — never say
 * it was made "in Image Studio / Video Studio".
 */

export type WorkflowId = 'storyboard' | 'character' | 'advisor' | 'agent' | 'machines';

/** Tour anchors (the Tour's chapter ids, feat/tour). A missing anchor still lands on the Tour. */
export const WORKFLOW_TOUR_ANCHOR: Record<WorkflowId, string> = {
  storyboard: 'c1',
  character: 'c2',
  advisor: 'c2',
  agent: 'agent',
  machines: 'c5',
};

export const WORKFLOW_IDS: readonly WorkflowId[] = ['storyboard', 'character', 'advisor', 'agent', 'machines'];

interface Workflow {
  title: string;
  summary: string;
  steps: readonly string[];
  /** Honesty note shown under the steps (status of a part of the flow). */
  note?: string;
}

export interface ShowcaseCopy {
  hero: {
    title: readonly string[];
    lead: string;
    stats: { results: string; video: string; render: string; gpus: (hosts: number) => string; films: (minutes: string) => string };
    minutes: string;
    featured: string;
    jump: string;
  };
  ticker: string;
  player: {
    soundOn: string;
    soundOff: string;
    play: string;
    pause: string;
    show: (title: string) => string;
    clipLabel: (title: string) => string;
  };
  card: {
    ai: string;
    kind: Record<ShowcaseKind, string>;
    seed: string;
    resolution: string;
    endToEnd: string;
    clip: (frames: number, fps: number, seconds: string) => string;
    pipeline: string;
    model: string;
    engine: string;
    run: string;
    output: string;
    prompt: string;
    showPrompt: string;
    steps: string;
    lanesNote: string;
    notRecorded: string;
    placementNotRecorded: string;
    approx: string;
    firstFrame: string;
    referenceImage: string;
    madeFrom: string;
    stepName: Record<string, string>;
    stepShort: Record<string, string>;
    seconds: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    lead: string;
    films: string;
    filmsLead: string;
    shots: (n: number) => string;
    music: string;
    shotList: string;
    shotHeaders: { shot: string; run: string; seed: string; length: string };
    moreFilms: (n: number) => string;
    social: string;
    socialLead: string;
    singles: string;
    filterLabel: string;
    all: string;
    category: Record<ShowcaseCategory, string>;
    count: (n: number) => string;
    more: (n: number) => string;
    empty: string;
  };
  breakdown: {
    eyebrow: string;
    title: string;
    lead: string;
    stages: { prompt: string; still: string; frame: string; clip: string };
    stillMeta: (seed: number, seconds: string) => string;
    frameMeta: string;
    clipMeta: (seed: number, frames: number, seconds: string) => string;
    timelineTitle: (seconds: string) => string;
    timelineNote: string;
    replay: string;
    capture: string;
    stillPrompt: string;
    clipPrompt: string;
  };
  character: {
    eyebrow: string;
    title: string;
    lead: string;
    sheet: string;
    candidates: string;
    picked: string;
    subject: string;
    scenes: (n: number) => string;
    scenesLead: string;
  };
  workflows: {
    eyebrow: string;
    title: string;
    lead: string;
    tour: string;
    items: Record<WorkflowId, Workflow>;
  };
  notes: { title: string; items: readonly string[]; loudness: (loudest: string, quietest: string, rates: string) => string; glyphs: string; films: (mix: string) => string };
  closing: { title: string; lead: string; tour: string; benchmarks: string; film: string };
}

const STEP_NAME_ZH = { te: '文字編碼', venc: '影片 VAE 編碼', aenc: '音訊 VAE 編碼', dit: 'DiT 去噪', video: '影片 VAE 解碼', audio: '音訊 VAE 解碼', mux: '封裝（Mux）', vae: 'VAE 解碼', compose: '合成', 'vae-compose': 'VAE 解碼＋合成' };
const STEP_NAME_JA = { te: 'テキストエンコード', venc: '映像 VAE エンコード', aenc: '音声 VAE エンコード', dit: 'DiT デノイズ', video: '映像 VAE デコード', audio: '音声 VAE デコード', mux: '多重化（Mux）', vae: 'VAE デコード', compose: '合成', 'vae-compose': 'VAE デコード＋合成' };
const STEP_NAME_EN = { te: 'Text encoder', venc: 'Video VAE encode', aenc: 'Audio VAE encode', dit: 'DiT denoise', video: 'Video VAE decode', audio: 'Audio VAE decode', mux: 'Mux', vae: 'VAE decode', compose: 'Compose', 'vae-compose': 'VAE decode + compose' };

/** Lane-sized step names (cards); the full names above stay for the breakdown and tooltips. */
const STEP_SHORT_ZH = { te: '文字編碼', venc: '影片編碼', aenc: '音訊編碼', dit: 'DiT', video: '影片解碼', audio: '音訊解碼', mux: '封裝', vae: 'VAE 解碼', compose: '合成', 'vae-compose': 'VAE＋合成' };
const STEP_SHORT_JA = { te: 'テキスト', venc: '映像エンコード', aenc: '音声エンコード', dit: 'DiT', video: '映像デコード', audio: '音声デコード', mux: 'Mux', vae: 'VAE デコード', compose: '合成', 'vae-compose': 'VAE＋合成' };
const STEP_SHORT_EN = { te: 'TE', venc: 'VAE enc', aenc: 'Audio enc', dit: 'DiT', video: 'VAE dec', audio: 'Audio dec', mux: 'Mux', vae: 'VAE', compose: 'Compose', 'vae-compose': 'VAE + compose' };

export const SHOWCASE: Copy<ShowcaseCopy> = {
  'zh-hant': {
    hero: {
      title: ['這一頁的每一個畫面，', '都在作者家裡生成。'],
      lead: '這裡的圖片與影片，全部由 Phasyn Studio 透過控制器 API（t2i‑pc、fl2va‑pc、ref2va‑pc）在作者的兩台機器、三顆 GPU 上生成。每個單次生成的結果都附上 Prompt、管線、每一步跑在哪台機器，以及實測時間；短片則列出它剪進的每一個鏡頭。',
      stats: { results: '個生成結果', video: '秒有聲影片', render: '端到端生成時間合計', gpus: (hosts) => `顆 GPU，分在 ${hosts} 台機器`, films: (minutes) => `支短片，共 ${minutes} 分鐘` },
      minutes: '分鐘',
      featured: '精選',
      jump: '看全部結果',
    },
    ticker: '實測時間（控制器觀察值）',
    player: {
      soundOn: '開啟聲音',
      soundOff: '關閉聲音',
      play: '播放',
      pause: '暫停',
      show: (title) => `播放精選：${title}`,
      clipLabel: (title) => `${title}（AI 生成影片，靜音循環）`,
    },
    card: {
      ai: 'AI 生成',
      kind: { film: '短片', trailer: '預告', social: '直式短片', 'making-of': '幕後', still: '圖片', fl2va: '首幀 → 影片', ref2va: '參考圖 → 影片', multishot: '多鏡頭', roundtrip: '往返' },
      seed: '種子',
      resolution: '解析度',
      endToEnd: '端到端',
      clip: (frames, fps, seconds) => `${frames} 幀 · ${fps} fps · ${seconds} 秒`,
      pipeline: '管線',
      model: '模型',
      engine: 'DiT 元件',
      run: '執行',
      output: '輸出',
      prompt: 'Prompt',
      showPrompt: '看完整 Prompt',
      steps: '每一步跑在哪台機器',
      lanesNote: '長條是每台機器上的步驟時間。不同 GPU 上的步驟可以同時進行，所以加總可能超過端到端時間。',
      notRecorded: '未記錄',
      placementNotRecorded: '未記錄機器',
      approx: '約',
      firstFrame: '第一幀來自',
      referenceImage: '參考圖',
      madeFrom: '來源',
      stepName: STEP_NAME_ZH,
      stepShort: STEP_SHORT_ZH,
      seconds: '秒',
    },
    gallery: {
      eyebrow: 'GALLERY · EVERY RESULT',
      title: '每一個結果，都附上每一步。',
      lead: '圖片用 Qwen‑Image 2.1（t2i‑pc），影片用 MiniMax H3（fl2va‑pc、ref2va‑pc）。影片以原生 768×448 播放，沒有放大；進入畫面時靜音循環，按下聲音才會聽到 H3 一起生成的聲音。',
      films: '短片',
      filmsLead: '把多個生成鏡頭剪成一支的短片。進入畫面時靜音預覽，按下播放就會從頭連聲音一起播。',
      shots: (n) => `${n} 個鏡頭`,
      music: '配樂：Suno',
      shotList: '看鏡頭清單',
      shotHeaders: { shot: '鏡頭', run: '執行', seed: '種子', length: '長度' },
      moreFilms: (n) => `顯示更多短片（還有 ${n} 支）`,
      social: '直式短片',
      socialLead: '為手機裁成 9:16 的版本。',
      singles: '單次生成的結果',
      filterLabel: '依類型篩選',
      all: '全部',
      category: { film: '短片', social: '直式短片', image: '圖片', video: '影片', character: '角色', multishot: '多鏡頭' },
      count: (n) => `${n} 個結果`,
      more: (n) => `顯示更多（還有 ${n} 個）`,
      empty: '這個類型還沒有結果。',
    },
    breakdown: {
      eyebrow: 'BREAKDOWN · PROMPT → STILL → CLIP',
      title: '一段 Prompt，一張圖，一段有聲影片。',
      lead: '雨夜的巷子：t2i‑pc 先生成 1152×672 的圖，縮小成 768×448 後當成 fl2va‑pc 的第一幀，再加上動作與聲音的描述，生成 5.17 秒的有聲影片。',
      stages: { prompt: 'Prompt', still: '圖片', frame: '第一幀', clip: '有聲影片' },
      stillMeta: (seed, seconds) => `t2i‑pc · Qwen‑Image 2.1 · 種子 ${seed} · 端到端 ${seconds} 秒`,
      frameMeta: '1152×672 縮小成 768×448（H3 的畫面大小）',
      clipMeta: (seed, frames, seconds) => `fl2va‑pc · MiniMax H3 · 種子 ${seed} · ${frames} 幀 · 端到端 ${seconds} 秒`,
      timelineTitle: (seconds) => `這 ${seconds} 秒，每台機器在做什麼`,
      timelineNote: '步驟的位置依照這次執行在 Records 裡的 Step Timeline（下方是實際畫面）。影片解碼在 RTX 5080、音訊解碼在 RTX 3060，兩者同時進行。',
      replay: '重播時間軸',
      capture: '這次執行在 Records 裡的紀錄：每一步、每台機器（實際畫面）',
      stillPrompt: '圖片的 Prompt',
      clipPrompt: '影片的 Prompt（動作與聲音）',
    },
    character: {
      eyebrow: 'CHARACTER · ONE REFERENCE IMAGE',
      title: '同一個角色，換一個場景。',
      lead: '先用 t2i‑pc 生成白底的角色設定圖，再把它當成 ref2va‑pc 唯一的參考圖。Prompt 用 <Subject 1> 指名她，並要求 H3 保留 <Picture 1> 裡的樣子。請自己比較每一段。',
      sheet: '參考圖',
      candidates: '三個候選種子，各約 30 秒',
      picked: '選用',
      subject: 'Prompt 裡的角色定義',
      scenes: (n) => `同一張參考圖，${n} 個場景`,
      scenesLead: '每一段都只用這張圖當參考；場景、動作與鏡頭全由 Prompt 決定。',
    },
    workflows: {
      eyebrow: 'WORKFLOWS · FROM ONE IMAGE TO A DAILY TOOL',
      title: '從一張圖，到每天都在用的流程。',
      lead: '下面每一條流程，都只用到現在就有的功能，並連到操作導覽裡對應的章節。',
      tour: '在操作導覽裡看',
      items: {
        storyboard: {
          title: '分鏡 → 圖片 → 影片 → 時間軸 → MP4',
          summary: '一個專案從頭做到成片。',
          steps: [
            '在 Video Studio 的專案裡排好鏡頭，每個鏡頭一段 Prompt。',
            '在 Image Studio 用 Qwen‑Image 2.1 生成每個鏡頭的圖，用 Takes 比較不同種子。',
            '把圖當成鏡頭的 FL2VA 第一幀，生成有聲影片。',
            '在時間軸上排列、切割、對齊，加上溶接、變速、調色與字幕。',
            '用 FFmpeg 匯出一個 MP4（H.264 + AAC）。',
          ],
          note: '本頁的影片是透過控制器 API 這樣做的；App 裡「圖庫圖片當第一幀」目前仍標示「尚未在 GPU 上驗證」。',
        },
        character: {
          title: '同一個角色，走過每一場戲',
          summary: '一張參考圖，用在每個鏡頭。',
          steps: [
            '在 Image Studio 生成角色設定圖，挑出一個種子。',
            '用「Use in Video Shot…」把它設成鏡頭的 ref2va 參考圖。',
            '在 Prompt 裡用 @Image1 指名她；Ref2VA 六段式範本會先依鏡頭的參考素材填好。',
            '每個場景只改場景與動作，參考圖不變。',
            'Render 之後，在 Takes 裡並排比較不同種子。',
          ],
        },
        advisor: {
          title: '用 Prompt Advisor 反覆修 Prompt',
          summary: '一邊打字，一邊對照官方格式。',
          steps: [
            '一邊打字，74 條規則就在瀏覽器裡檢查 Prompt：45 條來自 MiniMax 官方指南，21 條來自已安裝的程式碼，8 條來自寫作指南。',
            '其中 21 條附一鍵修正：先看差異預覽，按下 Apply 才會改。',
            '錯誤等級的問題（例如 @ 名稱找不到對應素材）會在 Render 前擋下。',
            '用同一個種子重新 Render，在 Takes 裡比較前後。',
          ],
          note: 'Advisor 檢查的是格式與寫法；它對畫面品質的影響，還沒有用生成驗證過。',
        },
        agent: {
          title: '讓 Agent 跑一整晚',
          summary: '交給 Agent 排程，早上看比較。',
          steps: [
            'Agent 用 phasynctl（或可選的 MCP 伺服器，22 個工具）讀取狀態、啟動需要的元件。',
            '每次 Render 前先 dry run，參數會對照即時的 schema 檢查。',
            '控制器一次只跑一個 Run：Agent 逐一送出、等待、下載輸出。',
            '早上在 Records 比較 2–8 筆紀錄（會列出干擾因素），再匯出 JSONL 或 CSV。',
          ],
        },
        machines: {
          title: '把步驟分到自己的每台機器上',
          summary: '哪一步在哪張卡跑，由你決定。',
          steps: [
            '每台機器跑一個 NodeGateway，啟動後會自動向控制器註冊。',
            '文字編碼、DiT、VAE、音訊、Mux 都是獨立行程，可以放在任何一台機器上。',
            '在管線編輯器裡替每一步挑選元件實例，就能把它換到另一張卡。',
            '大檔案（latent、影片）以 FileRef 在節點之間直接傳遞，不經過控制器。',
            'Records 會寫明每一步在哪台機器、花了多久。',
          ],
          note: '目前的執行環境只有 RTX 50 系列、RTX 30 系列與 GB10；新增機器要手動安裝。',
        },
      },
    },
    notes: {
      title: '關於這些結果',
      loudness: (loudest, quietest, rates) => `網頁版已做響度正規化；原始輸出約 ${loudest}～${quietest} LUFS、AAC ${rates}。`,
      glyphs: '部分畫面裡的招牌文字，是模型生成的偽文字，不是真實的店名或品牌。',
      films: (mix) => `短片由多個生成鏡頭剪接而成；標示「配樂：Suno」的短片，在 H3 自己的聲音之上墊了 Suno 生成的配樂（Music generated with Suno）。短片的混音已完成母帶處理（約 ${mix} LUFS），網頁版照原樣使用。`,
      items: [
        '全部是 AI 生成：圖片來自 Qwen‑Image 2.1，影片與聲音來自 MiniMax H3，透過 Phasyn Studio 的控制器 API（t2i‑pc、fl2va‑pc、ref2va‑pc）在作者的機器上生成。「The Courier」是原創角色。',
        '模型授權：MiniMax H3 Community License（含地域限制與使用規範）；Qwen‑Image 2.1 僅限研究與非商業用途。模型權重不隨專案提供。',
        '以原生解析度顯示，沒有放大：圖片 1152×672（角色設定圖 768×1024），影片 768×448、24 fps。網頁版只做了壓縮（WebP、H.264）。',
        '時間是控制器觀察到的端到端時間與步驟時間，不含啟動或切換模型的時間（圖片 DiT 11.3 秒、dit‑5080 45.9 秒、Ref2VA DiT 40.6 秒）。四張圖片的步驟時間是約略值。',
        '不同 GPU 上的步驟可以同時進行（例如影片解碼與音訊解碼），所以步驟加總可能超過端到端時間。',
      ],
    },
    closing: {
      title: '想看它怎麼操作，還是想看數字？',
      lead: '操作導覽一步步走過真實的 App 畫面；效能實測寫明每一步跑在哪張卡。',
      tour: '看操作導覽',
      benchmarks: '看效能實測',
      film: '看介紹影片',
    },
  },

  ja: {
    hero: {
      title: ['この映像はすべて、', '自宅で生成しました。'],
      lead: 'ここにある画像と映像は、すべて Phasyn Studio がコントローラー API（t2i‑pc・fl2va‑pc・ref2va‑pc）を通じて、作者の 2 台のマシン・3 基の GPU で生成したものです。1 回の生成で得た結果には Prompt、パイプライン、各ステップを処理したマシン、実測時間を、ショートフィルムには使ったショットの一覧を載せています。',
      stats: { results: '件の生成結果', video: '秒の音付き映像', render: 'エンドツーエンドの生成時間（合計）', gpus: (hosts) => `基の GPU（${hosts} 台のマシン）`, films: (minutes) => `本のショートフィルム（計 ${minutes} 分）` },
      minutes: '分',
      featured: 'ピックアップ',
      jump: 'すべての結果を見る',
    },
    ticker: '実測時間（コントローラーの観測値）',
    player: {
      soundOn: '音声をオン',
      soundOff: '音声をオフ',
      play: '再生',
      pause: '一時停止',
      show: (title) => `ピックアップを再生：${title}`,
      clipLabel: (title) => `${title}（AI 生成の映像、無音でループ）`,
    },
    card: {
      ai: 'AI 生成',
      kind: { film: 'ショートフィルム', trailer: 'トレーラー', social: '縦型ショート', 'making-of': 'メイキング', still: '画像', fl2va: '先頭フレーム → 映像', ref2va: '参照画像 → 映像', multishot: 'マルチショット', roundtrip: 'ラウンドトリップ' },
      seed: 'シード',
      resolution: '解像度',
      endToEnd: 'エンドツーエンド',
      clip: (frames, fps, seconds) => `${frames} フレーム・${fps} fps・${seconds} 秒`,
      pipeline: 'パイプライン',
      model: 'モデル',
      engine: 'DiT コンポーネント',
      run: '実行',
      output: '出力',
      prompt: 'Prompt',
      showPrompt: 'Prompt 全文を見る',
      steps: '各ステップを処理したマシン',
      lanesNote: 'バーはマシンごとのステップ時間です。別々の GPU のステップは同時に進むことがあるため、合計がエンドツーエンドの時間を超える場合があります。',
      notRecorded: '未記録',
      placementNotRecorded: 'マシン未記録',
      approx: '約',
      firstFrame: '先頭フレームの元画像',
      referenceImage: '参照画像',
      madeFrom: '元にした素材',
      stepName: STEP_NAME_JA,
      stepShort: STEP_SHORT_JA,
      seconds: '秒',
    },
    gallery: {
      eyebrow: 'GALLERY · EVERY RESULT',
      title: 'すべての結果に、すべてのステップを。',
      lead: '画像は Qwen‑Image 2.1（t2i‑pc）、映像は MiniMax H3（fl2va‑pc・ref2va‑pc）で生成しています。映像はネイティブの 768×448 のまま拡大せずに表示し、画面内では無音でループします。音声ボタンを押すと、H3 が映像と一緒に生成した音を再生します。',
      films: 'ショートフィルム',
      filmsLead: '生成した複数のショットを 1 本に編集した短編です。画面内では無音でプレビューし、再生すると最初から音付きで流れます。',
      shots: (n) => `${n} ショット`,
      music: '音楽：Suno',
      shotList: 'ショット一覧を見る',
      shotHeaders: { shot: 'ショット', run: '実行', seed: 'シード', length: '長さ' },
      moreFilms: (n) => `さらに表示（残り ${n} 本）`,
      social: '縦型ショート',
      socialLead: 'スマートフォン向けに 9:16 で切り出した版です。',
      singles: '1 回の生成で得た結果',
      filterLabel: '種類で絞り込む',
      all: 'すべて',
      category: { film: 'ショートフィルム', social: '縦型ショート', image: '画像', video: '映像', character: 'キャラクター', multishot: 'マルチショット' },
      count: (n) => `${n} 件`,
      more: (n) => `さらに表示（残り ${n} 件）`,
      empty: 'この種類の結果はまだありません。',
    },
    breakdown: {
      eyebrow: 'BREAKDOWN · PROMPT → STILL → CLIP',
      title: 'ひとつの Prompt から、画像と音付きの映像へ。',
      lead: '雨の夜の路地。t2i‑pc で 1152×672 の画像を生成し、768×448 に縮小して fl2va‑pc の先頭フレームにしました。動きと音の説明を加えて、5.17 秒の音付き映像を生成しています。',
      stages: { prompt: 'Prompt', still: '画像', frame: '先頭フレーム', clip: '音付きの映像' },
      stillMeta: (seed, seconds) => `t2i‑pc・Qwen‑Image 2.1・シード ${seed}・エンドツーエンド ${seconds} 秒`,
      frameMeta: '1152×672 を 768×448（H3 のフレームサイズ）に縮小',
      clipMeta: (seed, frames, seconds) => `fl2va‑pc・MiniMax H3・シード ${seed}・${frames} フレーム・エンドツーエンド ${seconds} 秒`,
      timelineTitle: (seconds) => `この ${seconds} 秒、各マシンが何をしていたか`,
      timelineNote: 'ステップの位置は、この実行の Records にある Step Timeline に合わせています（下は実際の画面）。映像のデコードは RTX 5080、音声のデコードは RTX 3060 で同時に進みます。',
      replay: 'タイムラインを再生',
      capture: 'Records に残ったこの実行の記録：各ステップとマシン（実際の画面）',
      stillPrompt: '画像の Prompt',
      clipPrompt: '映像の Prompt（動きと音）',
    },
    character: {
      eyebrow: 'CHARACTER · ONE REFERENCE IMAGE',
      title: '同じキャラクターを、別のシーンへ。',
      lead: 't2i‑pc で白背景のキャラクターシートを生成し、ref2va‑pc の唯一の参照画像にしました。Prompt では彼女を <Subject 1> と定義し、<Picture 1> の見た目を保つよう H3 に指示しています。どのシーンも、ご自身で見比べてください。',
      sheet: '参照画像',
      candidates: '3 つの候補シード（各約 30 秒）',
      picked: '採用',
      subject: 'Prompt でのキャラクター定義',
      scenes: (n) => `同じ参照画像から ${n} つのシーン`,
      scenesLead: 'どの映像も参照はこの 1 枚だけで、場面・動き・カメラはすべて Prompt で指定しています。',
    },
    workflows: {
      eyebrow: 'WORKFLOWS · FROM ONE IMAGE TO A DAILY TOOL',
      title: '1 枚の画像から、毎日使うワークフローへ。',
      lead: 'どのワークフローも、いま使える機能だけで組んでいます。それぞれ操作ガイドの該当する章にリンクしています。',
      tour: '操作ガイドで見る',
      items: {
        storyboard: {
          title: '絵コンテ → 画像 → 映像 → タイムライン → MP4',
          summary: 'ひとつのプロジェクトで完成まで。',
          steps: [
            'Video Studio のプロジェクトにショットを並べ、ショットごとに Prompt を書きます。',
            'Image Studio の Qwen‑Image 2.1 で各ショットの画像を生成し、Takes でシードを比べます。',
            '画像をショットの FL2VA 先頭フレームにして、音付きの映像を生成します。',
            'タイムラインで並べ替え・分割・スナップし、ディゾルブ、速度、色、タイトルを加えます。',
            'FFmpeg で 1 本の MP4（H.264 + AAC）に書き出します。',
          ],
          note: 'このページの映像はコントローラー API でこの手順を実行しました。アプリの「ライブラリ画像を先頭フレームに使う」は、現在も「GPU で未検証」と表示されます。',
        },
        character: {
          title: '同じキャラクターで、すべてのシーンを',
          summary: '1 枚の参照画像を、どのショットにも。',
          steps: [
            'Image Studio でキャラクターシートを生成し、シードを 1 つ選びます。',
            '「Use in Video Shot…」で、ショットの ref2va 参照画像に設定します。',
            'Prompt では @Image1 で彼女を指定します。Ref2VA の 6 セクションテンプレートは、ショットの参照素材から下書きされます。',
            'シーンごとに変えるのは場面と動きだけで、参照画像はそのままです。',
            'レンダリング後、Takes でシードを並べて比べます。',
          ],
        },
        advisor: {
          title: 'Prompt Advisor で Prompt を磨く',
          summary: '書きながら、公式の書式と照らし合わせる。',
          steps: [
            '入力中に 74 のルールがブラウザ内で Prompt をチェックします。45 は MiniMax 公式ガイド、21 はインストール済みのコード、8 はライティングガイド由来です。',
            'そのうち 21 のルールにはワンクリック修正があり、差分をプレビューしてから Apply で反映します。',
            'エラー（@ 名に対応する素材がない、など）は、レンダリング前に止まります。',
            '同じシードで再レンダリングし、Takes で前後を比べます。',
          ],
          note: 'Advisor が確認するのは書式と書き方です。画質への効果は、生成ではまだ検証していません。',
        },
        agent: {
          title: 'エージェントに一晩任せる',
          summary: 'エージェントが回し、朝に比較を見る。',
          steps: [
            'エージェントは phasynctl（またはオプションの MCP サーバー、22 ツール）で状態を読み、必要なコンポーネントを起動します。',
            'レンダリングの前に毎回 dry run を行い、パラメーターをその場のスキーマと照合します。',
            'コントローラーが同時に処理する Run は 1 つだけです。エージェントは 1 件ずつ送信し、完了を待って出力をダウンロードします。',
            '朝、Records で 2〜8 件の記録を比較し（交絡要因も一覧になります）、JSONL や CSV に書き出します。',
          ],
        },
        machines: {
          title: 'ステップを自分のマシンに振り分ける',
          summary: 'どのステップをどの GPU で動かすか、自分で決める。',
          steps: [
            '各マシンで NodeGateway を動かすと、起動時にコントローラーへ自動で登録されます。',
            'テキストエンコーダー、DiT、VAE、音声、Mux はそれぞれ独立したプロセスで、どのマシンにも置けます。',
            'パイプラインエディターで各ステップのコンポーネントインスタンスを選べば、別の GPU に移せます。',
            '大きなファイル（latent、映像）は FileRef としてノード間で直接やり取りし、コントローラーを経由しません。',
            'Records には、各ステップをどのマシンで何秒かけて処理したかが残ります。',
          ],
          note: '現在のランタイムは RTX 50 シリーズ、RTX 30 シリーズ、GB10 のみです。マシンの追加は手作業でセットアップします。',
        },
      },
    },
    notes: {
      title: 'この作例について',
      loudness: (loudest, quietest, rates) => `Web 版はラウドネスを正規化しています（元の出力は約 ${loudest}〜${quietest} LUFS、AAC ${rates}）。`,
      glyphs: '一部の映像に映る看板の文字は、モデルが生成した疑似的な文字で、実在の店名やブランドではありません。',
      films: (mix) => `ショートフィルムは生成した複数のショットを編集したものです。「音楽：Suno」と表示した作品では、H3 自身の音の下に Suno で生成した音楽（Music generated with Suno）を敷いています。ミックスはマスタリング済み（約 ${mix} LUFS）で、Web 版もそのまま使っています。`,
      items: [
        'すべて AI による生成物です。画像は Qwen‑Image 2.1、映像と音は MiniMax H3 で、Phasyn Studio のコントローラー API（t2i‑pc・fl2va‑pc・ref2va‑pc）を通じて作者のマシンで生成しました。「The Courier」はオリジナルのキャラクターです。',
        'モデルのライセンス：MiniMax H3 Community License（地域制限と利用規約あり）、Qwen‑Image 2.1 は研究・非商用のみです。モデルの重みは同梱しません。',
        'ネイティブ解像度のまま、拡大せずに表示しています。画像は 1152×672（キャラクターシートは 768×1024）、映像は 768×448・24 fps です。Web 向けに行ったのは圧縮（WebP、H.264）だけです。',
        '時間はコントローラーが観測したエンドツーエンドとステップの時間で、モデルの起動や切り替えの時間（画像 DiT 11.3 秒、dit‑5080 45.9 秒、Ref2VA DiT 40.6 秒）は含みません。4 枚の画像のステップ時間は概算です。',
        '別々の GPU のステップ（映像と音声のデコードなど）は同時に進むことがあるため、ステップの合計がエンドツーエンドの時間を超える場合があります。',
      ],
    },
    closing: {
      title: '操作を見るか、数字を見るか。',
      lead: '操作ガイドでは実際のアプリ画面を順にたどり、ベンチマークでは各ステップをどの GPU で処理したかを明記しています。',
      tour: '操作ガイドを見る',
      benchmarks: 'ベンチマークを見る',
      film: '紹介映像を見る',
    },
  },

  en: {
    hero: {
      title: ['Every Frame Here', 'Was Generated at Home.'],
      lead: 'Every image and clip here was generated by Phasyn Studio through its controller API (t2i‑pc, fl2va‑pc, ref2va‑pc) on the author’s two machines and three GPUs. Each single result shows its prompt, its pipeline, the machine behind every step and the measured time; each film lists the shots it was cut from.',
      stats: { results: 'results', video: 's of video with sound', render: 'end-to-end render time, in total', gpus: (hosts) => `GPUs on ${hosts} machines`, films: (minutes) => `films, ${minutes} min in all` },
      minutes: 'min',
      featured: 'Featured',
      jump: 'See Every Result',
    },
    ticker: 'Measured times (controller-observed)',
    player: {
      soundOn: 'Sound On',
      soundOff: 'Sound Off',
      play: 'Play',
      pause: 'Pause',
      show: (title) => `Play featured: ${title}`,
      clipLabel: (title) => `${title} (AI-generated clip, muted loop)`,
    },
    card: {
      ai: 'AI-generated',
      kind: { film: 'Film', trailer: 'Trailer', social: 'Social Cut', 'making-of': 'Making Of', still: 'Image', fl2va: 'First Frame → Video', ref2va: 'Reference → Video', multishot: 'Multi-Shot', roundtrip: 'Round Trip' },
      seed: 'Seed',
      resolution: 'Resolution',
      endToEnd: 'End to end',
      clip: (frames, fps, seconds) => `${frames} frames · ${fps} fps · ${seconds} s`,
      pipeline: 'Pipeline',
      model: 'Model',
      engine: 'DiT component',
      run: 'Run',
      output: 'Output',
      prompt: 'Prompt',
      showPrompt: 'Show Full Prompt',
      steps: 'Where Each Step Ran',
      lanesNote: 'Bars show step times per machine. Steps on different GPUs can run at the same time, so they can add up to more than the end-to-end time.',
      notRecorded: 'not recorded',
      placementNotRecorded: 'placement not recorded',
      approx: '~',
      firstFrame: 'First frame from',
      referenceImage: 'Reference image',
      madeFrom: 'Made from',
      stepName: STEP_NAME_EN,
      stepShort: STEP_SHORT_EN,
      seconds: 's',
    },
    gallery: {
      eyebrow: 'GALLERY · EVERY RESULT',
      title: 'Every Result, Every Step.',
      lead: 'Images come from Qwen‑Image 2.1 (t2i‑pc), clips from MiniMax H3 (fl2va‑pc, ref2va‑pc). Clips play at their native 768×448, never upscaled. They loop muted while on screen; the sound button plays the sound H3 generated with them.',
      films: 'Films',
      filmsLead: 'Short films cut from generated shots. They preview muted on screen; press play to start over with sound.',
      shots: (n) => `${n} ${n === 1 ? 'shot' : 'shots'}`,
      music: 'Music: Suno',
      shotList: 'Show Shot List',
      shotHeaders: { shot: 'Shot', run: 'Run', seed: 'Seed', length: 'Length' },
      moreFilms: (n) => `Show More Films (${n} Left)`,
      social: 'Social Cuts',
      socialLead: 'Vertical 9:16 versions for phones.',
      singles: 'Single Generations',
      filterLabel: 'Filter by type',
      all: 'All',
      category: { film: 'Films', social: 'Social Cuts', image: 'Images', video: 'Video', character: 'Character', multishot: 'Multi-Shot' },
      count: (n) => `${n} ${n === 1 ? 'result' : 'results'}`,
      more: (n) => `Show More (${n} Left)`,
      empty: 'No results of this type yet.',
    },
    breakdown: {
      eyebrow: 'BREAKDOWN · PROMPT → STILL → CLIP',
      title: 'One Prompt, One Still, One Clip With Sound.',
      lead: 'The rainy alley: t2i‑pc makes a 1152×672 still; scaled down to 768×448, it becomes the first frame for fl2va‑pc, which adds the motion and sound described in a second prompt and returns a 5.17 s clip with sound.',
      stages: { prompt: 'Prompt', still: 'Still', frame: 'First frame', clip: 'Clip with sound' },
      stillMeta: (seed, seconds) => `t2i‑pc · Qwen‑Image 2.1 · seed ${seed} · ${seconds} s end to end`,
      frameMeta: '1152×672 scaled down to 768×448, H3’s frame size',
      clipMeta: (seed, frames, seconds) => `fl2va‑pc · MiniMax H3 · seed ${seed} · ${frames} frames · ${seconds} s end to end`,
      timelineTitle: (seconds) => `${seconds} Seconds, Machine by Machine`,
      timelineNote: 'Step positions follow this run’s Step Timeline in Records (real capture below). Video decode on the RTX 5080 and audio decode on the RTX 3060 run at the same time.',
      replay: 'Replay Timeline',
      capture: 'This run in Records: every step and the machine it ran on (real capture)',
      stillPrompt: 'Prompt for the still',
      clipPrompt: 'Prompt for the clip (motion and sound)',
    },
    character: {
      eyebrow: 'CHARACTER · ONE REFERENCE IMAGE',
      title: 'Same Character, New Scene.',
      lead: 't2i‑pc made a character sheet on white; it became the only reference image for ref2va‑pc. The prompt defines her as <Subject 1> and asks H3 to keep her exact appearance from <Picture 1>. Compare the scenes yourself.',
      sheet: 'Reference image',
      candidates: 'Three candidate seeds, ~30 s each',
      picked: 'Picked',
      subject: 'How the prompt defines her',
      scenes: (n) => `One reference image, ${n} scenes`,
      scenesLead: 'Each clip uses only this image as its reference; the setting, action and camera all come from the prompt.',
    },
    workflows: {
      eyebrow: 'WORKFLOWS · FROM ONE IMAGE TO A DAILY TOOL',
      title: 'From One Image to a Daily Workflow.',
      lead: 'Each workflow below uses only features that exist today, and links to the matching chapter of the Tour.',
      tour: 'See It in the Tour',
      items: {
        storyboard: {
          title: 'Storyboard → Stills → Clips → Timeline → MP4',
          summary: 'One project, from first shot to final cut.',
          steps: [
            'Lay out the shots in a Video Studio project, one prompt per shot.',
            'Generate each shot’s still in Image Studio with Qwen‑Image 2.1, and compare seeds as takes.',
            'Send the still to its shot as the FL2VA first frame and render the clip with sound.',
            'Arrange, split and snap clips on the timeline; add dissolves, speed, color and titles.',
            'Export one MP4 (H.264 + AAC), rendered by FFmpeg.',
          ],
          note: 'This page’s clips were made this way through the controller API. In the app, a library image as the first frame is still marked “Not yet verified on GPU”.',
        },
        character: {
          title: 'One Character Across Every Scene',
          summary: 'One reference image, used in every shot.',
          steps: [
            'Generate a character sheet in Image Studio and pick a seed.',
            'Use in Video Shot… sets it as the shot’s ref2va reference image.',
            'Name her with @Image1 in the prompt; the Ref2VA six-section template starts pre-filled from the shot’s references.',
            'For each scene, change only the setting and the action; keep the reference.',
            'Render, then compare seeds side by side as takes.',
          ],
        },
        advisor: {
          title: 'Iterate With the Prompt Advisor',
          summary: 'Check the official format while you type.',
          steps: [
            'As you type, 74 rules check the prompt in the browser: 45 from MiniMax’s official guides, 21 from the installed code, 8 from a writing guide.',
            '21 of them offer a one-click fix: preview the diff first; nothing changes until you press Apply.',
            'Errors, such as an @name with no matching asset, stop the render before anything is sent.',
            'Re-render with the same seed and compare before and after as takes.',
          ],
          note: 'The Advisor checks format and wording; its effect on output quality hasn’t been tested by generation.',
        },
        agent: {
          title: 'Let an Agent Run It Overnight',
          summary: 'An agent works the queue; you compare in the morning.',
          steps: [
            'The agent uses phasynctl (or the optional MCP server with 22 tools) to read status and start the components it needs.',
            'It dry-runs every render first, checking parameters against the live schemas.',
            'The controller runs one job at a time: the agent submits each one, waits, and downloads the output.',
            'In the morning, compare 2–8 recordings in Records, with confounders listed, and export JSONL or CSV.',
          ],
        },
        machines: {
          title: 'Spread the Steps Across Your Machines',
          summary: 'You decide which card runs which step.',
          steps: [
            'Each machine runs a NodeGateway that registers itself with the controller when it starts.',
            'Text encoder, DiT, VAEs, audio and mux are separate processes, and each can live on any machine.',
            'In the pipeline editor, pick the component instance for a step to move it to another card.',
            'Large files (latents, video) move node to node as FileRefs, never through the controller.',
            'Records shows which machine ran each step and how long it took.',
          ],
          note: 'Runtimes exist only for RTX 50-series, RTX 30-series and GB10 today, and adding a machine is a manual setup.',
        },
      },
    },
    notes: {
      title: 'About These Results',
      loudness: (loudest, quietest, rates) => `Web copy is loudness-normalized; the raw output is about ${loudest} to ${quietest} LUFS, AAC ${rates}.`,
      glyphs: 'Signs in some shots carry pseudo-text made up by the model, not real shop names or brands.',
      films: (mix) => `Films are cut from several generated shots. Those marked “Music: Suno” lay a Suno music bed (Music generated with Suno) under H3’s own sound. Film mixes arrive mastered (about ${mix} LUFS) and are used on the web as delivered.`,
      items: [
        'All AI-generated: images by Qwen‑Image 2.1, clips and their sound by MiniMax H3, generated on the author’s machines through Phasyn Studio’s controller API (t2i‑pc, fl2va‑pc, ref2va‑pc). “The Courier” is an original character.',
        'Model licenses: MiniMax H3 Community License (territorial restrictions and acceptable-use policy); Qwen‑Image 2.1 is for research and non-commercial use. Model weights are not included.',
        'Shown at native resolution, never upscaled: stills at 1152×672 (the character sheet at 768×1024), clips at 768×448 and 24 fps. The web copies are otherwise only compressed (WebP, H.264).',
        'Times are controller-observed end-to-end and step times. They leave out starting or switching models (image DiT 11.3 s, dit‑5080 45.9 s, Ref2VA DiT 40.6 s). Step times for the four stills are rounded readings.',
        'Steps on different GPUs can run at the same time (video and audio decode, for example), so step times can add up to more than the end-to-end time.',
      ],
    },
    closing: {
      title: 'See How It Works, or See the Numbers.',
      lead: 'The Tour walks through the real app, screen by screen. Benchmarks names the card behind every step.',
      tour: 'Take the Tour',
      benchmarks: 'See Benchmarks',
      film: 'Watch the Film',
    },
  },
};
