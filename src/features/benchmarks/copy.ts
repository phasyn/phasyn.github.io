import { use } from 'react';
import { useLocale, type Copy } from '../../i18n/locale.tsx';
import { localeFromPath, type Locale } from '../../site/config.ts';
import type { Ref448Key } from './data/chartTypes.ts';
import type { DeviceId, ExperimentId, InputsKey, ReasonKey, SceneKey, ScopeKey, StepKind } from './data/types.ts';

/*
 * Benchmarks page copy. zh-hant is the source; ja uses です・ます; en is US English with Apple HIG title case for headings.
 * Model, component and pipeline IDs, units and run IDs are never translated. Numbers come from the data modules; the
 * few numbers written into sentences here are quoted from the archive (work/benchmarks/analysis.md) and today's run table.
 */

type ExpNum = Exclude<ExperimentId, 'today'>;

export interface ExperimentCopy {
  title: string;
  question: string;
  summary: string;
  findings: string[];
  caveats: string[];
}

interface SectionHead {
  eyebrow: string;
  title: string;
  lead: string;
}

interface ChartText {
  title: string;
  desc: string;
}

export interface BenchCopy {
  hero: {
    eyebrow: string;
    title: string;
    lead: string;
    tiles: { label: string; detail: string; runs: string; note?: string }[];
    stripTitle: string;
    stripNote: string;
    stages: { te: string; encode: string; dit: string; decode: string; mux: string };
  };
  ticker: { label: string; items: { te: string; venc: string; dit: string; video: string; audio: string; mux: string; ditRef: string; teRef: string; image: string } };
  jump: { label: string; items: Record<'speed' | 'today' | 'dit' | 'references' | 'method' | 'experiments', string> };
  machines: Record<DeviceId, string> & { notRecorded: string; notRun: string; memory: Record<DeviceId, string> };
  steps: Record<StepKind, string>;
  pipelines: Record<'t2va' | 'fl2va' | 'ref2va' | 't2i' | 'i2i' | 'reverse-prompt', string>;
  schedules: Record<'pai8' | 'turbo8' | 'turbo4' | 'original' | 'img40' | 'img4', string>;
  inputs: Record<InputsKey, string>;
  scenes: Record<SceneKey, string>;
  sounds: Record<SceneKey, string>;
  reasons: Record<ReasonKey, string>;
  scopes: Record<ScopeKey, string>;
  experimentLabel: (id: ExperimentId) => string;
  status: { ok: string; failed: string; loadFailed: string; cancelled: string; refused: string; oom: string; invalid: string };
  common: {
    notMeasured: string;
    notReported: string;
    notEndToEnd: string;
    placementNotRecorded: string;
    notRun: string;
    reusedFrom: (run: string) => string;
    parallel: string;
    measuredToday: string;
    singleRun: string;
    production: string;
    chart: string;
    table: string;
    viewAs: string;
    seeData: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    soundPrefix: string;
    /** Shown wherever a clip carries sound: the web copies are loudness-normalized. */
    loudness: string;
    loudnessShort: string;
    runId: string;
    seed: string;
    date: string;
    loading: string;
    retry: string;
    loadError: string;
    framesShort: (n: number) => string;
  };
  takeaways: SectionHead & { cards: { title: string; body: string; statLabel: string; anchor: string }[] };
  speed: SectionHead & {
    imageTitle: string;
    imageLead: string;
    filters: {
      label: string;
      pipeline: string;
      precision: string;
      schedule: string;
      status: string;
      all: string;
      ok: string;
      failed: string;
      featured: string;
      allRows: (n: number) => string;
      showing: (shown: number, total: number) => string;
      /** "32 featured rows of 77" (featured view). */
      featuredShowing: (shown: number, total: number) => string;
      reset: string;
      empty: string;
    };
    downloads: { label: string; runs: string; steps: string; json: string; note: string };
    /** Edge cue on a table that scrolls sideways. */
    scrollCue: string;
    /** Per-step column headers on very wide screens. */
    stepCols: Record<'te' | 'encode' | 'aenc' | 'video' | 'audio' | 'mux' | 'vae' | 'compose', string>;
    cols: { run: string; pipeline: string; variant: string; steps: string; dit: string; compute: string; total: string; vram: string; status: string };
    colHints: { dit: string; compute: string; total: string; vram: string };
    /** Header sub-label for the DiT column's main number (its secondary line is labelled with cols.compute). */
    wall: string;
    vramParts: [string, string, string];
    details: string;
    hideDetails: string;
    detail: { steps: string; machine: string; time: string; compute: string; run: string; scope: string; notes: string; runTime: string; component: string; p50: string; seq: string };
    caption: string;
    failuresTitle: string;
    failuresLead: string;
    failureCols: { run: string; what: string; code: string; at: string; stopped: string };
    todayNote: string;
  };
  today: SectionHead & { refTitle: string; refBody: string; stillsTitle: string; stillsBody: string; clipAria: (scene: string) => string; total: string; stepsBreak: string };
  dit: SectionHead & {
    bars: ChartText & { wall: string; compute: string; note: string; cold: string; tags: Record<'sdpa' | 'adalnOff' | 'adalnOnline' | 'drop' | 'subblock' | 'exact', string> };
    media: ChartText & { tabs: Record<'t2vaFp8' | 't2vaPai8' | 'ref2vaFp8', string>; officialPrecision: string; audioNote: string };
    wipe: ChartText & { left: string; right: string; handle: string; reduced: string };
    findings: string;
  };
  references: SectionHead & {
    timelines: ChartText & { axis: string; unattributed: string; runs: Record<'ref448' | 'todayFl2va' | 'todayRef2va', string> };
    dumbbell: ChartText & { memNote: (alloc768: string, alloc448: string, seq768: string, seq448: string) => string; ref768: string; ref448: string; metrics: Record<Ref448Key, string> };
    noMedia: string;
  };
  method: SectionHead & {
    defs: { term: string; body: string }[];
    caveats: string[];
    exclusions: string;
    glossary: { title: string; lead: string; items: { term: string; body: string }[]; source: string };
    env: { title: string; lead: string; groups: { title: string; rows: { term: string; value: string }[] }[] };
  };
  experiments: SectionHead & { rows: (n: number) => string; findings: string; caveats: string; items: Record<ExpNum, ExperimentCopy> };
}

export const EXPERIMENT_LABEL = (today: string, prefix: string) => (id: ExperimentId) => (id === 'today' ? today : `${prefix}${id}`);

/*
 * One module per locale (copy/zh-hant.ts, copy/ja.ts, copy/en.ts): a page ships only its own language. The loader map
 * is typed Copy<…>, so a missing locale still fails `tsc`. Prerendering resolves the import on the server; on the client
 * the current locale starts loading as soon as this module evaluates, and hydration of the page waits for it (the
 * prerendered HTML stays on screen meanwhile).
 */
const LOADERS: Copy<() => Promise<{ default: BenchCopy }>> = {
  'zh-hant': () => import('./copy/zh-hant.ts'),
  ja: () => import('./copy/ja.ts'),
  en: () => import('./copy/en.ts'),
};

/*
 * Typographic glue, applied once per locale when the copy loads (so the sources stay readable): product names and
 * number–unit pairs are joined with no-break spaces, so "RTX 5080" or "37.8 s" never splits across lines. Eyebrows are
 * left alone because DecodeText scrambles every character except plain spaces.
 */
const NAMES = ['MiniMax H3', 'Qwen-Image 2.1', 'RTX 5080', 'RTX 3060', 'DGX Spark', 'PAI 8', 'Turbo 4', 'Turbo 8', 'The Courier', 'GGUF Q4_K_M'];
const NAME_RE = new RegExp(NAMES.map((name) => name.replace(/[.]/g, '\\.')).join('|'), 'g');
const UNIT_RE = /(\d) (s|ms|GiB|GB|MiB|MB|Hz)(?![\p{L}\p{N}_])/gu;

const glue = (text: string) => text.replace(NAME_RE, (name) => name.replace(' ', ' ')).replace(UNIT_RE, '$1 $2');

function typeset<T>(value: T, key = ''): T {
  if (typeof value === 'string') return (key === 'eyebrow' ? value : glue(value)) as T;
  if (typeof value === 'function') {
    const fn = value as (...args: never[]) => unknown;
    return ((...args: never[]) => typeset(fn(...args), key)) as T;
  }
  if (Array.isArray(value)) return value.map((item: unknown) => typeset(item, key)) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeset(v, k)])) as T;
  return value;
}

type TrackedPromise<T> = Promise<T> & { status?: 'pending' | 'fulfilled' | 'rejected'; value?: T; reason?: unknown };

const pending = new Map<Locale, TrackedPromise<BenchCopy>>();

/**
 * One promise per locale for the whole session. It carries React's `status`/`value` fields once settled, so `use()` reads
 * it synchronously after the first load (no re-suspending on later mounts).
 */
export function loadBenchCopy(locale: Locale): Promise<BenchCopy> {
  let promise = pending.get(locale);
  if (!promise) {
    const tracked: TrackedPromise<BenchCopy> = LOADERS[locale]().then((module) => typeset(module.default));
    tracked.status = 'pending';
    tracked.then(
      (value) => {
        tracked.status = 'fulfilled';
        tracked.value = value;
      },
      (reason: unknown) => {
        tracked.status = 'rejected';
        tracked.reason = reason;
      },
    );
    pending.set(locale, tracked);
    promise = tracked;
  }
  return promise;
}

/** This page's copy in the current locale. `use()` is called unconditionally so hook order never changes on replay. */
export function useBenchCopy(): BenchCopy {
  return use(loadBenchCopy(useLocale()));
}

if (typeof window !== 'undefined') {
  const locale = localeFromPath(window.location.pathname);
  if (locale) void loadBenchCopy(locale);
}
