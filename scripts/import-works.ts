// Works importer: turns delivered Showcase masters into web media, posters and the typed data file Showcase and Home read.
//
//   node scripts/import-works.ts [--source <dir>] [--force] [--dry-run]
//
// <source> (--source or $WORKS_SOURCE; required) holds, per work,
// <slug>.mp4 (the 2× upscaled master, 2560×1472 or 1472×2560, 24 fps, with sound) and <slug>.json (title {zh-hant, en,
// ja?}, category or theme, features[], run_id, seed, seconds, poster_at, frames_source, frames_delivered, basecheck {pass},
// optional featured rank). Validation lives in scripts/works-validate.ts: a work whose JSON is bad, whose frame count
// changed (frames_source ≠ frames_delivered, or ffprobe counts something else) or whose basecheck did not pass is skipped
// with its reason. Only the validated fields reach the site (the run id shortened to 8 characters); notes, paths and other
// ids never do.
//
// Output (this script owns these paths and removes stale files in them):
//   public/media/works/<slug>.hd.mp4     the master with +faststart: video stream-copied when it is H.264 High yuv420p
//                                        (else libx264 CRF 18), sound loudness-normalised (AAC 48 kHz 192k)
//   public/media/works/<slug>.web.mp4    1280 on the long side (lanczos), libx264 CRF 19 preset slow, High, yuv420p,
//                                        +faststart, AAC 48 kHz 192k. public/media is git-ignored review media: production
//                                        serves works/<slug>.*.mp4 from VITE_MEDIA_BASE (upload them there).
//   public/images/works/<slug>-poster-<n>.webp   frame at poster_at; n = 1920/1280/640 on the long side
//   src/site/works.gen.ts                typed WORKS (do not edit by hand)
// Sound in both copies: two-pass loudnorm to −16 LUFS integrated, −1.5 dBTP, LRA 11 (one measurement per master).
// WebP: cwebp ($CWEBP or on PATH), else Pillow through `uv run --offline --with pillow`.

import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { WORK_CATEGORIES, type Work, type WorkPoster } from '../src/site/works.ts';
import { checkMaster, parseRate, validateWorkJson, type ValidatedWork } from './works-validate.ts';

const SITE = process.cwd();
const args = process.argv.slice(2);
const flag = (name: string) => args.includes(name);
const option = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};

const SOURCE_ARG = option('--source') ?? process.env.WORKS_SOURCE;
if (!SOURCE_ARG) {
  console.error('import-works: pass --source <dir> or set WORKS_SOURCE.');
  process.exit(2);
}
const SOURCE = resolve(SOURCE_ARG);
const DRY = flag('--dry-run');
const FORCE = flag('--force');
const MEDIA = join(SITE, 'public/media/works');
const IMAGES = join(SITE, 'public/images/works');
const OUT = join(SITE, 'src/site/works.gen.ts');
const CACHE = join(SITE, 'node_modules/.cache/import-works.json');
const brew = (tool: string) => (existsSync(`/opt/homebrew/bin/${tool}`) ? `/opt/homebrew/bin/${tool}` : tool);
const FFMPEG = process.env.FFMPEG ?? brew('ffmpeg');
const FFPROBE = process.env.FFPROBE ?? brew('ffprobe');
const CWEBP = process.env.CWEBP ?? brew('cwebp');
const POSTER_SIZES = [1920, 1280, 640];
const WEB_LONG_SIDE = 1280;
const LOUDNORM = 'I=-16:TP=-1.5:LRA=11';
/** Generated text must never carry these (paths of this machine, account names, LAN addresses). */
const PRIVATE_OUTPUT = [
  /\/(?:home|mnt|Users|tmp)\//,
  /dennysora/i,
  /\b(?:192\.168|10\.\d{1,3}|172\.(?:1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/,
];

interface CacheEntry {
  source: string;
  size: number;
  mtimeMs: number;
  params: string;
}
const cache: Record<string, CacheEntry> = existsSync(CACHE)
  ? (JSON.parse(readFileSync(CACHE, 'utf8')) as Record<string, CacheEntry>)
  : {};
const produced = new Set<string>();

function run(command: string, argv: string[]): string {
  const result = spawnSync(command, argv, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw new Error(`${basename(command)}: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(`${basename(command)} failed: ${result.stderr.trim().split('\n').slice(-3).join(' | ')}`);
  return `${result.stdout}${result.stderr}`;
}

const available = (command: string, argv: string[]) => {
  const result = spawnSync(command, argv, { encoding: 'utf8' });
  return !result.error && result.status === 0;
};

function fresh(output: string, source: string, params: string): boolean {
  if (FORCE || !existsSync(output)) return false;
  const entry = cache[output];
  const info = statSync(source);
  return Boolean(
    entry &&
    entry.source === source &&
    entry.size === info.size &&
    entry.mtimeMs === info.mtimeMs &&
    entry.params === params,
  );
}

function remember(output: string, source: string, params: string) {
  const info = statSync(source);
  cache[output] = { source, size: info.size, mtimeMs: info.mtimeMs, params };
}

type Stream = Record<string, string | number | undefined>;

function probe(file: string): { video: Stream | undefined; audio: Stream | undefined; frames: number } {
  const json = JSON.parse(run(FFPROBE, ['-v', 'error', '-count_frames', '-show_streams', '-of', 'json', file])) as {
    streams: Stream[];
  };
  const video = json.streams.find((s) => s.codec_type === 'video');
  return {
    video,
    audio: json.streams.find((s) => s.codec_type === 'audio'),
    frames: Number(video?.nb_read_frames ?? 0),
  };
}

interface Loudness {
  input_i: string;
  input_tp: string;
  input_lra: string;
  input_thresh: string;
  target_offset: string;
}

/** First loudnorm pass (EBU R128 measurement of the master's sound). */
function measure(file: string): Loudness {
  const log = run(FFMPEG, [
    '-hide_banner',
    '-nostats',
    '-i',
    file,
    '-map',
    '0:a:0',
    '-af',
    `loudnorm=${LOUDNORM}:print_format=json`,
    '-f',
    'null',
    '-',
  ]);
  const json = /\{[^{}]*"input_i"[^{}]*\}/.exec(log)?.[0];
  if (!json) throw new Error(`${file}: loudnorm printed no measurement`);
  const parsed = JSON.parse(json) as Partial<Record<keyof Loudness, unknown>>;
  const reading = (key: keyof Loudness): string => {
    const value = parsed[key];
    if (typeof value !== 'string' || !Number.isFinite(Number(value)))
      throw new Error(`${file}: loudnorm reading ${key} is unusable (silent track?)`);
    return value;
  };
  return {
    input_i: reading('input_i'),
    input_tp: reading('input_tp'),
    input_lra: reading('input_lra'),
    input_thresh: reading('input_thresh'),
    target_offset: reading('target_offset'),
  };
}

const secondPass = (level: Loudness) =>
  `loudnorm=${LOUDNORM}:measured_I=${level.input_i}:measured_TP=${level.input_tp}:measured_LRA=${level.input_lra}:measured_thresh=${level.input_thresh}:offset=${level.target_offset}:linear=true,aresample=48000`;

function encode(source: string, output: string, params: string, videoArgs: string[], audioArgs: string[]) {
  produced.add(output);
  if (DRY || fresh(output, source, params)) return;
  run(FFMPEG, [
    '-y',
    '-v',
    'error',
    '-i',
    source,
    '-map',
    '0:v:0',
    '-map',
    '0:a:0',
    ...videoArgs,
    ...audioArgs,
    '-map_metadata',
    '-1',
    '-movflags',
    '+faststart',
    output,
  ]);
  remember(output, source, params);
}

let webpTool: 'cwebp' | 'pillow' | undefined;
function toWebp(png: string, output: string) {
  webpTool ??= available(CWEBP, ['-version']) ? 'cwebp' : 'pillow';
  if (webpTool === 'cwebp')
    run(CWEBP, ['-quiet', '-q', '86', '-m', '6', '-sharp_yuv', '-metadata', 'none', png, '-o', output]);
  else
    run('uv', [
      'run',
      '--offline',
      '--no-project',
      '--with',
      'pillow',
      'python',
      '-I',
      '-c',
      "import sys; from PIL import Image; Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2], 'WEBP', quality=86, method=6)",
      png,
      output,
    ]);
}

function posters(work: ValidatedWork, source: string, width: number, height: number, temp: string): WorkPoster {
  const landscape = width >= height;
  const variants = POSTER_SIZES.map((long) => {
    const w = landscape ? long : Math.round((long * width) / height / 2) * 2;
    const h = landscape ? Math.round((long * height) / width / 2) * 2 : long;
    const output = join(IMAGES, `${work.slug}-poster-${String(long)}.webp`);
    const params = `${String(w)}x${String(h)}@${String(work.posterAt)}`;
    produced.add(output);
    if (!DRY && !fresh(output, source, params)) {
      const frame = join(temp, `${work.slug}-${String(long)}.png`);
      run(FFMPEG, [
        '-y',
        '-v',
        'error',
        '-ss',
        work.posterAt.toFixed(3),
        '-i',
        source,
        '-frames:v',
        '1',
        '-vf',
        `scale=${String(w)}:${String(h)}:flags=lanczos`,
        '-update',
        '1',
        frame,
      ]);
      toWebp(frame, output);
      rmSync(frame, { force: true });
      remember(output, source, params);
    }
    return { src: `/images/works/${basename(output)}`, width: w, height: h };
  });
  const [largest] = variants;
  if (!largest) throw new Error('no poster sizes');
  return {
    src: largest.src,
    srcSet: variants.map((v) => `${v.src} ${String(v.width)}w`).join(', '),
    width: largest.width,
    height: largest.height,
  };
}

interface Row {
  slug: string;
  status: 'ok' | 'skipped';
  detail: string;
}

function importOne(slug: string, temp: string, rows: Row[]): Work | null {
  const skip = (detail: string): null => {
    rows.push({ slug, status: 'skipped', detail });
    return null;
  };
  const master = join(SOURCE, `${slug}.mp4`);
  if (!existsSync(master)) return skip(`no ${slug}.mp4`);
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(join(SOURCE, `${slug}.json`), 'utf8'));
  } catch {
    return skip('the JSON cannot be parsed');
  }
  const checked = validateWorkJson(slug, raw);
  if (!checked.ok) return skip(checked.reason);
  const work = checked.value;
  const info = probe(master);
  if (!info.video) return skip('the master has no video stream');
  const width = Number(info.video.width);
  const height = Number(info.video.height);
  const facts = checkMaster(work, {
    width,
    height,
    frames: info.frames,
    fps: parseRate(String(info.video.r_frame_rate ?? info.video.avg_frame_rate ?? '')),
    hasAudio: Boolean(info.audio),
  });
  if (!facts.ok) return skip(facts.reason);

  const level = DRY ? undefined : measure(master);
  const audioArgs = (bitrate: string) =>
    level ? ['-af', secondPass(level), '-ar', '48000', '-c:a', 'aac', '-b:a', bitrate] : ['-c:a', 'aac'];
  const videoReady =
    info.video.codec_name === 'h264' && info.video.pix_fmt === 'yuv420p' && info.video.profile === 'High';
  const hdVideo = videoReady
    ? ['-c:v', 'copy']
    : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-profile:v', 'high'];
  const hd = join(MEDIA, `${slug}.hd.mp4`);
  encode(master, hd, `hd;${videoReady ? 'copy' : 'crf18'};${LOUDNORM};192k`, hdVideo, audioArgs('192k'));

  const landscape = facts.value.orientation === 'landscape';
  const scale = landscape
    ? `scale=${String(WEB_LONG_SIDE)}:-2:flags=lanczos`
    : `scale=-2:${String(WEB_LONG_SIDE)}:flags=lanczos`;
  const web = join(MEDIA, `${slug}.web.mp4`);
  encode(
    master,
    web,
    `web;${scale};crf19;${LOUDNORM};192k`,
    ['-vf', scale, '-c:v', 'libx264', '-preset', 'slow', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high'],
    audioArgs('192k'),
  );

  const poster = posters(work, master, width, height, temp);
  rows.push({
    slug,
    status: 'ok',
    detail: [
      `${String(width)}×${String(height)}`,
      `${String(info.frames)} frames`,
      `${String(facts.value.seconds)} s`,
      work.category,
      ...checked.warnings,
    ].join(' · '),
  });
  return {
    slug,
    title: work.title,
    jaFallback: work.jaFallback,
    category: work.category,
    orientation: facts.value.orientation,
    seconds: facts.value.seconds,
    fps: facts.value.fps,
    width,
    height,
    features: work.features,
    run: work.run,
    seed: work.seed,
    media: { web: `works/${slug}.web.mp4`, hd: `works/${slug}.hd.mp4`, poster },
    featured: work.featured,
  };
}

function order(a: Work, b: Work): number {
  return (
    (a.featured ?? Infinity) - (b.featured ?? Infinity) ||
    WORK_CATEGORIES.indexOf(a.category) - WORK_CATEGORIES.indexOf(b.category) ||
    Number(a.orientation === 'portrait') - Number(b.orientation === 'portrait') ||
    a.slug.localeCompare(b.slug)
  );
}

function removeStale(dir: string) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const file = join(dir, name);
    if (!produced.has(file)) {
      rmSync(file, { force: true });
      Reflect.deleteProperty(cache, file);
    }
  }
}

function main() {
  if (!existsSync(SOURCE) || !statSync(SOURCE).isDirectory()) {
    console.error(`import-works: source folder not found: ${SOURCE} (pass --source <dir>). Nothing was changed.`);
    process.exit(1);
  }
  for (const tool of [FFMPEG, FFPROBE])
    if (!available(tool, ['-version'])) {
      console.error(`import-works: ${tool} is not available (set FFMPEG / FFPROBE).`);
      process.exit(1);
    }
  if (!DRY) {
    mkdirSync(MEDIA, { recursive: true });
    mkdirSync(IMAGES, { recursive: true });
  }
  const temp = mkdtempSync(join(tmpdir(), 'import-works-'));
  const rows: Row[] = [];
  const works: Work[] = [];
  const slugs = readdirSync(SOURCE)
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -'.json'.length))
    .sort();
  try {
    for (const slug of slugs) {
      try {
        const work = importOne(slug, temp, rows);
        if (work) works.push(work);
      } catch (error) {
        rows.push({ slug, status: 'skipped', detail: error instanceof Error ? error.message : String(error) });
      }
    }
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
  works.sort(order);

  const text = `// Generated by scripts/import-works.ts — do not edit by hand.\nimport type { Work } from './works.ts';\n\nexport const WORKS: readonly Work[] = ${JSON.stringify(works, null, 2)};\n`;
  const leak = PRIVATE_OUTPUT.find((pattern) => pattern.test(text));
  if (leak) {
    console.error(`import-works: the generated data matches a private pattern (${String(leak)}); nothing was written.`);
    process.exit(1);
  }

  if (!DRY) {
    writeFileSync(OUT, text);
    removeStale(MEDIA);
    removeStale(IMAGES);
    mkdirSync(join(SITE, 'node_modules/.cache'), { recursive: true });
    writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  }

  const width = Math.max(4, ...rows.map((row) => row.slug.length));
  console.log(`\n${'slug'.padEnd(width)}  status   detail`);
  console.log(`${'-'.repeat(width)}  -------  ${'-'.repeat(40)}`);
  for (const row of rows) console.log(`${row.slug.padEnd(width)}  ${row.status.padEnd(7)}  ${row.detail}`);
  console.log(
    `\n${String(works.length)} imported, ${String(rows.length - works.length)} skipped${DRY ? ' (dry run: nothing written)' : ` → ${OUT.slice(SITE.length + 1)}`}.`,
  );
  if (works.length && !DRY) console.log('Upload public/media/works/*.mp4 to the media base (works/) before deploying.');
}

main();
