import type { Copy } from '../../i18n/locale.tsx';
import { LOCALES, type Locale } from '../../site/config.ts';
import { COUNTS, EARLIER, TODAY, type DeviceKey } from './runs.ts';

/*
 * The eight Tour chapters. One source for media names, posters, lengths, subtitle mapping, machines and the measured
 * readout; every visible sentence lives in copy.ts.
 *
 * Dropping in a recording needs no code change: put `tour/<media>.<locale>.mp4` under the media base (public/media during
 * review, VITE_MEDIA_BASE in production). If the matching WebVTT export (`tour/<media>.<locale>.vtt`, or `.en.vtt`) sits next to
 * it, the "What you'll see" timestamps appear by themselves; `cueStarts` pins them without a VTT.
 */

export const CHAPTER_IDS = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'] as const;
export type ChapterId = (typeof CHAPTER_IDS)[number];

export type MachineRole =
  | 'text'
  | 'imageGen'
  | 'prepCompose'
  | 'encode'
  | 'denoise'
  | 'videoDecode'
  | 'audio'
  | 'mux'
  | 'concat'
  | 'vision'
  | 'promptTools'
  | 'regenerate';

export interface ChapterMachine {
  device: DeviceKey;
  /** Component instance ids on that machine (never translated). */
  ids: readonly string[];
  roles: readonly MachineRole[];
}

export interface ReadoutValue {
  value: number;
  decimals: number;
}

export interface ChapterOutput {
  /** The input: a still or the character sheet (site-relative WebP). */
  input: { src: string; width: number; height: number };
  /** The generated clip (review media under the media base) and its poster. */
  clip: string;
  clipPoster: string;
}

export interface ChapterSpec {
  id: ChapterId;
  number: number;
  /** Fixed media name (shared with the recording worker): `tour/<media>.<locale>.mp4`. */
  media: string;
  poster: string;
  /** Planned length of the final cut in seconds (work/product/recording-plan.md §0). Replace with the real cut's length. */
  length: number;
  /** For each "What you'll see" step, the subtitle cues it covers (0-based, docs/film/captions.json). */
  steps: readonly (readonly number[])[];
  /** Cue start times in seconds (index = cue), when known without the VTT export. */
  cueStarts?: readonly number[];
  machines: readonly ChapterMachine[];
  /** The measured number in the facts panel: one value or a range (counted up when it scrolls into view). */
  readout: { values: readonly ReadoutValue[]; approx?: boolean; unit?: string };
  /** Real output made with Phasyn Studio today, shown beside the recording. */
  output?: ChapterOutput;
}

const one = (cues: number) => [cues] as const;

export const CHAPTERS: readonly ChapterSpec[] = [
  {
    id: 'v1',
    number: 1,
    media: 'v1-text-to-image',
    poster: '/images/tour/v1.webp',
    length: 45,
    steps: [one(0), one(1), one(2), one(3), one(4), one(5)],
    machines: [
      { device: 'rtx5080', ids: ['qimg-dit-bf16-5080-stream'], roles: ['imageGen'] },
      { device: 'cpu', ids: ['qimg-prepare', 'image-compose'], roles: ['prepCompose'] },
    ],
    readout: { values: [{ value: TODAY.still.min, decimals: 1 }, { value: TODAY.still.max, decimals: 1 }], unit: 's' },
  },
  {
    id: 'v2',
    number: 2,
    media: 'v2-image-to-video',
    poster: '/images/tour/v2.webp',
    length: 70,
    steps: [[0, 1], one(2), [3, 4], one(5), one(6), one(7)],
    machines: [
      { device: 'gb10', ids: ['te-gb10'], roles: ['text'] },
      { device: 'rtx5080', ids: ['venc-5080', 'dit-5080', 'vae-5080'], roles: ['encode', 'denoise', 'videoDecode'] },
      { device: 'rtx3060', ids: ['audio-3060'], roles: ['audio'] },
      { device: 'cpu', ids: ['mux'], roles: ['mux'] },
    ],
    readout: { values: [{ value: TODAY.fl2va.min, decimals: 1 }, { value: TODAY.fl2va.max, decimals: 0 }], unit: 's' },
    output: {
      input: { src: '/images/tour/still-rain.webp', width: 1152, height: 672 },
      clip: 'tour/clips/fl2va-rain.mp4',
      clipPoster: '/images/tour/clip-fl2va-rain.webp',
    },
  },
  {
    id: 'v3',
    number: 3,
    media: 'v3-references-advisor',
    poster: '/images/tour/v3.webp',
    length: 85,
    steps: [[0, 1], one(2), one(3), [4, 5], one(6), one(7)],
    machines: [
      { device: 'gb10', ids: ['te-gb10'], roles: ['text'] },
      { device: 'rtx5080', ids: ['venc-5080', 'dit5080-ref2va-fp8-pai8', 'vae-5080'], roles: ['encode', 'denoise', 'videoDecode'] },
      { device: 'rtx3060', ids: ['aenc-3060', 'audio-3060'], roles: ['audio'] },
      { device: 'cpu', ids: ['mux'], roles: ['mux'] },
    ],
    readout: { values: [{ value: TODAY.ref2va.min, decimals: 0 }, { value: TODAY.ref2va.max, decimals: 0 }], unit: 's' },
    output: {
      input: { src: '/images/tour/courier-sheet.webp', width: 576, height: 768 },
      clip: 'tour/clips/ref2va-rooftop.mp4',
      clipPoster: '/images/tour/clip-ref2va-rooftop.webp',
    },
  },
  {
    id: 'v4',
    number: 4,
    media: 'v4-timeline-export',
    poster: '/images/tour/v4.webp',
    length: 70,
    steps: [one(0), one(1), one(2), one(3), one(4), one(5)],
    machines: [{ device: 'cpu', ids: ['concat'], roles: ['concat'] }],
    readout: { values: [{ value: EARLIER.exportPlain, decimals: 0 }], approx: true, unit: 's' },
  },
  {
    id: 'v5',
    number: 5,
    media: 'v5-image-to-prompt',
    poster: '/images/tour/v5.webp',
    length: 65,
    steps: [one(0), one(1), one(2), one(3), one(4), one(5)],
    machines: [
      { device: 'gb10', ids: ['qimg-vision-gb10'], roles: ['vision'] },
      { device: 'cpu', ids: ['prompt-compile', 'prompt-score'], roles: ['promptTools'] },
      { device: 'rtx5080', ids: [], roles: ['regenerate'] },
    ],
    readout: { values: [{ value: EARLIER.visionAnalyze, decimals: 1 }], unit: 's' },
  },
  {
    id: 'v6',
    number: 6,
    media: 'v6-components-pipelines',
    poster: '/images/tour/v6.webp',
    length: 55,
    steps: [one(0), one(1), one(2), one(3), one(4), one(5)],
    machines: [],
    readout: { values: [{ value: TODAY.start.ref2vaDit, decimals: 1 }, { value: TODAY.start.fl2vaDit, decimals: 1 }], unit: 's' },
  },
  {
    id: 'v7',
    number: 7,
    media: 'v7-records-compare',
    poster: '/images/tour/v7.webp',
    length: 65,
    steps: [[0, 1], one(2), one(3), one(4), one(5), one(6)],
    machines: [],
    readout: { values: [{ value: COUNTS.recorderMetrics, decimals: 0 }] },
  },
  {
    id: 'v8',
    number: 8,
    media: 'v8-agent-skill',
    poster: '/images/tour/v8.webp',
    length: 75,
    steps: [one(0), one(1), one(2), one(3), one(4), one(5)],
    machines: [],
    readout: { values: [{ value: COUNTS.mcpTools, decimals: 0 }] },
  },
];

/** `tour/<media>.<locale>.mp4` for each locale (burned-in subtitles), as FilmPlayer expects. */
export function chapterSources(spec: ChapterSpec): Copy<string> {
  return Object.fromEntries(LOCALES.map((locale) => [locale, `tour/${spec.media}.${locale}.mp4`])) as Copy<string>;
}

/** Subtitle exports to try for cue times: the page locale first, then English (all locales share the timing). */
export function chapterCaptionPaths(spec: ChapterSpec, locale: Locale): string[] {
  const paths = [`tour/${spec.media}.${locale}.vtt`];
  if (locale !== 'en') paths.push(`tour/${spec.media}.en.vtt`);
  return paths;
}

export const TOTAL_LENGTH = CHAPTERS.reduce((sum, chapter) => sum + chapter.length, 0);

/** m:ss for video lengths and timestamps. */
export function clock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function chapterNumber(spec: ChapterSpec): string {
  return String(spec.number).padStart(2, '0');
}
