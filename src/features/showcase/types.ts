// Showcase item shapes. Pure types (no runtime code), so scripts/import-showcase.ts can import them under Node's type
// stripping as well as the app.
//
// `ShowcaseItemJson` mirrors the recording agents' `item.json` (studio/out/final/showcase/{farm-*,rec-*}/item.json) and the
// seed entries in scripts/showcase-seed.json. `ShowcaseItem` is what the importer writes into items.gen.ts: the same fields,
// normalised (machines as keys, unknown values as null), plus the prompt text and the web media it produced. item.json's
// `notes` stay internal: the importer writes them as comments in items.gen.ts, so they never reach the bundle.

import type { Locale } from '../../site/config.ts';

/** `film` = a finished 30–60 s piece (studio/out/final/films/<slug>/: film.mp4, poster.jpg, item.json). */
export type ShowcaseKind = 'film' | 'still' | 'fl2va' | 'ref2va' | 'multishot' | 'roundtrip';
export type ShowcaseGrade = 'hero' | 'usable';

/** Gallery groups (Films / Image / Video / Character / Multi-shot). Derived from `kind` unless an item overrides it. */
export type ShowcaseCategory = 'film' | 'image' | 'video' | 'character' | 'multishot';

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
}

/** The reference an item was made from: another item's slug, a file in the item folder, or a short label. */
export type ShowcaseReferenceJson = string | { slug?: string; file?: string; label?: string };

export interface ShowcaseItemJson {
  slug: string;
  title: Record<Locale, string>;
  kind: ShowcaseKind;
  pipeline: string;
  runId: string;
  outputId?: string | null;
  seed: number;
  model: string;
  ditEngine: string;
  width: number;
  height: number;
  frames?: number | null;
  fps?: number | null;
  seconds?: number | null;
  endToEndSeconds: number | null;
  steps: ShowcaseStepJson[];
  reference?: ShowcaseReferenceJson | null;
  grade: string;
  notes?: string;
  createdAt: string;
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
}

export interface ShowcaseReference {
  /** Slug of the item it came from, when that item is on the page. */
  slug?: string;
  image?: ShowcaseImage;
  label?: string;
}

export interface ShowcaseItem {
  slug: string;
  title: Record<Locale, string>;
  kind: ShowcaseKind;
  category: ShowcaseCategory;
  pipeline: string;
  runId: string;
  outputId: string | null;
  seed: number;
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
  reference: ShowcaseReference | null;
  grade: ShowcaseGrade;
  createdAt: string;
  /** The exact prompt sent to the model (English; shown with lang="en"). */
  prompt: string;
  media: ShowcaseMedia;
}
