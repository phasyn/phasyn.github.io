import type { Locale, Page } from '../site/config.ts';
import type { Copy } from './locale.tsx';

interface CommonCopy {
  languageName: string;
  skipToContent: string;
  nav: Record<Page, string>;
  navLabel: string;
  menuOpen: string;
  menuClose: string;
  languageLabel: string;
  sourceSoon: string;
  personalProject: string;
  footerTagline: string;
  footerMadeBy: string;
  footerCredits: string;
  footerLicense: string;
  footerModels: string;
  footerLinks: string;
  emailLabel: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundBack: string;
  illustrative: string;
  planned: string;
  inDevelopment: string;
  inTesting: string;
  designGoal: string;
  coming: string;
}

export const COMMON: Copy<CommonCopy> = {
  'zh-hant': {
    languageName: '繁體中文',
    skipToContent: '跳至主要內容',
    nav: { home: '首頁', tour: '操作導覽', showcase: '作品', benchmarks: '效能實測', about: '關於' },
    navLabel: '主要導覽',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    languageLabel: '語言',
    sourceSoon: '即將開放原始碼與架構說明',
    personalProject: '個人、非商業專案',
    footerTagline: '從分鏡，到成片。',
    footerMadeBy: '由 DennySORA 開發的個人、非商業專案。',
    footerCredits:
      '示範圖片與影片以 Phasyn Studio（MiniMax H3、Qwen-Image 2.1）生成；網站插圖由 OpenAI Codex 以 AI 生成；影片配樂以 Suno 生成。',
    footerLicense: 'Phasyn Studio 原始碼將以 Apache-2.0 授權公開；名稱、標誌與字標為 DennySORA 所有，不在授權範圍內。',
    footerModels: '模型權重不隨專案提供，使用時須遵守各自的授權：MiniMax H3 Community License（含地域限制與使用規範）、Qwen-Image 2.1（研究、非商業用途）。',
    footerLinks: '連結',
    emailLabel: '聯絡信箱',
    notFoundTitle: '找不到這個頁面',
    notFoundBody: '網址可能打錯了，或頁面已經搬移。',
    notFoundBack: '回到首頁',
    illustrative: '介面示意',
    planned: '規劃中',
    inDevelopment: '開發中',
    inTesting: '測試中',
    designGoal: '設計目標',
    coming: '即將加入',
  },
  ja: {
    languageName: '日本語',
    skipToContent: 'メインコンテンツへスキップ',
    nav: { home: 'ホーム', tour: '操作ガイド', showcase: '作例', benchmarks: 'ベンチマーク', about: 'このプロジェクトについて' },
    navLabel: 'メインナビゲーション',
    menuOpen: 'メニューを開く',
    menuClose: 'メニューを閉じる',
    languageLabel: '言語',
    sourceSoon: 'ソースコードとアーキテクチャ解説を近日公開',
    personalProject: '個人・非商用プロジェクト',
    footerTagline: '絵コンテから、完成映像まで。',
    footerMadeBy: 'DennySORA が開発する個人・非商用プロジェクトです。',
    footerCredits:
      'デモの画像と動画は Phasyn Studio（MiniMax H3、Qwen-Image 2.1）で生成しています。サイトのイラストは OpenAI Codex で生成した AI 画像、映像の音楽は Suno で生成したものです。',
    footerLicense: 'Phasyn Studio のソースコードは Apache-2.0 ライセンスで公開予定です。名称・ロゴ・ワードマークは DennySORA に帰属し、ライセンスの対象外です。',
    footerModels: 'モデルの重みは同梱していません。ご利用の際は各ライセンスに従ってください。MiniMax H3 Community License（地域制限と利用ポリシーあり）、Qwen-Image 2.1（研究・非商用に限る）。',
    footerLinks: 'リンク',
    emailLabel: '連絡先',
    notFoundTitle: 'ページが見つかりません',
    notFoundBody: 'URL が間違っているか、ページが移動した可能性があります。',
    notFoundBack: 'ホームへ戻る',
    illustrative: 'UI イメージ',
    planned: '計画中',
    inDevelopment: '開発中',
    inTesting: 'テスト中',
    designGoal: '設計目標',
    coming: '近日追加予定',
  },
  en: {
    languageName: 'English',
    skipToContent: 'Skip to Main Content',
    nav: { home: 'Home', tour: 'Tour', showcase: 'Showcase', benchmarks: 'Benchmarks', about: 'About' },
    navLabel: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    languageLabel: 'Language',
    sourceSoon: 'Source code and architecture notes — coming soon',
    personalProject: 'Personal, non-commercial project',
    footerTagline: 'From storyboard to synthesis.',
    footerMadeBy: 'A personal, non-commercial project by DennySORA.',
    footerCredits:
      'Demo images and videos are generated with Phasyn Studio (MiniMax H3, Qwen-Image 2.1). Site illustrations are AI-generated with OpenAI Codex; film music is generated with Suno.',
    footerLicense: 'Phasyn Studio source code will be released under the Apache-2.0 license. The name, logo and wordmark belong to DennySORA and are not covered by that license.',
    footerModels: 'Model weights are not included, and each model has its own license: the MiniMax H3 Community License (with territorial restrictions and an acceptable-use policy) and Qwen-Image 2.1 (research and non-commercial use only).',
    footerLinks: 'Links',
    emailLabel: 'Contact',
    notFoundTitle: 'Page Not Found',
    notFoundBody: 'The address may be mistyped, or the page has moved.',
    notFoundBack: 'Back to Home',
    illustrative: 'Illustrative UI',
    planned: 'Planned',
    inDevelopment: 'In development',
    inTesting: 'In testing',
    designGoal: 'Design goal',
    coming: 'Coming',
  },
};

export function commonCopy(locale: Locale): CommonCopy {
  return COMMON[locale];
}
