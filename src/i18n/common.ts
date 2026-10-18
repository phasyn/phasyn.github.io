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
  footerLinks: string;
  emailLabel: string;
  notFoundTitle: string;
  notFoundBody: string;
  notFoundBack: string;
  illustrative: string;
  planned: string;
  inDevelopment: string;
}

export const COMMON: Copy<CommonCopy> = {
  'zh-hant': {
    languageName: '繁體中文',
    skipToContent: '跳至主要內容',
    nav: { home: '首頁', tour: '操作導覽', benchmarks: '數據分析', about: '關於' },
    navLabel: '主要導覽',
    menuOpen: '開啟選單',
    menuClose: '關閉選單',
    languageLabel: '語言',
    sourceSoon: '即將開放原始碼與架構說明',
    personalProject: '個人、非商業專案',
    footerTagline: '從分鏡，到成片。',
    footerMadeBy: '由 DennySORA 開發的個人、非商業專案。',
    footerCredits: '影片配樂以 Suno 生成。示範影片中的畫面皆由 Phasyn Studio 實際操作錄製。',
    footerLinks: '連結',
    emailLabel: '聯絡信箱',
    notFoundTitle: '找不到這個頁面',
    notFoundBody: '網址可能打錯了，或頁面已經搬移。',
    notFoundBack: '回到首頁',
    illustrative: '介面示意',
    planned: '規劃中',
    inDevelopment: '開發中',
  },
  ja: {
    languageName: '日本語',
    skipToContent: 'メインコンテンツへスキップ',
    nav: { home: 'ホーム', tour: '操作ガイド', benchmarks: 'ベンチマーク', about: 'このプロジェクトについて' },
    navLabel: 'メインナビゲーション',
    menuOpen: 'メニューを開く',
    menuClose: 'メニューを閉じる',
    languageLabel: '言語',
    sourceSoon: 'ソースコードとアーキテクチャ解説を近日公開',
    personalProject: '個人・非商用プロジェクト',
    footerTagline: '絵コンテから、完成映像まで。',
    footerMadeBy: 'DennySORA が開発する個人・非商用プロジェクトです。',
    footerCredits: '映像の音楽は Suno で生成しています。デモ映像は Phasyn Studio の実際の操作を録画したものです。',
    footerLinks: 'リンク',
    emailLabel: '連絡先',
    notFoundTitle: 'ページが見つかりません',
    notFoundBody: 'URL が間違っているか、ページが移動した可能性があります。',
    notFoundBack: 'ホームへ戻る',
    illustrative: 'UI イメージ',
    planned: '計画中',
    inDevelopment: '開発中',
  },
  en: {
    languageName: 'English',
    skipToContent: 'Skip to Main Content',
    nav: { home: 'Home', tour: 'Tour', benchmarks: 'Benchmarks', about: 'About' },
    navLabel: 'Main navigation',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    languageLabel: 'Language',
    sourceSoon: 'Source code and architecture notes — coming soon',
    personalProject: 'Personal, non-commercial project',
    footerTagline: 'From storyboard to synthesis.',
    footerMadeBy: 'A personal, non-commercial project by DennySORA.',
    footerCredits: 'Film music generated with Suno. Demo footage is recorded from real Phasyn Studio sessions.',
    footerLinks: 'Links',
    emailLabel: 'Contact',
    notFoundTitle: 'Page not found',
    notFoundBody: 'The address may be mistyped, or the page has moved.',
    notFoundBack: 'Back to Home',
    illustrative: 'Illustrative UI',
    planned: 'Planned',
    inDevelopment: 'In development',
  },
};

export function commonCopy(locale: Locale): CommonCopy {
  return COMMON[locale];
}
