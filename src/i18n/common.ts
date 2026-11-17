import type { Locale, Page } from '../site/config.ts';
import type { Copy } from './locale.tsx';

interface CommonCopy {
  languageName: string;
  skipToContent: string;
  nav: Record<Page, string>;
  navLabel: string;
  /** Footer navigation landmark name (distinct from the header's main navigation). */
  footerNavLabel: string;
  menuOpen: string;
  menuClose: string;
  languageLabel: string;
  /** The footer's language switcher (a distinct landmark name from the header's). */
  footerLanguageLabel: string;
  sourceSoon: string;
  personalProject: string;
  /** The owner's call for help, shown at the very start of the introduction (Home hero). */
  helpWanted: string;
  footerTagline: string;
  footerMadeBy: string;
  footerCredits: string;
  /** Open-source and model licence terms (README); the word NOTICE becomes a link to the repository's NOTICE file. */
  footerLicense: string;
  /** MiniMax H3 licence and region note, for pages that show H3 video (the first sentence of footerModels). */
  h3License: string;
  footerLinks: string;
  emailLabel: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundBack: string;
  planned: string;
  inDevelopment: string;
}

export const COMMON: Copy<CommonCopy> = {
  'zh-hant': {
    languageName: '繁體中文',
    skipToContent: '跳至主要內容',
    nav: { home: '首頁', tour: '操作導覽', showcase: '成品展示', about: '關於' },
    navLabel: '主要導覽',
    footerNavLabel: '頁尾導覽',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    languageLabel: '語言',
    footerLanguageLabel: '頁尾語言切換',
    sourceSoon: '原始碼已在 GitHub 公開（Apache-2.0）',
    personalProject: '個人、非商業專案',
    helpWanted: '歡迎一起貢獻',
    footerTagline: '從分鏡，到成片。',
    footerMadeBy: '由 DennySORA 開發的個人、非商業專案。',
    footerCredits:
      '示範圖片與影片以 Phasyn Studio（MiniMax H3、Qwen-Image 2.1）生成；網站的圖示和背景由 OpenAI Codex 以 AI 生成；影片配樂以 Suno 生成。示範角色的造型來自網路社群的同人創作，原作者為 ZipZipPipe 與上善無形（溟月），版權歸原作者所有，本站僅作非商業示範。',
    footerLicense:
      'Phasyn Studio 以 Apache License 2.0 開源。名稱和標誌不在授權範圍內，見 NOTICE。不包含 AI 模型。每個模型都有自己的授權，也限制了使用的地區和方式：MiniMax-H3 和它做出來的影片，不能在歐盟、英國、韓國和美國使用或展示，Qwen-Image 2.1 只能用於非商業用途。用 MiniMax-H3 做出來的影片，不能拿去訓練其他 AI 模型。只使用你有權利的圖片、影片和聲音，也不要把 AI 生成的內容當成真的或冒充別人。',
    h3License:
      '影片生成 Powered by MiniMax H3（MiniMax H3 Community License：授權地區不含歐盟、英國、韓國、美國，並附使用規範）。Phasyn Studio 不附帶也不散布任何模型權重。',
    footerLinks: '連結',
    emailLabel: '聯絡信箱',
    notFoundTitle: '找不到這個頁面',
    notFoundBody: '網址可能打錯了，或頁面已經搬移。',
    notFoundBack: '回到首頁',
    planned: '規劃中',
    inDevelopment: '開發中',
  },
  ja: {
    languageName: '日本語',
    skipToContent: 'メインコンテンツへスキップ',
    nav: {
      home: 'ホーム',
      tour: '操作ガイド',
      showcase: '作例',
      about: 'このプロジェクトについて',
    },
    navLabel: 'メインナビゲーション',
    footerNavLabel: 'フッターナビゲーション',
    menuOpen: 'メニューを開く',
    menuClose: 'メニューを閉じる',
    languageLabel: '言語',
    footerLanguageLabel: 'フッターの言語切り替え',
    sourceSoon: 'ソースコードを GitHub で公開中（Apache-2.0）',
    personalProject: '個人・非商用プロジェクト',
    helpWanted: 'コントリビューション歓迎',
    footerTagline: '絵コンテから、完成映像まで。',
    footerMadeBy: 'DennySORA が開発する個人・非商用プロジェクトです。',
    footerCredits:
      'デモの画像と動画は Phasyn Studio（MiniMax H3、Qwen-Image 2.1）で生成しています。サイトのアイコンと背景は OpenAI Codex で生成した AI 画像、映像の音楽は Suno で生成したものです。デモに登場するキャラクターのデザインはネットコミュニティの二次創作によるもので、原作者は ZipZipPipe と上善無形（溟月）です。著作権は原作者に帰属し、本サイトでは非商用のデモとしてのみ使用しています。',
    footerLicense:
      'Phasyn Studio は Apache License 2.0 のオープンソースです。名称とロゴはライセンスの対象外です（NOTICE を参照）。AI モデルは含まれていません。モデルにはそれぞれ独自のライセンスがあり、使える地域や使い方も限られています。MiniMax-H3 とそれで作った動画は、EU、英国、韓国、米国では使用も公開もできません。Qwen-Image 2.1 は非商用でのみ使えます。MiniMax-H3 で作った動画を、ほかの AI モデルの学習に使うことはできません。権利を持っている画像・動画・音声だけを使い、AI で生成した内容を本物のように見せたり、他人になりすましたりしないでください。',
    h3License:
      '映像生成は Powered by MiniMax H3（MiniMax H3 Community License：対象地域は EU・英国・韓国・米国を除き、利用規約があります）。Phasyn Studio はモデルの重みを同梱も配布もしていません。',
    footerLinks: 'リンク',
    emailLabel: '連絡先',
    notFoundTitle: 'ページが見つかりません',
    notFoundBody: 'URL が間違っているか、ページが移動した可能性があります。',
    notFoundBack: 'ホームへ戻る',
    planned: '計画中',
    inDevelopment: '開発中',
  },
  en: {
    languageName: 'English',
    skipToContent: 'Skip to Main Content',
    nav: { home: 'Home', tour: 'Tour', showcase: 'Showcase', about: 'About' },
    navLabel: 'Main navigation',
    footerNavLabel: 'Footer',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    languageLabel: 'Language',
    footerLanguageLabel: 'Footer language',
    sourceSoon: 'Source code on GitHub (Apache-2.0)',
    personalProject: 'Personal, non-commercial project',
    helpWanted: 'Contributions welcome',
    footerTagline: 'From storyboard to synthesis.',
    footerMadeBy: 'A personal, non-commercial project by DennySORA.',
    footerCredits:
      'Demo images and videos are generated with Phasyn Studio (MiniMax H3, Qwen-Image 2.1). Site icons and backgrounds are AI-generated with OpenAI Codex; film music is generated with Suno. The demo characters are fan designs from the online community by ZipZipPipe and 上善無形 (溟月); all rights remain with the original creators, and they appear here only as a non-commercial demo.',
    footerLicense:
      'Phasyn Studio is open source under the Apache License 2.0. The name and logo are not covered by the license; see NOTICE. No AI models are included. Each model has its own license, which also limits where and how it can be used: MiniMax-H3 and the videos made with it may not be used or shown in the EU, the UK, South Korea or the USA, and Qwen-Image 2.1 is for non-commercial use only. Videos made with MiniMax-H3 may not be used to train other AI models. Only use images, video and sound you have the rights to, and never pass off AI-generated content as real or pretend to be someone else.',
    h3License:
      'Video generation Powered by MiniMax H3 (MiniMax H3 Community License: excludes the EU, the UK, the Republic of Korea and the USA, with an acceptable-use policy). Phasyn Studio does not bundle or distribute any model weights.',
    footerLinks: 'Links',
    emailLabel: 'Contact',
    notFoundTitle: 'Page Not Found',
    notFoundBody: 'The address may be mistyped, or the page has moved.',
    notFoundBack: 'Back to Home',
    planned: 'Planned',
    inDevelopment: 'In development',
  },
};

export function commonCopy(locale: Locale): CommonCopy {
  return COMMON[locale];
}
