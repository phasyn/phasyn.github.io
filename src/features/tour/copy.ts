import type { Copy } from '../../i18n/locale.tsx';
import type { CaptureKey } from '../../site/captures.ts';
import type { TourVideoKey } from '../../site/tour-videos.ts';

/*
 * Tour copy: the detailed guide. zh-hant first, short sentences that each match a fact of the current Phasyn Studio
 * (2026-11-16); ja (です・ます) and en follow. Product, model, style-pack and key names are never translated.
 */

export const SECTION_IDS = ['shots', 'references', 'edit', 'render', 'export', 'plugins', 'image', 'records'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export interface Faq {
  q: string;
  a: string;
}

export interface GuideSection {
  title: string;
  summary: string;
  points: readonly string[];
  faq: readonly Faq[];
}

export interface EditGroup {
  title: string;
  text: string;
}

export interface TourCopy {
  hero: { title: string; lead: string; recording: string; requirements: string };
  index: string;
  sections: Record<Exclude<SectionId, 'edit'>, GuideSection> & {
    edit: Omit<GuideSection, 'points'> & { groups: readonly EditGroup[] };
  };
  captures: Record<CaptureKey, string>;
  /** The one label on each capture's focus region (TourPage.tsx names the regions). */
  spots: Partial<Record<CaptureKey, string>>;
  /** What each screen recording shows, in order (matched against the recording's chapter marks). */
  videos: Record<TourVideoKey, string>;
  /** The line above each recording's caption, and the label of the button that plays it with sound from the start. */
  video: { note: string; playWithSound: string };
  faqTitle: string;
  closing: { title: string; about: string };
}

export const TOUR: Copy<TourCopy> = {
  'zh-hant': {
    hero: {
      title: '一步一步，看它怎麼用。',
      lead: '從寫鏡頭、挑 take，到剪輯和匯出，大部分主題都附上真實畫面和操作錄影。',
      recording: '部分主題附上實際操作錄影（英文介面）。',
      requirements: '需要 Linux、NVIDIA 顯示卡和 CUDA 13.0 驅動；不支援 Mac 和 Windows。',
    },
    index: '主題',
    sections: {
      shots: {
        title: '鏡頭與 take',
        summary: '一個鏡頭可以有很多 take，挑最好的那個上時間軸。',
        points: [
          '左邊是鏡頭清單和素材，中間是監看器，右邊寫 Prompt、參考、插件和備註。',
          '「數量」一次最多渲染 8 個變體：可以混合不同 seed、參考檔和路線。',
          '每個變體都是同一個鏡頭的 take，會標出它跟鏡頭設定哪裡不同。',
          '「Use This Take」讓時間軸和匯出改用這個 take；「套用這個 take 的設定」把它的 seed、參考、路線套回鏡頭。',
          '監看器可以 A/B 比較兩個 take，分割或並排都行。',
        ],
        faq: [
          {
            q: '怎麼知道 take 有沒有照 Prompt 做？',
            a: '匯入外部評分後，take 卡片會顯示遵從度；按 R 可以看每一句 Prompt 有沒有做到。',
          },
          { q: '可以一次渲染很多鏡頭嗎？', a: '可以。多選鏡頭後選「批次渲染」或「渲染變體…」。' },
        ],
      },
      references: {
        title: '參考',
        summary: '用 @ 把圖片、影片、聲音指定成參考。',
        points: [
          '在 Prompt 裡寫 @Image、@Video、@Audio，對應 H3 自己的標籤。',
          '參考影片的原聲預設不送，因為嘴型會對不上；需要時可以切換「使用原片聲音當參考」。',
          '「換參考檔案…」只換背後的檔案，@ 名稱和入出點不變；多選可以一次換。',
          '「修正與建議」用 77 條規則檢查 Prompt，其中 19 條可以預覽後一鍵修正。',
          '範本有「完整格式：角色參考＋分鏡＋聲音」和「三鏡分鏡骨架」。',
        ],
        faq: [
          { q: '參考圖要多大？', a: '短邊 1024 時渲染快很多。' },
          { q: '77 條規則是哪來的？', a: '45 條官方寫法、24 條實際行為、8 條製作建議；插件還可以加規則包。' },
        ],
      },
      edit: {
        title: '編輯',
        summary: '像 Premiere 一樣剪：同一條時間軸，從粗剪到字幕。',
        groups: [
          {
            title: '兩個監看器',
            text: '來源監看器標入點、出點，再插入或覆寫；節目監看器可以提升、擷取、加標記，也能拉到獨立視窗或全螢幕。',
          },
          { title: '直接在畫面上調', text: '變形控制框讓你在節目監看器上拖曳、縮放、旋轉；卡的時候可以開代理。' },
          {
            title: '工具',
            text: '選取、波紋編輯、滾動編輯、剃刀、外滑、內滑、文字。J/K/L、I/O、Ctrl/⌘+K 加編輯點，片段會自動靠齊。',
          },
          { title: '軌道', text: '靜音、獨奏、鎖定、同步鎖定、目標軌道。' },
          {
            title: '效果控制',
            text: '運動、不透明度、時間、調色、遮罩、鏡頭運動、速度感、文字、音訊、淡化，每一項都能下關鍵影格。',
          },
          { title: '為動畫做的效果', text: '頓格、一拍二、衝擊格；變速時音高不變。' },
          {
            title: '調整圖層與外觀包',
            text: '調整圖層一次套到底下的片段；外觀包有 6 種效果、5 種轉場，還有文字動畫和標題範本。',
          },
          { title: '字幕、標記、歷程', text: '新增字幕，或匯入、匯出 SRT；歷程記下每一步編輯。' },
        ],
        faq: [
          { q: '剪碎了想回到原本那段？', a: '用「還原為整段 take」，切開的片段會變回一整段。' },
          { q: 'AI 代理也能剪嗎？', a: '可以。時間軸是唯一的編輯狀態，AI 代理改的就是你看到的那一條。' },
        ],
      },
      render: {
        title: '渲染',
        summary: '每一次渲染都看得到：排到哪、跑到哪一步、花了多久。',
        points: [
          '渲染佇列分成全部、進行中、完成、未成功。',
          '每次執行都有詳情：概覽、階段、時間軸、指標。',
          '定稿是 8 步，1280×736、24 fps；4 步是草稿，比較快但比較糊；低於 4 步會出現警告。',
          '可以同時跑好幾個（同時執行數 1–4，預設 1）；批次也能分到不同機器上一起跑。',
        ],
        faq: [
          {
            q: '要等多久？',
            a: '預估時間是從你自己的紀錄學出來的；某條路線第一次跑之前會顯示「尚無預估」。渲染或匯出完成時會有提示音。',
          },
        ],
      },
      export: {
        title: '匯出與升頻',
        summary: '把整條時間軸輸出成一支 MP4。',
        points: [
          'MP4（H.264＋AAC）；範圍可以是完整序列，或入點到出點。',
          '尺寸：與渲染相同、720P、1080P。',
          '畫質：高畫質、標準、小檔（CRF 18／23／28）；進階裡還有縮放方式、編碼速度和音訊位元率。',
          '升頻用 Anime4K v4 2×，放大到 2560×1472，幀數、fps 和聲音都不變。元件已經做好，匯出對話框裡的選項正在加入。',
        ],
        faq: [{ q: '有補幀嗎？', a: '還沒有。' }],
      },
      plugins: {
        title: '插件',
        summary: '換上別人調好的風格和規則。',
        points: [
          '插件是只含資料的包：Prompt 規則和生成設定。',
          '附一個範例插件（depth-staging），照著改就能做自己的規則包。',
          '規則包會加進「修正與建議」，跟內建規則一起檢查 Prompt。',
          '在插件管理裡開關；每個鏡頭的屬性面板也有「插件」分頁。',
        ],
        faq: [{ q: '插件安全嗎？', a: '插件不能執行程式，只有設定和規則。' }],
      },
      image: {
        title: 'Image Studio',
        summary: '先把角色圖做好，再拿去做影片。',
        points: [
          '文生圖、圖生圖（最多 4 張參考圖），也可以畫遮罩只改一部分。',
          '一次最多 8 張。',
          '一鍵送到 Video Studio，當參考或第一格。',
          '專案在 Image Studio 和 Video Studio 之間共用。',
        ],
        faq: [
          {
            q: '手上有一張圖，想知道 Prompt 怎麼寫？',
            a: '推理 Studio 可以從圖片反推 Prompt。影片反推已經寫好，還沒驗證。',
          },
        ],
      },
      records: {
        title: '紀錄',
        summary: '每次執行都留下紀錄，可以並排比較。',
        points: [
          '執行紀錄有節點圖和步驟時間軸，看得到每一步在哪裡跑、花多久。',
          '效能紀錄定義了 102 項指標；沒量到的寫「未量測」，不會寫成 0。',
          '最多 8 筆紀錄並排比較。',
          '匯出紀錄時可以遮蔽敏感資訊。',
        ],
        faq: [],
      },
    },
    captures: {
      'shot-workspace': '鏡頭工作區：鏡頭清單、監看器裡的 take、take 列、Prompt 和下方的時間軸。',
      'shot-takes-compare': '鏡頭工作區：監看器並排比較同一個鏡頭的兩個 take。',
      'prompt-suggestions': '鏡頭工作區：Prompt 上方打開的「修正與建議」清單。',
      'edit-workspace': '編輯工作區：來源和節目監看器、專案面板、工具列和時間軸。',
      'render-queue': '渲染工作區：渲染佇列，以及一次已完成的渲染和它產出的影片。',
      'export-dialog': '「匯出影片」對話框：範圍、尺寸和畫質。',
      'plugin-manager': '插件管理：已安裝的插件。',
      'image-studio': 'Image Studio：Prompt、參考圖和生成出來的一組圖片。',
    },
    spots: {
      'shot-workspace': 'take 列',
      'prompt-suggestions': '修正與建議',
      'edit-workspace': '時間軸',
      'export-dialog': '範圍、尺寸、畫質',
    },
    videos: {
      'character-to-shot':
        '從素材庫看角色圖，到鏡頭的「參考」分頁確認 @Image1，寫 Prompt，再從「修正與建議」預覽一條修正、一鍵套用。',
      'pick-take':
        '用方向鍵切換 take，分割和並排做 A/B 比較，按「Use This Take」，打開變體設定，再把一個 take 的設定套回鏡頭。',
      edit: '來源和節目監看器、J/K/L 播放、剃刀切開、波紋修剪、在畫面上拖曳變形框、開啟衝擊格、改成一拍二，最後播放剪好的段落。',
      export: '標好入點和出點，打開「匯出影片」，選範圍、尺寸和畫質，看一下進階選項；最後按取消，沒有真的匯出。',
      'image-studio':
        '圖片清單和每張的結果、原圖與白底切換、寫 Prompt、選尺寸、參考圖、取樣設定、一次 4 張，以及比較 take。',
    },
    video: { note: '操作錄影 · 英文介面 · 配樂與介面音效', playWithSound: '有聲播放' },
    faqTitle: '常見問題',
    closing: { title: '這就是它的工作方式', about: '為什麼要做它' },
  },

  ja: {
    hero: {
      title: '一歩ずつ、使い方を見る。',
      lead: 'カットを書き、テイクを選び、編集して書き出すまで。ほとんどのテーマに実際の画面と操作の録画を付けています。',
      recording: '一部のテーマには、実際の操作の録画があります（英語 UI）。',
      requirements: 'Linux、NVIDIA の GPU、CUDA 13.0 ドライバーが必要です。Mac と Windows には対応していません。',
    },
    index: 'テーマ',
    sections: {
      shots: {
        title: 'ショットとテイク',
        summary: '1 つのショットにテイクをいくつも作り、いちばんいいものをタイムラインに使います。',
        points: [
          '左にショット一覧と素材、中央にモニター、右にプロンプト・参照・プラグイン・メモがあります。',
          '「数」で一度に最大 8 つのバリエーションをレンダリング。seed、参照ファイル、ルートを混ぜられます。',
          'バリエーションはどれも同じショットのテイクで、ショットの設定との違いが表示されます。',
          '「Use This Take」でタイムラインと書き出しがそのテイクに切り替わります。「このテイクの設定を適用」で seed・参照・ルートをショットに戻せます。',
          'モニターで 2 つのテイクを A/B 比較できます（分割または並べて表示）。',
        ],
        faq: [
          {
            q: 'テイクがプロンプトどおりか、どうやってわかりますか？',
            a: '外部の評価を取り込むと、テイクのカードに遵守率が出ます。R キーでプロンプトの 1 文ごとの結果を確認できます。',
          },
          {
            q: 'たくさんのショットをまとめてレンダリングできますか？',
            a: 'できます。ショットを複数選んで「一括レンダリング」か「バリエーションをレンダリング…」を選びます。',
          },
        ],
      },
      references: {
        title: '参照',
        summary: '@ で画像・動画・音声を参照に指定します。',
        points: [
          'プロンプトに @Image、@Video、@Audio と書きます。H3 自身のタグに対応しています。',
          '参照動画の元の音は、口の動きが合わなくなるので既定では送りません。必要なら「元の音声を参照に使う」に切り替えられます。',
          '「参照ファイルを差し替え…」は中身のファイルだけを替え、@ の名前とイン・アウト点はそのまま。複数選択でまとめて替えられます。',
          '「修正と提案」は 77 のルールでプロンプトを確認し、うち 19 はプレビューしてからワンクリックで直せます。',
          'テンプレートは「完全な形式：キャラクター参照＋絵コンテ＋音」と「3 カット絵コンテの骨組み」。',
        ],
        faq: [
          { q: '参照画像の大きさは？', a: '短辺 1024 にすると、レンダリングがかなり速くなります。' },
          {
            q: '77 のルールはどこから？',
            a: '公式の書き方が 45、実際の挙動が 24、制作のコツが 8 です。プラグインでルールパックを足すこともできます。',
          },
        ],
      },
      edit: {
        title: '編集',
        summary: 'Premiere のように編集します。1 本のタイムラインで、ラフ編集から字幕まで。',
        groups: [
          {
            title: '2 つのモニター',
            text: 'ソースモニターでイン点・アウト点を付けて、インサートか上書き。プログラムモニターはリフト、抽出、マーカー追加ができ、別ウィンドウやフルスクリーンにもできます。',
          },
          {
            title: '画面の上で直接',
            text: 'トランスフォームの枠で、プログラムモニター上でそのまま移動・拡大・回転。重いときはプロキシを使えます。',
          },
          {
            title: 'ツール',
            text: '選択、リップル編集、ローリング編集、レーザー、スリップ、スライド、テキスト。J/K/L、I/O、Ctrl/⌘+K で編集点を追加し、クリップは自動で吸着します。',
          },
          { title: 'トラック', text: 'ミュート、ソロ、ロック、同期ロック、ターゲットトラック。' },
          {
            title: 'エフェクトコントロール',
            text: 'モーション、不透明度、タイム、カラー、マスク、カメラの動き、スピード感、テキスト、オーディオ、フェード。どれもキーフレームを打てます。',
          },
          {
            title: 'アニメのための効果',
            text: 'ヒットストップ、2 コマ打ち、インパクトフレーム。速度を変えても音程は変わりません。',
          },
          {
            title: '調整レイヤーとルックパック',
            text: '調整レイヤーは下のクリップにまとめて効きます。ルックパックにはエフェクト 6 種、トランジション 5 種、テキストアニメとタイトルテンプレートがあります。',
          },
          {
            title: '字幕・マーカー・履歴',
            text: '字幕の追加、SRT の読み込みと書き出し。履歴には編集の 1 手ずつが残ります。',
          },
        ],
        faq: [
          {
            q: '細かく切ったクリップを元に戻したい',
            a: '「テイク全体に戻す」で、切ったクリップが 1 本に戻ります。',
          },
          {
            q: 'AI エージェントも編集できますか？',
            a: 'できます。編集の状態はタイムライン 1 本だけで、エージェントが変えるのもあなたが見ているそのタイムラインです。',
          },
        ],
      },
      render: {
        title: 'レンダリング',
        summary: 'どこまで進んだか、どのステップにどれだけかかったかが見えます。',
        points: [
          'キューは「All・In Progress・Done・Unsuccessful」のタブに分かれています。',
          '実行ごとに詳細があります：概要、段階、タイムライン、指標。',
          '本番は 8 ステップ、1280×736、24 fps。4 ステップは下書きで、速いぶん少しぼやけます。4 ステップ未満では警告が出ます。',
          'いくつか同時に動かせます（同時実行数 1〜4、既定は 1）。一括レンダリングを別のマシンに分けることもできます。',
        ],
        faq: [
          {
            q: 'どれくらい待ちますか？',
            a: '予測時間はあなた自身の記録から学習します。そのルートを初めて動かす前は「予測なし」と表示されます。レンダリングや書き出しが終わると通知音が鳴ります。',
          },
        ],
      },
      export: {
        title: '書き出しとアップスケール',
        summary: 'タイムライン全体を 1 本の MP4 に書き出します。',
        points: [
          'MP4（H.264＋AAC）。範囲はシーケンス全体か、イン点からアウト点まで。',
          'サイズ：レンダリングと同じ、720P、1080P。',
          '画質：高画質、標準、小さいファイル（CRF 18／23／28）。詳細設定にスケーリング方法、エンコード速度、音声ビットレートがあります。',
          'アップスケールは Anime4K v4 の 2× で 2560×1472 に。フレーム数、fps、音は変わりません。コンポーネントは完成していて、書き出しダイアログの項目を追加しているところです。',
        ],
        faq: [{ q: 'フレーム補間はありますか？', a: 'まだありません。' }],
      },
      plugins: {
        title: 'プラグイン',
        summary: '誰かが調整したスタイルとルールを、そのまま使えます。',
        points: [
          'プラグインはデータだけのパックです：プロンプトのルールと生成設定。',
          'サンプルのプラグイン（depth-staging）が付属しています。これを元に自分のルールパックを作れます。',
          'ルールパックは「修正と提案」に加わり、内蔵のルールと一緒にプロンプトを確認します。',
          'プラグイン管理でオン・オフ。各ショットのプロパティパネルにも「プラグイン」タブがあります。',
        ],
        faq: [
          { q: 'プラグインは安全ですか？', a: 'プラグインはプログラムを実行できません。中身は設定とルールだけです。' },
        ],
      },
      image: {
        title: 'Image Studio',
        summary: '先にキャラクターの画像を作って、それを動画に使います。',
        points: [
          'テキストから画像、画像から画像（参照は最大 4 枚）。マスクで一部だけ描き直すこともできます。',
          '一度に最大 8 枚。',
          'ワンクリックで Video Studio に送り、参照や最初のフレームに使えます。',
          'プロジェクトは Image Studio と Video Studio で共通です。',
        ],
        faq: [
          {
            q: '手元の画像から、プロンプトを知りたい',
            a: '推論 Studio で画像からプロンプトを逆引きできます。動画の逆引きは実装済みで、検証はまだです。',
          },
        ],
      },
      records: {
        title: '記録',
        summary: '実行のたびに記録が残り、並べて比べられます。',
        points: [
          '実行の記録にはノードグラフとステップのタイムラインがあり、どこで動いて何秒かかったかがわかります。',
          '性能の記録では 102 の指標を定義。測れなかったものは 0 ではなく「未計測」と書きます。',
          '最大 8 件を並べて比較できます。',
          '書き出すときに機密情報を伏せられます。',
        ],
        faq: [],
      },
    },
    captures: {
      'shot-workspace': 'ショット画面：ショット一覧、モニターのテイク、テイク一覧、プロンプト、下のタイムライン。',
      'shot-takes-compare': 'ショット画面：同じショットの 2 つのテイクをモニターで並べて比較。',
      'prompt-suggestions': 'ショット画面：プロンプトの上に開いた「修正と提案」の一覧。',
      'edit-workspace': '編集画面：ソースとプログラムのモニター、プロジェクトパネル、ツール、タイムライン。',
      'render-queue': 'レンダリング画面：キューと、完了した 1 回の実行とその出力の動画。',
      'export-dialog': '「動画を書き出し」ダイアログ：範囲、サイズ、画質。',
      'plugin-manager': 'プラグイン管理：インストールしたプラグイン。',
      'image-studio': 'Image Studio：プロンプト、参照画像、生成した画像の一式。',
    },
    spots: {
      'shot-workspace': 'テイク一覧',
      'prompt-suggestions': '修正と提案',
      'edit-workspace': 'タイムライン',
      'export-dialog': '範囲・サイズ・画質',
    },
    videos: {
      'character-to-shot':
        'アセットライブラリでキャラクター画像を見て、ショットの「参照」タブで @Image1 を確認し、プロンプトを書き、「修正と提案」で修正をプレビューしてワンクリックで適用します。',
      'pick-take':
        '矢印キーでテイクを切り替え、分割と並べて表示で A/B 比較し、「Use This Take」を押し、バリエーション設定を開き、テイクの設定をショットに戻します。',
      edit: 'ソースとプログラムのモニター、J/K/L での再生、レーザーでカット、リップルトリム、画面上で変形ボックスをドラッグ、インパクトフレームをオン、2 コマ打ちに変更、最後に編集した部分を再生します。',
      export:
        'イン点とアウト点を打ち、「動画を書き出し」を開いて範囲・サイズ・画質を選び、詳細設定を確認します。最後はキャンセルで、実際には書き出していません。',
      'image-studio':
        '画像一覧とそれぞれの結果、元画像と白背景の切り替え、プロンプト、サイズ、参照画像、サンプリング設定、一度に 4 枚、テイクの比較。',
    },
    video: {
      note: '操作の録画 · 英語 UI · 音楽と UI 効果音付き',
      playWithSound: '音声付きで再生',
    },
    faqTitle: 'よくある質問',
    closing: { title: 'これが使い方のすべて', about: 'なぜ作ったのか' },
  },

  en: {
    hero: {
      title: 'See how it works, step by step.',
      lead: 'From writing a shot and picking a take to editing and export, with real screenshots and screen recordings for most topics.',
      recording: 'Some topics include a recording of the real app (English UI).',
      requirements: 'Needs Linux, an NVIDIA GPU and the CUDA 13.0 driver. Mac and Windows aren’t supported.',
    },
    index: 'Topics',
    sections: {
      shots: {
        title: 'Shots and Takes',
        summary: 'A shot can have many takes. The best one goes on the timeline.',
        points: [
          'Shot list and assets on the left, the viewer in the middle, prompt, references, plugins and notes on the right.',
          'Count renders up to 8 variants at once, mixing seeds, reference files and routes.',
          'Every variant is a take of the same shot, marked with how it differs from the shot’s settings.',
          'Use This Take switches the timeline and export to that take. Apply This Take’s Settings copies its seed, references and route back to the shot.',
          'The viewer compares two takes A/B, split or side by side.',
        ],
        faq: [
          {
            q: 'How do I know a take followed the prompt?',
            a: 'Import an external review and each take card shows its adherence; press R to see which prompt lines it got right.',
          },
          {
            q: 'Can I render many shots at once?',
            a: 'Yes. Select several shots, then Batch Render or Render Variants….',
          },
        ],
      },
      references: {
        title: 'References',
        summary: 'Use @ to make an image, a video or a sound a reference.',
        points: [
          'Write @Image, @Video or @Audio in the prompt; they map to H3’s own tags.',
          'A reference video’s own sound isn’t sent by default, because lips won’t match. Switch on Use Original Audio as Reference when you need it.',
          'Replace Reference File… swaps the file behind it and keeps the @ name and in and out points. Select several to swap them together.',
          'Fixes & Suggestions checks the prompt against 77 rules; 19 of them can be previewed and fixed in one click.',
          'Templates include Full Format: Character Reference + Storyboard + Sound and a three-shot storyboard skeleton.',
        ],
        faq: [
          { q: 'How big should a reference image be?', a: 'With a 1024 short side, renders are much faster.' },
          {
            q: 'Where do the 77 rules come from?',
            a: '45 from the official prompt format, 24 from observed behavior and 8 production tips. Plugins can add rule packs.',
          },
        ],
      },
      edit: {
        title: 'Editing',
        summary: 'Edit like in Premiere: one timeline, from rough cut to captions.',
        groups: [
          {
            title: 'Two Monitors',
            text: 'Mark in and out in the source monitor, then insert or overwrite. The program monitor lifts, extracts and adds markers, and pops out to its own window or full screen.',
          },
          {
            title: 'Right on the Picture',
            text: 'Transform handles let you move, scale and rotate on the program monitor. Turn on proxies when it gets heavy.',
          },
          {
            title: 'Tools',
            text: 'Selection, ripple edit, rolling edit, razor, slip, slide and text. J/K/L, I/O and Ctrl/⌘+K to add an edit point; clips snap.',
          },
          { title: 'Tracks', text: 'Mute, solo, lock, sync lock and target tracks.' },
          {
            title: 'Effect Controls',
            text: 'Motion, opacity, time, color, masks, camera motion, speed feel, text, audio and fades, all keyframable.',
          },
          {
            title: 'Made for Animation',
            text: 'Hit-stops, animating on twos and impact frames. Speed changes keep the pitch.',
          },
          {
            title: 'Adjustment Layers and Looks',
            text: 'An adjustment layer applies to every clip below it. Look packs bring 6 effects and 5 transitions, plus text animations and title templates.',
          },
          {
            title: 'Captions, Markers, History',
            text: 'Add captions or import and export SRT. History keeps every edit.',
          },
        ],
        faq: [
          {
            q: 'Cut a take into pieces and want it back?',
            a: 'Restore Whole Take puts the pieces back into one clip.',
          },
          {
            q: 'Can an AI agent edit too?',
            a: 'Yes. The timeline is the one edit state, and the agent changes the same timeline you see.',
          },
        ],
      },
      render: {
        title: 'Rendering',
        summary: 'See every render: where it is in the queue, which step it’s on, how long each took.',
        points: [
          'The queue splits into All, In Progress, Done and Unsuccessful.',
          'Every run has a detail view: overview, stages, timeline and metrics.',
          'Finals use 8 steps at 1280×736, 24 fps. 4 steps is a draft: faster, a little softer. Below 4 you get a warning.',
          'Run several at once (concurrency 1–4, default 1); a batch can spread across machines.',
        ],
        faq: [
          {
            q: 'How long will it take?',
            a: 'Estimates are learned from your own records; before a route’s first run it shows No Estimate Yet. A sound plays when a render or export finishes.',
          },
        ],
      },
      export: {
        title: 'Export and Upscale',
        summary: 'The whole timeline out as one MP4.',
        points: [
          'MP4 (H.264 + AAC), of the entire sequence or in to out.',
          'Size: same as render, 720P or 1080P.',
          'Quality: High, Standard or Small File (CRF 18 / 23 / 28). Advanced adds scaling, encode speed and audio bitrate.',
          'Upscaling uses Anime4K v4 2× to 2560×1472, keeping frames, fps and sound. The component is done; its option in the export dialog is being added.',
        ],
        faq: [{ q: 'Is there frame interpolation?', a: 'Not yet.' }],
      },
      plugins: {
        title: 'Plugins',
        summary: 'Use styles and rules someone else already tuned.',
        points: [
          'A plugin is a data-only pack: prompt rules and generation settings.',
          'An example plugin (depth-staging) is included; copy it to make your own rule pack.',
          'Rule packs join Fixes & Suggestions and check the prompt alongside the built-in rules.',
          'Turn them on and off in the plugin manager; every shot’s inspector has a Plugins tab too.',
        ],
        faq: [{ q: 'Are plugins safe?', a: 'Plugins can’t run code. They only hold settings and rules.' }],
      },
      image: {
        title: 'Image Studio',
        summary: 'Make the character image first, then take it to video.',
        points: [
          'Text to image, image to image (up to 4 reference images) and masks to redo just one part.',
          'Up to 8 images at a time.',
          'Send one to Video Studio in a click, as a reference or the first frame.',
          'Projects are shared between Image Studio and Video Studio.',
        ],
        faq: [
          {
            q: 'Have an image and want its prompt?',
            a: 'Inference Studio turns an image back into a prompt. Video reverse prompting is written but not yet verified.',
          },
        ],
      },
      records: {
        title: 'Records',
        summary: 'Every run leaves a record you can compare side by side.',
        points: [
          'Run records show the node graph and a step timeline: where each step ran and how long it took.',
          'Performance records define 102 metrics. Anything not measured says Not Measured, never 0.',
          'Compare up to 8 records side by side.',
          'Exports can mask sensitive details.',
        ],
        faq: [],
      },
    },
    captures: {
      'shot-workspace':
        'The Shot workspace: shot list, a take in the viewer, the take strip, the prompt and the timeline below.',
      'shot-takes-compare': 'The Shot workspace comparing two takes of one shot side by side.',
      'prompt-suggestions': 'The Shot workspace with the Fixes & Suggestions list open over the prompt.',
      'edit-workspace': 'The Edit workspace: source and program monitors, project panel, tools and timeline.',
      'render-queue': 'The Render workspace: the queue, and one finished run with the video it produced.',
      'export-dialog': 'The Export Video dialog: range, size and quality.',
      'plugin-manager': 'The plugin manager: installed plugins.',
      'image-studio': 'Image Studio: the prompt, reference images and a batch of generated images.',
    },
    spots: {
      'shot-workspace': 'Take strip',
      'prompt-suggestions': 'Fixes & Suggestions',
      'edit-workspace': 'Timeline',
      'export-dialog': 'Range, size, quality',
    },
    videos: {
      'character-to-shot':
        'Browse the characters in the asset library, check @Image1 on the shot’s References tab, write the prompt, then preview one fix from Fixes & Suggestions and apply it in one click.',
      'pick-take':
        'Step through takes with the arrow keys, compare two in split and side-by-side view, press Use This Take, open the variant settings and copy one take’s settings back to the shot.',
      edit: 'Source and Program monitors, J/K/L playback, a razor cut, a ripple trim, the transform box dragged in the picture, impact frames switched on, animation on twos, then the cut played back.',
      export:
        'Mark in and out, open Export Video, choose range, size and quality, look at the advanced options, then cancel; nothing is exported.',
      'image-studio':
        'The image list and each result, original vs. white background, the prompt, the size, a reference image, sampling settings, four images at once and the takes side by side.',
    },
    video: {
      note: 'Screen recording · English UI · music and UI sounds',
      playWithSound: 'Play with sound',
    },
    faqTitle: 'Questions',
    closing: { title: 'That’s How It Works', about: 'Why I Built It' },
  },
};
