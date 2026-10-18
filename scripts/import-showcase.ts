// Showcase importer: turns real Phasyn Studio results into web media and a typed data file.
//
//   node scripts/import-showcase.ts [--source <dir>] [--seed <file>] [--no-seed] [--force] [--dry-run]
//
// Reads the seed entries (scripts/showcase-seed.json, item.json-equivalent records of the 2026-10-18 studio/gen runs), then
// every <source>/{farm-*,rec-*}/item.json (default source: <project>/studio/out/final/showcase) and every
// <films>/<slug>/item.json (default: <project>/studio/out/final/films; kind "film", with film.mp4 and poster.jpg). A folder
// holds item.json plus still.png and/or clip.mp4, prompt.txt and optionally contact.jpg. A folder item replaces a seed with
// the same slug. Items not graded "hero" or "usable" are skipped, as is anything that fails validation or the privacy check.
//
// Output (this script owns these paths and removes stale files in them):
//   public/images/showcase/items/<slug>-<w>.webp           stills: native width (max 1152), 768, 384 — never upscaled
//   public/images/showcase/items/<slug>-poster-<w>.webp    clip posters from a representative frame (posterAt, default 40 %)
//   public/media/showcase/<slug>.mp4                       H.264 + AAC, +faststart (review media: git-ignored; production
//                                                          serves it from VITE_MEDIA_BASE). Video is stream-copied when it
//                                                          already is H.264/yuv420p, else re-encoded at CRF 20 (native size).
//                                                          Sound is loudness-normalised for the web (lead rule): two-pass
//                                                          loudnorm I=-16 TP=-1.5 LRA=11, 48 kHz, AAC 192k. Originals are
//                                                          never touched.
//   src/features/showcase/items.gen.ts                     typed SHOWCASE_ITEMS (do not edit by hand)

import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import type { MachineKey, ShowcaseCategory, ShowcaseImage, ShowcaseItem, ShowcaseItemJson, ShowcaseKind, ShowcaseReference, ShowcaseStep } from '../src/features/showcase/types.ts';

const SITE = process.cwd();
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

/** The project root is the nearest ancestor with a `studio/` folder (site/ → .., work/wt-x → ../..). */
function projectRoot(): string {
  let dir = SITE;
  for (let i = 0; i < 6; i += 1) {
    if (existsSync(join(dir, 'studio'))) return dir;
    dir = dirname(dir);
  }
  throw new Error('import-showcase: no studio/ folder above the site; pass --source and --seed explicitly.');
}

const ROOT = projectRoot();
const SOURCE = resolve(option('--source') ?? join(ROOT, 'studio/out/final/showcase'));
const FILMS = resolve(option('--films') ?? join(ROOT, 'studio/out/final/films'));
const SEED = resolve(option('--seed') ?? join(SITE, 'scripts/showcase-seed.json'));
const DRY = flag('--dry-run');
const FORCE = flag('--force');
const IMAGES = join(SITE, 'public/images/showcase/items');
const MEDIA = join(SITE, 'public/media/showcase');
const OUT = join(SITE, 'src/features/showcase/items.gen.ts');
const CACHE = join(SITE, 'node_modules/.cache/import-showcase.json');
const FFMPEG = process.env.FFMPEG ?? (existsSync('/opt/homebrew/bin/ffmpeg') ? '/opt/homebrew/bin/ffmpeg' : 'ffmpeg');
const FFPROBE = process.env.FFPROBE ?? (existsSync('/opt/homebrew/bin/ffprobe') ? '/opt/homebrew/bin/ffprobe' : 'ffprobe');
// ffmpeg builds without libwebp are common (Homebrew's is one): frames go through a temporary PNG into cwebp.
const CWEBP = process.env.CWEBP ?? (existsSync('/opt/homebrew/bin/cwebp') ? '/opt/homebrew/bin/cwebp' : 'cwebp');
const TEMP = mkdtempSync(join(tmpdir(), 'import-showcase-'));

const KINDS: readonly ShowcaseKind[] = ['film', 'still', 'fl2va', 'ref2va', 'multishot', 'roundtrip'];
const CATEGORIES: readonly ShowcaseCategory[] = ['film', 'image', 'video', 'character', 'multishot'];
const LOCALE_KEYS = ['zh-hant', 'ja', 'en'] as const;
const STILL_WIDTHS = [1152, 768, 384];
const POSTER_WIDTHS = [768, 384];
const LOUDNORM = 'I=-16:TP=-1.5:LRA=11';

/** Public text must never carry LAN addresses, absolute paths or account names (BRIEF §5). */
const PRIVATE = [/\b(?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/, /\/(?:home|mnt|Users)\//, /dennysora-(?:pc|dgx)/i, /DennySORA-DGX/];

interface SeedEntry extends ShowcaseItemJson {
  files: { still?: string; clip?: string; prompt: string; contact?: string; reference?: string };
}

interface Candidate {
  json: ShowcaseItemJson;
  origin: string;
  /** The item folder (absent for seeds). */
  folder?: string;
  still?: string;
  clip?: string;
  /** A loudness-normalised web copy made by the producer (web.mp4); used instead of normalising again. */
  web?: string;
  /** A supplied poster (films: poster.jpg); otherwise a frame is taken from the clip. */
  poster?: string;
  prompt?: string;
  contact?: string;
  referenceFile?: string;
}

interface CacheEntry {
  source: string;
  size: number;
  mtimeMs: number;
  params: string;
  rawLufs?: number;
}
type Cache = Record<string, CacheEntry>;

const problems: string[] = [];
const skipped: string[] = [];
const produced = new Set<string>();
const cache: Cache = existsSync(CACHE) ? (JSON.parse(readFileSync(CACHE, 'utf8')) as Cache) : {};

function run(command: string, argv: string[]): string {
  const result = spawnSync(command, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.status !== 0) throw new Error(`${basename(command)} failed: ${result.stderr.trim().split('\n').slice(-3).join(' | ')}`);
  return `${result.stdout}${result.stderr}`;
}

function probe(file: string): { streams: Record<string, string | number>[]; format: Record<string, string> } {
  return JSON.parse(run(FFPROBE, ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file])) as {
    streams: Record<string, string | number>[];
    format: Record<string, string>;
  };
}

/** Skip work whose output is newer than an unchanged source with the same parameters. */
function fresh(output: string, source: string, params: string): boolean {
  if (FORCE || !existsSync(output)) return false;
  const entry = cache[output];
  const info = statSync(source);
  return Boolean(entry && entry.source === source && entry.size === info.size && entry.mtimeMs === info.mtimeMs && entry.params === params);
}

function remember(output: string, source: string, params: string) {
  const info = statSync(source);
  cache[output] = { source, size: info.size, mtimeMs: info.mtimeMs, params };
}

function sitePath(file: string): string {
  return `/${file.slice(join(SITE, 'public').length + 1).split('\\').join('/')}`;
}

/** WebP variants of an image (native width capped at the first target; smaller targets only below native). */
function webpSet(source: string, stem: string, widths: readonly number[], seekSeconds?: number): ShowcaseImage {
  const stream = probe(source).streams.find((s) => s.codec_type === 'video');
  const nativeWidth = Number(stream?.width);
  const nativeHeight = Number(stream?.height);
  if (!nativeWidth || !nativeHeight) throw new Error(`cannot read the size of ${source}`);
  const top = Math.min(nativeWidth, widths[0] ?? nativeWidth);
  const targets = [top, ...widths.filter((w) => w < top)];
  const variants = targets.map((width) => {
    const height = Math.round((nativeHeight * width) / nativeWidth / 2) * 2;
    const output = join(IMAGES, `${stem}-${width}.webp`);
    const params = `w${width};t${seekSeconds ?? ''}`;
    produced.add(output);
    if (!DRY && !fresh(output, source, params)) {
      const frame = join(TEMP, `${stem}-${width}.png`);
      const input = seekSeconds === undefined ? ['-i', source] : ['-ss', seekSeconds.toFixed(3), '-i', source];
      const scale = width === nativeWidth ? [] : ['-vf', `scale=${width}:${height}:flags=lanczos`];
      run(FFMPEG, ['-y', '-v', 'error', ...input, '-frames:v', '1', ...scale, '-update', '1', frame]);
      run(CWEBP, ['-quiet', '-q', '86', '-m', '6', '-sharp_yuv', '-metadata', 'none', frame, '-o', output]);
      rmSync(frame, { force: true });
      remember(output, source, params);
    }
    return { src: sitePath(output), width, height };
  });
  const [largest] = variants;
  if (!largest) throw new Error(`no variants for ${source}`);
  return {
    src: largest.src,
    srcSet: variants.map((v) => `${v.src} ${v.width}w`).join(', '),
    width: largest.width,
    height: largest.height,
  };
}

/** First loudnorm pass: the raw clip's measured loudness (EBU R128), used for the linear second pass. */
function measure(file: string): Record<string, string> | undefined {
  const log = run(FFMPEG, ['-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', `loudnorm=${LOUDNORM}:print_format=json`, '-f', 'null', '-']);
  const json = /\{[^{}]*"input_i"[^{}]*\}/.exec(log)?.[0];
  return json ? (JSON.parse(json) as Record<string, string>) : undefined;
}

/**
 * Web copy of a clip: H.264 + AAC with the index up front; native size, never upscaled. Sound is loudness-normalised
 * (two-pass loudnorm to -16 LUFS, -1.5 dBTP, 48 kHz AAC 192k). Returns the raw integrated loudness.
 */
interface WebClip {
  path: string;
  rawLufs?: number;
  rawSampleRate?: number;
}

function rawRate(raw: string): { rawSampleRate?: number } {
  const rate = Number(probe(raw).streams.find((s) => s.codec_type === 'audio')?.sample_rate);
  return Number.isFinite(rate) && rate > 0 ? { rawSampleRate: rate } : {};
}

function webClip(source: string, slug: string, ready?: string): WebClip {
  if (ready) return readyClip(source, ready, slug);
  const info = probe(source);
  const video = info.streams.find((s) => s.codec_type === 'video');
  const audio = info.streams.find((s) => s.codec_type === 'audio');
  if (!video) throw new Error(`${source} has no video stream`);
  const videoOk = video.codec_name === 'h264' && video.pix_fmt === 'yuv420p';
  const output = join(MEDIA, `${slug}.mp4`);
  const params = `v${videoOk ? 'copy' : 'crf20'};a${audio ? LOUDNORM : 'none'}`;
  produced.add(output);
  const cached = cache[output];
  let rawLufs = cached?.rawLufs;
  if (!DRY && !fresh(output, source, params)) {
    const level = audio ? measure(source) : undefined;
    rawLufs = level ? Number(level.input_i) : undefined;
    const videoArgs = videoOk ? ['-c:v', 'copy'] : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-profile:v', 'high'];
    const second = level
      ? `loudnorm=${LOUDNORM}:measured_I=${level.input_i}:measured_TP=${level.input_tp}:measured_LRA=${level.input_lra}:measured_thresh=${level.input_thresh}:offset=${level.target_offset}:linear=true`
      : `loudnorm=${LOUDNORM}`;
    const audioArgs = audio ? ['-af', `${second},aresample=48000`, '-c:a', 'aac', '-b:a', '192k'] : ['-an'];
    run(FFMPEG, ['-y', '-v', 'error', '-i', source, '-map', '0:v:0', ...(audio ? ['-map', '0:a:0'] : []), ...videoArgs, ...audioArgs, '-movflags', '+faststart', output]);
    remember(output, source, params);
    if (rawLufs !== undefined && Number.isFinite(rawLufs)) (cache[output] as CacheEntry).rawLufs = rawLufs;
  }
  return { path: `showcase/${slug}.mp4`, ...(rawLufs !== undefined && Number.isFinite(rawLufs) ? { rawLufs: Math.round(rawLufs * 10) / 10 } : {}), ...rawRate(source) };
}

/**
 * A producer's web copy (web.mp4, already two-pass loudnorm -16 LUFS / 48 kHz AAC): checked, then remuxed with +faststart
 * (no re-encode). The raw clip is still measured, for the page's note on raw loudness.
 */
function readyClip(raw: string, ready: string, slug: string): WebClip {
  const info = probe(ready);
  const video = info.streams.find((s) => s.codec_type === 'video');
  const audio = info.streams.find((s) => s.codec_type === 'audio');
  if (video?.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p') return webClip(raw, slug);
  if (audio && audio.codec_name !== 'aac') return webClip(raw, slug);
  const output = join(MEDIA, `${slug}.mp4`);
  const params = 'ready-web-copy';
  produced.add(output);
  let rawLufs = cache[output]?.rawLufs;
  if (!DRY && !fresh(output, ready, params)) {
    const level = audio && raw !== ready ? measure(raw) : undefined;
    rawLufs = level ? Number(level.input_i) : undefined;
    run(FFMPEG, ['-y', '-v', 'error', '-i', ready, '-map', '0', '-c', 'copy', '-movflags', '+faststart', output]);
    remember(output, ready, params);
    if (rawLufs !== undefined && Number.isFinite(rawLufs)) (cache[output] as CacheEntry).rawLufs = rawLufs;
  }
  return { path: `showcase/${slug}.mp4`, ...(rawLufs !== undefined && Number.isFinite(rawLufs) ? { rawLufs: Math.round(rawLufs * 10) / 10 } : {}), ...rawRate(raw) };
}

function machines(text: string): MachineKey[] {
  const keys = text
    .split(/\s*(?:\/|\+|,|&|\band\b)\s*/i)
    .filter(Boolean)
    .map((part): MachineKey => (/gb10|dgx|spark/i.test(part) ? 'gb10' : /5080/.test(part) ? 'rtx5080' : /3060/.test(part) ? 'rtx3060' : /\bcpu\b/i.test(part) ? 'cpu' : 'unknown'));
  const unique = [...new Set(keys)];
  return unique.length ? unique : ['unknown'];
}

function isPrivate(text: string): boolean {
  return PRIVATE.some((pattern) => pattern.test(text));
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function categoryOf(json: ShowcaseItemJson, hasClip: boolean): ShowcaseCategory {
  if (json.category && CATEGORIES.includes(json.category)) return json.category;
  if (json.kind === 'film') return 'film';
  if (json.kind === 'still') return 'image';
  if (json.kind === 'fl2va') return 'video';
  if (json.kind === 'ref2va') return 'character';
  if (json.kind === 'multishot') return 'multishot';
  return hasClip ? 'video' : 'image';
}

function loadCandidates(): Candidate[] {
  const bySlug = new Map<string, Candidate>();
  if (!flag('--no-seed') && existsSync(SEED)) {
    const seed = JSON.parse(readFileSync(SEED, 'utf8')) as { items: SeedEntry[] };
    for (const entry of seed.items) {
      const { files, ...json } = entry;
      const at = (path?: string) => (path ? join(ROOT, path) : undefined);
      bySlug.set(json.slug, {
        json,
        origin: `seed:${json.slug}`,
        ...(files.still ? { still: at(files.still) } : {}),
        ...(files.clip ? { clip: at(files.clip) } : {}),
        ...(files.prompt ? { prompt: at(files.prompt) } : {}),
        ...(files.contact ? { contact: at(files.contact) } : {}),
        ...(files.reference ? { referenceFile: at(files.reference) } : {}),
      } as Candidate);
    }
  }
  if (existsSync(SOURCE)) {
    const folders = readdirSync(SOURCE)
      .filter((name) => /^(farm|rec)-/.test(name) && existsSync(join(SOURCE, name, 'item.json')))
      .sort();
    for (const name of folders) {
      const folder = join(SOURCE, name);
      let json: ShowcaseItemJson;
      try {
        json = JSON.parse(readFileSync(join(folder, 'item.json'), 'utf8')) as ShowcaseItemJson;
      } catch (error) {
        skipped.push(`${name}: item.json is not valid JSON (${(error as Error).message})`);
        continue;
      }
      const file = (rel: string) => (existsSync(join(folder, rel)) ? join(folder, rel) : undefined);
      const ref = json.reference;
      const refName = typeof ref === 'string' ? ref : ref?.file;
      const candidate: Candidate = { json, origin: name, folder };
      const still = file('still.png');
      const clip = file('clip.mp4');
      const web = file('web.mp4');
      if (web) candidate.web = web;
      const prompt = file('prompt.txt');
      const contact = file('contact.jpg');
      const referenceFile = refName ? (file(refName) ?? (existsSync(join(ROOT, refName)) ? join(ROOT, refName) : undefined)) : undefined;
      if (still) candidate.still = still;
      if (clip) candidate.clip = clip;
      if (prompt) candidate.prompt = prompt;
      if (contact) candidate.contact = contact;
      if (referenceFile) candidate.referenceFile = referenceFile;
      if (bySlug.has(json.slug)) console.log(`import-showcase: ${name} replaces the seed entry "${json.slug}"`);
      bySlug.set(json.slug, candidate);
    }
  } else {
    console.log(`import-showcase: no item folders yet (${SOURCE})`);
  }
  if (existsSync(FILMS)) {
    for (const name of readdirSync(FILMS).sort()) {
      const folder = join(FILMS, name);
      if (!existsSync(join(folder, 'item.json'))) continue;
      let json: ShowcaseItemJson;
      try {
        json = JSON.parse(readFileSync(join(folder, 'item.json'), 'utf8')) as ShowcaseItemJson;
      } catch (error) {
        skipped.push(`films/${name}: item.json is not valid JSON (${(error as Error).message})`);
        continue;
      }
      const file = (rel: string) => (existsSync(join(folder, rel)) ? join(folder, rel) : undefined);
      const candidate: Candidate = { json: { ...json, kind: json.kind ?? 'film' }, origin: `films/${name}`, folder };
      const clip = file('film.mp4') ?? file('clip.mp4');
      const web = file('web.mp4');
      if (web) candidate.web = web;
      const poster = file('poster.jpg') ?? file('poster.png') ?? file('poster.webp');
      const prompt = file('prompt.txt');
      const contact = file('contact.jpg');
      if (clip) candidate.clip = clip;
      if (poster) candidate.poster = poster;
      if (prompt) candidate.prompt = prompt;
      if (contact) candidate.contact = contact;
      if (bySlug.has(json.slug)) console.log(`import-showcase: films/${name} replaces "${json.slug}"`);
      bySlug.set(json.slug, candidate);
    }
  }
  return [...bySlug.values()];
}

function build(candidate: Candidate, slugs: Set<string>, sources: Map<string, string>): ShowcaseItem | undefined {
  const { json, origin } = candidate;
  const fail = (reason: string) => {
    skipped.push(`${origin}: ${reason}`);
    return undefined;
  };
  if (json.grade !== 'hero' && json.grade !== 'usable') return fail(`grade "${String(json.grade)}" (only hero/usable are published)`);
  if (typeof json.slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(json.slug)) return fail('slug must be lower-case letters, digits and hyphens');
  if (!KINDS.includes(json.kind)) return fail(`unknown kind "${String(json.kind)}"`);
  for (const key of ['pipeline', 'runId', 'model', 'ditEngine', 'createdAt'] as const) {
    if (typeof json[key] !== 'string' || !json[key]) return fail(`missing ${key}`);
  }
  if (!Number.isInteger(json.seed)) return fail('seed must be an integer');
  if (!num(json.width) || !num(json.height)) return fail('missing width/height');
  if (!Array.isArray(json.steps)) return fail('steps must be an array');
  // A film is cut from many runs: its prompt file (the shot prompts) is optional; every other card shows its prompt.
  if (!candidate.prompt && json.kind !== 'film') return fail('no prompt.txt (every card shows its prompt)');
  if (!candidate.still && !candidate.clip) return fail(json.kind === 'film' ? 'no film.mp4' : 'no still.png or clip.mp4');

  const title = {} as Record<(typeof LOCALE_KEYS)[number], string>;
  for (const locale of LOCALE_KEYS) {
    const value = json.title?.[locale];
    if (typeof value === 'string' && value.trim()) title[locale] = value.trim();
    else if (typeof json.title?.en === 'string' && json.title.en.trim()) {
      title[locale] = json.title.en.trim();
      problems.push(`${origin}: title.${locale} missing, using the English title`);
    } else return fail('missing title');
  }
  const prompt = candidate.prompt ? readFileSync(candidate.prompt, 'utf8').trim() : '';
  if (!prompt && json.kind !== 'film') return fail('prompt.txt is empty');
  for (const text of [prompt, ...Object.values(title), json.pipeline, json.ditEngine, json.model]) {
    if (isPrivate(text)) return fail('private data (LAN address, absolute path or account name) in public text');
  }
  if (json.notes && isPrivate(json.notes)) problems.push(`${origin}: notes mention private data (kept out of the output)`);

  const steps: ShowcaseStep[] = json.steps.map((step) => ({
    id: String(step.id),
    label: String(step.label ?? step.id),
    machines: machines(String(step.machine ?? '')),
    seconds: num(step.seconds),
    approx: Boolean(step.approx),
    ...(typeof step.component === 'string' && step.component && !isPrivate(step.component) ? { component: step.component } : {}),
  }));
  for (const step of steps) if (step.machines.includes('unknown')) problems.push(`${origin}: step "${step.id}" has no recognised machine (shown as "placement not recorded")`);

  try {
    let image: ShowcaseImage;
    let clip: WebClip | undefined;
    if (candidate.clip) {
      clip = webClip(candidate.clip, json.slug, candidate.web);
      const length = num(json.seconds) ?? Number(probe(candidate.clip).format.duration);
      const at = num(json.posterAt) ?? Math.max(0, length * 0.4);
      const posterWidths = json.kind === 'film' ? [1920, 1280, 768] : POSTER_WIDTHS;
      image = candidate.poster ? webpSet(candidate.poster, `${json.slug}-poster`, posterWidths) : webpSet(candidate.clip, `${json.slug}-poster`, posterWidths, at);
    } else {
      image = webpSet(candidate.still as string, json.slug, STILL_WIDTHS);
    }
    const contact = candidate.contact ? webpSet(candidate.contact, `${json.slug}-contact`, [1152]) : undefined;

    let reference: ShowcaseReference | null = null;
    const ref = json.reference;
    if (ref) {
      const slug = typeof ref === 'string' ? ref : ref.slug;
      const label = typeof ref === 'object' ? ref.label : undefined;
      reference = {};
      if (slug && slugs.has(slug)) reference.slug = slug;
      // A reference file that is another result's own source links to that result instead of a copy.
      const owner = candidate.referenceFile ? sources.get(resolve(candidate.referenceFile)) : undefined;
      if (owner && owner !== json.slug) reference.slug = owner;
      else if (candidate.referenceFile) reference.image = webpSet(candidate.referenceFile, `${json.slug}-ref`, [768, 384]);
      if (label && !isPrivate(label)) reference.label = label;
      if (!reference.slug && !reference.image && !reference.label) {
        problems.push(`${origin}: reference "${typeof ref === 'string' ? ref : JSON.stringify(ref)}" matched no item or file`);
        reference = null;
      }
    }

    return {
      slug: json.slug,
      title,
      kind: json.kind,
      category: categoryOf(json, Boolean(candidate.clip)),
      pipeline: json.pipeline,
      runId: json.runId,
      outputId: typeof json.outputId === 'string' && json.outputId ? json.outputId : null,
      seed: json.seed,
      model: json.model,
      ditEngine: json.ditEngine,
      width: json.width,
      height: json.height,
      frames: num(json.frames),
      fps: num(json.fps),
      seconds: num(json.seconds),
      endToEndSeconds: num(json.endToEndSeconds),
      endToEndApprox: Boolean(json.endToEndApprox),
      steps,
      reference,
      grade: json.grade,
      createdAt: json.createdAt,
      prompt,
      media: {
        image,
        ...(clip ? { clip: clip.path, ...(clip.rawLufs !== undefined ? { rawLufs: clip.rawLufs } : {}), ...(clip.rawSampleRate ? { rawSampleRate: clip.rawSampleRate } : {}) } : {}),
        ...(contact ? { contact } : {}),
      },
    };
  } catch (error) {
    return fail((error as Error).message);
  }
}

function removeStale(dir: string) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (!produced.has(path) && statSync(path).isFile()) {
      if (!DRY) rmSync(path);
      console.log(`import-showcase: removed stale ${sitePath(path)}`);
    }
  }
}

function folderBytes(dir: string): number {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((sum, name) => sum + statSync(join(dir, name)).size, 0);
}

// ---------------------------------------------------------------------------------------------------------------------

if (!DRY) {
  mkdirSync(IMAGES, { recursive: true });
  mkdirSync(MEDIA, { recursive: true });
  mkdirSync(dirname(CACHE), { recursive: true });
}

const candidates = loadCandidates();
const slugs = new Set(candidates.map((c) => c.json.slug));
/** Source file → slug, so a reference given as a path can link to the result made from it. */
const sources = new Map<string, string>();
for (const c of candidates) for (const file of [c.still, c.clip]) if (file) sources.set(resolve(file), c.json.slug);
const items: ShowcaseItem[] = [];
for (const candidate of candidates) {
  const item = build(candidate, slugs, sources);
  if (item) {
    items.push(item);
    console.log(`import-showcase: ${item.slug} (${item.kind}, ${item.grade}${item.media.rawLufs !== undefined ? `, raw ${item.media.rawLufs} LUFS → -16` : ''})`);
  }
}
// A reference must point at a published item.
for (const item of items) if (item.reference?.slug && !items.some((other) => other.slug === item.reference?.slug)) delete item.reference.slug;

// Seeds keep their curated order; folder items follow, hero first, then in production order (a shot series stays in order
// and new results append instead of reshuffling the top).
const seedCount = candidates.filter((c) => c.origin.startsWith('seed:')).length;
const seeded = items.filter((item) => candidates.find((c) => c.json.slug === item.slug)?.origin.startsWith('seed:'));
const farmed = items
  .filter((item) => !seeded.includes(item))
  .sort((a, b) => (a.grade === b.grade ? a.createdAt.localeCompare(b.createdAt) : a.grade === 'hero' ? -1 : 1));
// Films lead (the owner's #1 asset), then the curated seeds, then new results.
const ordered = [...farmed.filter((item) => item.kind === 'film'), ...seeded, ...farmed.filter((item) => item.kind !== 'film')];

const notes = new Map(candidates.map((c) => [c.json.slug, c.json.notes && !isPrivate(c.json.notes) ? c.json.notes : '']));
const body = ordered
  .map((item) => {
    const note = notes.get(item.slug);
    const comment = note ? `  // ${item.slug}: ${note.replace(/\s+/g, ' ')}\n` : '';
    return `${comment}  ${JSON.stringify(item, null, 2).split('\n').join('\n  ')},`;
  })
  .join('\n');
const source = `// Generated by scripts/import-showcase.ts. Do not edit by hand: change scripts/showcase-seed.json or the item folders in
// studio/out/final/showcase, then run \`node scripts/import-showcase.ts\` from the site root.
import type { ShowcaseItem } from './types.ts';

export const SHOWCASE_ITEMS: readonly ShowcaseItem[] = [
${body}
];
`;

if (!DRY) {
  writeFileSync(OUT, source);
  writeFileSync(CACHE, JSON.stringify(cache, null, 1));
}
removeStale(IMAGES);
removeStale(MEDIA);
rmSync(TEMP, { recursive: true, force: true });

const megabytes = (folderBytes(IMAGES) + folderBytes(MEDIA)) / 1024 / 1024;
console.log(`import-showcase: ${ordered.length} items (${seedCount} seed entries read), ${megabytes.toFixed(1)} MB of showcase media${DRY ? ' (dry run)' : ''}`);
if (megabytes > 25) console.warn('import-showcase: showcase media is over 25 MB; check the clips before publishing.');
for (const line of problems) console.warn(`import-showcase: warning: ${line}`);
for (const line of skipped) console.warn(`import-showcase: skipped ${line}`);
