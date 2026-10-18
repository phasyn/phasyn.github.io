import type { Copy } from '../../i18n/locale.tsx';
import { LOCALES } from '../../site/config.ts';
import { COUNTS, EARLIER, TODAY, type DeviceKey } from './runs.ts';
import type { UiKey } from './screens.ts';

/*
 * The five Tour chapters: one source for media names, posters, lengths, subtitle anchors, badges and supporting screens; every
 * visible sentence lives in copy.ts.
 *
 * Dropping in a recording needs no code change: the 30 fps master `tour/<media>.mp4` goes under the media base (public/media
 * during review, VITE_MEDIA_BASE in production) and its subtitles ship with the site as `/captions/tour/<media>.<locale>.vtt`.
 * The "What you'll see" timestamps come from the English subtitles (every locale shares one timing), matched by each step's
 * anchor line.
 */

export const CHAPTER_IDS = ['c1', 'c2', 'c3', 'c4', 'c5'] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];

/** A measured value or range, counted up when it scrolls into view. */
export interface Measure {
  values: readonly { value: number; decimals: number }[];
  approx?: boolean;
  unit?: string;
}

export interface StepBadge {
  devices?: readonly DeviceKey[];
  measure?: Measure;
}

export interface ChapterStep {
  /**
   * English subtitle line (docs/film/captions.json) where this step starts in the video; matched against the English VTT for
   * the timestamp. Case and line breaks are ignored.
   */
  anchor: string;
  badge?: StepBadge;
}

export interface ChapterSpec {
  id: ChapterId;
  number: number;
  /** Fixed media name (shared with the recording worker): `tour/<media>.mp4` + `/captions/tour/<media>.<locale>.vtt`. */
  media: string;
  poster: string;
  /** Length in seconds: the real cut's when `recorded`, else the planned length (work/product/recording-plan.md §0). */
  length: number;
  /** The final master exists (its real length is known). */
  recorded?: boolean;
  steps: readonly ChapterStep[];
  /** Real captures shown beside the chapter (public/images/tour/ui). List only captures that exist. */
  screens: readonly UiKey[];
}

const range = (min: number, max: number, decimals: [number, number] = [1, 1]): Measure => ({
  values: [
    { value: min, decimals: decimals[0] },
    { value: max, decimals: decimals[1] },
  ],
  unit: 's',
});
const single = (value: number, decimals: number, approx = false): Measure => ({ values: [{ value, decimals }], unit: 's', approx });

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    id: 'c1',
    number: 1,
    media: '01-text-image-video',
    poster: '/images/tour/v1.webp',
    length: 115,
    steps: [
      { anchor: 'Describe it once. Pick a size and seed.' },
      { anchor: 'Wake only the models this image needs.', badge: { devices: ['rtx5080'], measure: single(TODAY.start.imageDit, 1) } },
      { anchor: 'Watch it take shape while it renders.', badge: { devices: ['rtx5080'], measure: range(TODAY.still.min, TODAY.still.max) } },
      { anchor: 'Turn the image into an opening frame.' },
      { anchor: 'One render,', badge: { devices: ['gb10', 'rtx5080', 'rtx3060'] } },
      { anchor: 'Every stage reports its measured time.', badge: { measure: range(TODAY.fl2va.min, TODAY.fl2va.max, [0, 0]) } },
    ],
    screens: ['image-studio-generating', 'render-engine-image', 'image-studio-takes'],
  },
  {
    id: 'c2',
    number: 2,
    media: '02-references-advisor',
    poster: '/images/tour/v2.webp',
    length: 85,
    steps: [
      { anchor: 'Bring your own references.' },
      { anchor: 'Every @mention maps to an H3 tag.' },
      { anchor: 'Start from the official 6-section format.' },
      { anchor: '74 rules check the prompt as you type.' },
      { anchor: 'Preview the fix, then apply it.' },
      { anchor: 'Image and music references,', badge: { devices: ['gb10', 'rtx5080', 'rtx3060'], measure: range(TODAY.ref2va.min, TODAY.ref2va.max, [0, 0]) } },
    ],
    screens: [],
  },
  {
    id: 'c3',
    number: 3,
    media: '03-timeline-export',
    poster: '/images/tour/v3.webp',
    length: 70,
    steps: [
      { anchor: 'Arrange shots on a real timeline.' },
      { anchor: 'Split, trim and snap, frame-accurate.' },
      { anchor: 'Add a dissolve between shots.' },
      { anchor: 'Speed up a clip.' },
      { anchor: 'Export one MP4, rendered by FFmpeg.', badge: { devices: ['cpu'], measure: single(EARLIER.exportPlain, 0, true) } },
    ],
    screens: [],
  },
  {
    id: 'c4',
    number: 4,
    media: '04-image-to-prompt',
    poster: '/images/tour/v4.webp',
    // Final master studio/out/final/tour/04-image-to-prompt.mp4: 52.9 s, 1920×1080, 30 fps (ffprobe).
    length: 52.9,
    recorded: true,
    steps: [
      { anchor: 'Have an image? Get its prompt back.' },
      { anchor: 'The analysis runs on DGX Spark.', badge: { devices: ['gb10'], measure: single(EARLIER.visionAnalyze, 1) } },
      { anchor: 'Eight sections, from subject' },
      { anchor: 'Core and detailed prompts, ready to edit.' },
      { anchor: 'Regenerate each candidate and score it.' },
      { anchor: 'Send the best one to Image Studio.' },
    ],
    screens: [],
  },
  {
    id: 'c5',
    number: 5,
    media: '05-components-records',
    poster: '/images/tour/v5.webp',
    length: 120,
    steps: [
      { anchor: 'Every render is a pipeline you can see.' },
      { anchor: 'Swap the DiT for another variant.', badge: { devices: ['rtx5080'], measure: range(TODAY.start.ref2vaDit, TODAY.start.fl2vaDit) } },
      { anchor: 'Set precision per component,' },
      { anchor: 'See each step, and where it ran.' },
      { anchor: 'Unknown stays unknown, never zero.', badge: { measure: { values: [{ value: COUNTS.recorderMetrics, decimals: 0 }] } } },
      { anchor: 'Compare up to eight recordings.' },
    ],
    screens: ['components-pipeline-graph', 'component-inspector-precision', 'records-run-steps'],
  },
];

/** The 30 fps master, shared by every locale (subtitles come from the VTT files). */
export function chapterSource(spec: ChapterSpec): string {
  return `tour/${spec.media}.mp4`;
}

/** Site-hosted subtitles per locale, for FilmPlayer's `captions` prop. */
export function chapterCaptions(spec: ChapterSpec): Copy<string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, `/captions/tour/${spec.media}.${locale}.vtt`])) as Copy<string>;
}

/** The English subtitles, used to find where each step starts (all locales share one timing). */
export function chapterTimingPath(spec: ChapterSpec): string {
  return `/captions/tour/${spec.media}.en.vtt`;
}

export const TOTAL_LENGTH = CHAPTERS.reduce((sum, chapter) => sum + chapter.length, 0);

/** The chapter's length as shown: the real one once recorded, otherwise marked as planned. */
export function lengthText(spec: ChapterSpec, planned: (time: string) => string): string {
  return spec.recorded ? clock(spec.length) : planned(clock(spec.length));
}

/** m:ss for video lengths and timestamps. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function chapterNumber(spec: ChapterSpec): string {
  return String(spec.number).padStart(2, '0');
}
