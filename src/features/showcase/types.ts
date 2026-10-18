// Showcase item shapes (types plus one constant, no TypeScript-only syntax), so scripts/import-showcase.ts can import them
// under Node's type stripping as well as the app.
//
// `ShowcaseItemJson` mirrors the recording agents' `item.json` (studio/out/final/showcase/{farm-*,rec-*}/item.json) and the
// seed entries in scripts/showcase-seed.json. `ShowcaseItem` is what the importer writes into items.gen.ts: the same fields,
// normalised (machines as keys, unknown values as null), plus the prompt text and the web media it produced. item.json's
// `notes` stay internal: the importer never copies them into the site (items.gen.ts only names each item's origin).

import type { Locale } from '../../site/config.ts';

/**
 * Edited pieces (studio/out/final/films/<slug>/ or showcase/<folder>/: film.mp4 or web.mp4, poster.jpg, item.json):
 * `film` (cut from several generated shots, usually with a Suno music bed), `trailer` and `making-of` (landscape cuts),
 * `social` (vertical 9:16 cuts). Single results: `still`, `fl2va`, `ref2va`, `multishot`, `roundtrip`.
 */
export type ShowcaseKind = 'film' | 'trailer' | 'social' | 'making-of' | 'still' | 'fl2va' | 'ref2va' | 'multishot' | 'roundtrip';

/** Kinds that are edits of several runs (no single run, seed or step list). */
export const EDIT_KINDS: readonly ShowcaseKind[] = ['film', 'trailer', 'social', 'making-of'];
export type ShowcaseGrade = 'hero' | 'usable';

/** Gallery groups. `film` and `social` get their own rows; the rest are the filters. Derived from `kind` unless overridden. */
export type ShowcaseCategory = 'film' | 'social' | 'image' | 'video' | 'character' | 'multishot';

/** Machines of the author's setup; `unknown` is shown as "placement not recorded" (never guessed). */
export type MachineKey = 'gb10' | 'rtx5080' | 'rtx3060' | 'cpu' | 'unknown';

/** One step as item.json writes it. `machine` is free text ("DGX Spark GB10", "RTX 5080", "RTX 5080 / CPU", "cpu"…). */
export interface ShowcaseStepJson {
  id: string;
  label: string;
  machine: string;
  /** Controller-observed seconds; null or absent = not recorded. */
  seconds: number | null;
  /** Optional: the value is a rounded reading ("~23 s"). */
  approx?: boolean;
  /** Optional: the component instance that ran the step (te-gb10, dit-5080…). */
  component?: string;
}

/** The reference an item was made from: another item's slug, a file (in the item folder or relative to the project root), or a label. */
export type ShowcaseReferenceJson = string | { slug?: string; file?: string; label?: string };

/** One generated shot inside an edited piece. */
export interface ShowcaseShotJson {
  runId?: string;
  seed?: number | null;
  seconds?: number | null;
  pipeline?: string;
}

export interface ShowcaseItemJson {
  slug: string;
  title: Record<Locale, string>;
  kind: ShowcaseKind;
  pipeline: string;
  /** Single results only (edits list their runs in `shots`). */
  runId?: string;
  outputId?: string | null;
  seed?: number | null;
  model?: string;
  ditEngine?: string;
  width: number;
  height: number;
  frames?: number | null;
  fps?: number | null;
  seconds?: number | null;
  endToEndSeconds?: number | null;
  steps?: ShowcaseStepJson[];
  /** Edited pieces: the generated shots they were cut from, in order. */
  shots?: ShowcaseShotJson[];
  reference?: ShowcaseReferenceJson | null;
  grade: string;
  notes?: string;
  createdAt?: string;
  // Optional extensions (the importer passes them through; item.json may leave them out).
  /** End-to-end time is a rounded reading ("~30 s"). */
  endToEndApprox?: boolean;
  /** Override the gallery group derived from `kind`. */
  category?: ShowcaseCategory;
  /** Poster frame time for clips, seconds (default: 40 % of the clip). */
  posterAt?: number;
}

export interface ShowcaseStep {
  id: string;
  /** item.json's English label (fallback when the id has no localised name). */
  label: string;
  /** One or more machines (a combined step such as "VAE decode + compose" can span two). */
  machines: readonly MachineKey[];
  seconds: number | null;
  approx: boolean;
  /** Component instance id (never translated), when the item recorded it. */
  component?: string;
}

export interface ShowcaseImage {
  /** Largest variant (never larger than the native output). */
  src: string;
  /** `src` plus smaller variants, for `srcSet`. */
  srcSet: string;
  width: number;
  height: number;
}

export interface ShowcaseMedia {
  /** The still itself, or the clip's poster frame (native size or smaller; never upscaled). */
  image: ShowcaseImage;
  /** Clip path under the media base (resolved with mediaUrl; public/media during review). */
  clip?: string;
  /** Frame contact sheet, if the item folder had one. */
  contact?: ShowcaseImage;
  /** Loudness of the raw output before the web copy was normalised (LUFS, integrated), when it had sound. */
  rawLufs?: number;
  /** Sample rate of the raw output's sound (H3 writes 32 kHz AAC). */
  rawSampleRate?: number;
  /** Edited pieces: integrated loudness of the published mix (already mastered; kept as delivered). */
  mixLufs?: number;
  /** Site-relative WebVTT per locale (FilmPlayer `captions`), when the producer supplied them. */
  captions?: Record<Locale, string>;
  /**
   * Launch cuts frame native clips larger on a blurred backdrop (resampling only, no super-resolution): the largest factor
   * from the cut's framing record, for disclosure. Absent = shown at native size.
   */
  displayScale?: number;
}

export interface ShowcaseReference {
  /** Slug of the item it came from, when that item is on the page. */
  slug?: string;
  image?: ShowcaseImage;
  label?: string;
}

export interface ShowcaseShot {
  runId: string;
  seed: number | null;
  seconds: number | null;
}

export interface ShowcaseItem {
  slug: string;
  title: Record<Locale, string>;
  kind: ShowcaseKind;
  category: ShowcaseCategory;
  pipeline: string;
  /** '' for edited pieces (see `shots`). */
  runId: string;
  outputId: string | null;
  seed: number | null;
  /** '' when the record does not name it (edited pieces). */
  model: string;
  ditEngine: string;
  width: number;
  height: number;
  frames: number | null;
  fps: number | null;
  seconds: number | null;
  endToEndSeconds: number | null;
  endToEndApprox: boolean;
  steps: readonly ShowcaseStep[];
  /** Edited pieces: the generated shots, in order (empty for single results). */
  shots: readonly ShowcaseShot[];
  /** Edited pieces with a Suno music bed under H3's own sound (from the edit record; credit "Music generated with Suno"). */
  music: boolean;
  reference: ShowcaseReference | null;
  grade: ShowcaseGrade;
  createdAt: string;
  /** The exact prompt sent to the model (English; shown with lang="en"). */
  prompt: string;
  media: ShowcaseMedia;
}
