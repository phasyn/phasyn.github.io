import type { WorkCategory, WorkFeature, WorkOrientation, WorkTitle } from '../site/works.ts';
import type { Copy } from './locale.tsx';

/** One planned work of tonight's slate, shown as a "rendering" card until a real work fills its slot. */
export interface SlateEntry {
  /** Expected slug; a delivered work with this slug or the same zh-hant title fills the slot. */
  slug: string;
  title: WorkTitle;
  /** Unknown for the two vertical pieces still to be decided. */
  category: WorkCategory | null;
  orientation: WorkOrientation;
}

/** Planned works shown as "rendering" cards. Empty: the Works page lists only works that are published. */
export const SLATE: readonly SlateEntry[] = [];

export interface WorksCopy {
  category: Record<WorkCategory, string>;
  orientation: Record<WorkOrientation, string>;
  feature: Record<WorkFeature, string>;
  /** Placeholder state of a slate entry that has not been delivered yet. */
  rendering: string;
  /** Accessible name of a work's video. */
  videoLabel: (title: string) => string;
  /** "Length 0:10" for screen readers. */
  length: string;
  features: string;
}

export const WORKS_COPY: Copy<WorksCopy> = {
  'zh-hant': {
    category: { battle: '戰鬥', daily: '日常', fantasy: '奇幻' },
    orientation: { landscape: '橫式', portrait: '直式' },
    feature: {
      steps8: '8 步定稿',
      characterRef: '角色參考',
      softvl2x: 'Soft_VL 2× 升頻',
      oneTake: '一鏡到底',
      sound: '聲畫同生',
    },
    rendering: '渲染中',
    videoLabel: (title) => `${title}（AI 生成影片）`,
    length: '長度',
    features: '特色',
  },
  ja: {
    category: { battle: 'バトル', daily: '日常', fantasy: 'ファンタジー' },
    orientation: { landscape: '横長', portrait: '縦型' },
    feature: {
      steps8: '8 ステップ本番',
      characterRef: 'キャラクター参照',
      softvl2x: 'Soft_VL 2× アップスケール',
      oneTake: 'ワンカット',
      sound: '映像と音を同時生成',
    },
    rendering: 'レンダリング中',
    videoLabel: (title) => `${title}（AI 生成の映像）`,
    length: '長さ',
    features: '特徴',
  },
  en: {
    category: { battle: 'Battle', daily: 'Daily life', fantasy: 'Fantasy' },
    orientation: { landscape: 'Landscape', portrait: 'Vertical' },
    feature: {
      steps8: '8-step final',
      characterRef: 'Character reference',
      softvl2x: 'Soft_VL 2× upscale',
      oneTake: 'One take',
      sound: 'Sound with picture',
    },
    rendering: 'Rendering',
    videoLabel: (title) => `${title} (AI-generated video)`,
    length: 'Length',
    features: 'Features',
  },
};
