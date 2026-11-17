// Validation for scripts/import-works.ts: pure functions (no file system, no ffmpeg), so the boundary test can run them.
//
// A work's <slug>.json is producer input: only the fields below are read, anything else is ignored and never copied into
// the site. Bad input rejects the work with a reason instead of throwing.

import {
  WORK_CATEGORIES,
  WORK_FEATURES,
  type WorkCategory,
  type WorkFeature,
  type WorkOrientation,
  type WorkTitle,
} from '../src/site/works.ts';

export interface ValidatedWork {
  slug: string;
  title: WorkTitle;
  jaFallback: boolean;
  category: WorkCategory;
  features: WorkFeature[];
  /** Short run id (first 8 characters). */
  run: string;
  seed: number;
  seconds: number;
  posterAt: number;
  frames: number;
  featured: number | null;
}

export type Result<T> = { ok: true; value: T; warnings: string[] } | { ok: false; reason: string };

/** Public text must never carry LAN addresses, file paths, URLs or account/machine names. */
const PRIVATE = [
  /\b(?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/,
  /[\\/]/,
  /^~/,
  /\.(?:mp4|mov|mkv|webm|json|png|jpe?g|webp|wav|txt|safetensors|ckpt|pt)\b/i,
  /\b[a-z][a-z0-9+.-]*:\/\//i,
  /dennysora/i,
  /\b(?:home|mnt|Users|tmp)\b.*\b(?:Code|AI|lab|out)\b/,
];

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RUN = /^[A-Za-z0-9][A-Za-z0-9_-]{5,63}$/;
// eslint-disable-next-line no-control-regex -- rejecting control characters is the point
const CONTROL = /[\u0000-\u001f\u007f]/;
const MAX_TITLE = 60;

/** Producer category words the JSON may use, mapped to the site's keys. */
const CATEGORY_ALIASES: Record<string, WorkCategory> = {
  battle: 'battle',
  戰鬥: 'battle',
  daily: 'daily',
  日常: 'daily',
  fantasy: 'fantasy',
  奇幻: 'fantasy',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function isValidSlug(slug: string): boolean {
  return slug.length <= 64 && SLUG.test(slug);
}

/** A title the site can show: a short single line without anything path-, URL- or machine-like. */
export function titleProblem(value: unknown): string | null {
  if (typeof value !== 'string') return 'is not a string';
  const text = value.trim();
  if (!text) return 'is empty';
  if (text.length > MAX_TITLE) return `is longer than ${String(MAX_TITLE)} characters`;
  if (CONTROL.test(text)) return 'contains control characters';
  if (PRIVATE.some((pattern) => pattern.test(text))) return 'looks like a path, URL, file name or private name';
  return null;
}

const positiveInt = (value: unknown): value is number => Number.isSafeInteger(value) && (value as number) > 0;

/** Validates one <slug>.json. `slug` comes from the file name. */
export function validateWorkJson(slug: string, raw: unknown): Result<ValidatedWork> {
  const fail = (reason: string): Result<ValidatedWork> => ({ ok: false, reason });
  const warnings: string[] = [];
  if (!isValidSlug(slug)) return fail(`slug "${slug}" is not lower-case words joined by hyphens`);
  if (!isRecord(raw)) return fail('the JSON is not an object');

  const title = raw.title;
  if (!isRecord(title)) return fail('title is missing');
  for (const locale of ['zh-hant', 'en'] as const) {
    const problem = titleProblem(title[locale]);
    if (problem) return fail(`title.${locale} ${problem}`);
  }
  const zh = (title['zh-hant'] as string).trim();
  const en = (title.en as string).trim();
  let ja = en;
  let jaFallback = true;
  if (title.ja !== undefined && title.ja !== null && title.ja !== '') {
    const problem = titleProblem(title.ja);
    if (problem) return fail(`title.ja ${problem}`);
    ja = (title.ja as string).trim();
    jaFallback = false;
  } else warnings.push('no Japanese title: the English one is shown in ja');

  const categoryRaw = raw.category ?? raw.theme;
  const category = typeof categoryRaw === 'string' ? CATEGORY_ALIASES[categoryRaw.trim().toLowerCase()] : undefined;
  if (!category) return fail(`category/theme must be one of ${WORK_CATEGORIES.join(', ')}`);

  if (!Array.isArray(raw.features)) return fail('features is not an array');
  const features: WorkFeature[] = [];
  for (const feature of raw.features) {
    if (typeof feature === 'string' && (WORK_FEATURES as readonly string[]).includes(feature)) {
      if (!features.includes(feature as WorkFeature)) features.push(feature as WorkFeature);
    } else
      warnings.push(`unknown feature dropped (${typeof feature === 'string' ? feature.slice(0, 24) : typeof feature})`);
  }

  if (typeof raw.run_id !== 'string' || !RUN.test(raw.run_id)) return fail('run_id is missing or not an id');
  const run = raw.run_id.replace(/[_-]/g, '').slice(0, 8).toLowerCase();
  if (!Number.isSafeInteger(raw.seed) || (raw.seed as number) < 0) return fail('seed is not a non-negative integer');

  const seconds = raw.seconds;
  if (typeof seconds !== 'number' || !Number.isFinite(seconds) || seconds <= 0 || seconds > 60)
    return fail('seconds must be a number between 0 and 60');
  const posterAt = raw.poster_at;
  if (typeof posterAt !== 'number' || !Number.isFinite(posterAt) || posterAt < 0 || posterAt >= seconds)
    return fail('poster_at must be a time inside the clip');

  if (!positiveInt(raw.frames_source) || !positiveInt(raw.frames_delivered))
    return fail('frames_source and frames_delivered must be positive integers');
  if (raw.frames_source !== raw.frames_delivered)
    return fail(
      `frame count changed (${String(raw.frames_source)} rendered, ${String(raw.frames_delivered)} delivered)`,
    );

  if (!isRecord(raw.basecheck) || raw.basecheck.pass !== true) return fail('basecheck did not pass');

  let featured: number | null = null;
  if (raw.featured !== undefined && raw.featured !== null) {
    if (!positiveInt(raw.featured)) return fail('featured must be a positive integer rank or null');
    featured = raw.featured;
  }

  return {
    ok: true,
    warnings,
    value: {
      slug,
      title: { 'zh-hant': zh, ja, en },
      jaFallback,
      category,
      features,
      run,
      seed: raw.seed as number,
      seconds,
      posterAt,
      frames: raw.frames_delivered,
      featured,
    },
  };
}

/** What ffprobe reported about a delivered master. */
export interface MasterProbe {
  width: number;
  height: number;
  /** Frames counted by decoding (nb_read_frames). */
  frames: number;
  fps: number;
  hasAudio: boolean;
}

export interface MasterFacts {
  orientation: WorkOrientation;
  fps: number;
  /** Length from the frame count. */
  seconds: number;
}

/** The master must match its JSON: same frame count, 24 fps-class rate, a 1280×736-shaped frame, and sound. */
export function checkMaster(work: ValidatedWork, probe: MasterProbe): Result<MasterFacts> {
  const fail = (reason: string): Result<MasterFacts> => ({ ok: false, reason });
  if (!positiveInt(probe.width) || !positiveInt(probe.height)) return fail('cannot read the video size');
  if (probe.frames !== work.frames)
    return fail(`the file has ${String(probe.frames)} frames, the JSON says ${String(work.frames)}`);
  if (!(probe.fps > 0) || Math.abs(probe.fps - 24) > 0.05) return fail(`frame rate is ${String(probe.fps)}, not 24`);
  const landscape = probe.width > probe.height;
  const long = Math.max(probe.width, probe.height);
  const short = Math.min(probe.width, probe.height);
  if (Math.abs(long / short - 1280 / 736) > 0.01)
    return fail(`${String(probe.width)}×${String(probe.height)} is not 1280×736-shaped`);
  if (long < 1280) return fail(`${String(probe.width)}×${String(probe.height)} is smaller than the web copy`);
  if (!probe.hasAudio) return fail('the master has no sound');
  const seconds = Math.round((probe.frames / probe.fps) * 100) / 100;
  if (Math.abs(seconds - work.seconds) > 0.5)
    return fail(`the file is ${String(seconds)} s long, the JSON says ${String(work.seconds)} s`);
  return { ok: true, warnings: [], value: { orientation: landscape ? 'landscape' : 'portrait', fps: 24, seconds } };
}

/** "24000/1001" → 23.976. */
export function parseRate(rate: string | undefined): number {
  if (!rate) return 0;
  const [num, den] = rate.split('/').map(Number);
  if (num === undefined || !Number.isFinite(num)) return 0;
  return den ? num / den : num;
}
