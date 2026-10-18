#!/usr/bin/env node
/**
 * Renders the social cards (Open Graph / Twitter): 5 pages × 3 locales → public/og/<page>-<locale>.jpg, 1200×630 JPEG.
 *
 *   PLAYWRIGHT=../studio/node_modules/playwright/index.mjs node scripts/og/render.mjs [home-en …] [--sheet <file.jpg>]
 *
 * Run from the site root. Playwright is not a site dependency: PLAYWRIGHT points at any install (default `playwright`).
 * One headless Chrome with the GPU off renders scripts/og/card.html per card; CJK type uses the macOS system fonts
 * (PingFang TC, Hiragino Sans), so render on a Mac. `--sheet` also writes a contact sheet of every card at half size.
 *
 * Card text is the site's own copy: the page name from its meta.ts title and its H1, split into display lines only at
 * phrase boundaries, and the licence badge text of the shared AiBadge. The run stops when any of it no longer matches
 * the source, so a changed headline means new cards.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { HTML_LANG, LOCALES, PAGES } from '../../src/site/config.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = join(ROOT, 'public/og');
const TEMPLATE = pathToFileURL(join(ROOT, 'scripts/og/card.html')).href;
const SIZE = { width: 1200, height: 630 };
/** Every piece of card text (not the pictures) stays this far from the edges. */
const SAFE = 60;
const TEXT = '.brand, .wordmark, .eyebrow, h1 .line, .byline, .tag, .hud-label';
/** The highest JPEG quality (100, 98, … 70) that stays under this size; the cards land at roughly 150–250 KB. */
const MAX_BYTES = 245_000;

// Licence-required disclosure on generated media: the shared AiBadge's `h3` and `qwen` texts (src/components/ui/AiBadge.tsx).
const BADGE_SOURCE = 'src/components/ui/AiBadge.tsx';
const POWERED = 'Powered by MiniMax H3';
const TAGS = {
  h3: { 'zh-hant': `AI 生成 · ${POWERED}`, ja: `AI 生成 · ${POWERED}`, en: `AI-generated · ${POWERED}` },
  qwen: { 'zh-hant': 'AI 生成 · Qwen-Image 2.1', ja: 'AI 生成 · Qwen-Image 2.1', en: 'AI-generated · Qwen-Image 2.1' },
};

const capture = (name) => ({ src: `images/home/ui/${name}@2x.webp`, size: [3840, 2160] });
const poster = (slug) => ({ src: `images/showcase/items/${slug}-poster-768.webp` });

/**
 * Per page: layout, real media and the copy sources the text is checked against (`{locale}` = the card's locale).
 * label = page name from meta.ts (Home: its tagline); lines = the H1; byline = optional, from the same sources.
 */
const CARDS = {
  home: {
    layout: 'still',
    tag: 'qwen',
    // The ocean still (Qwen-Image 2.1, 1152×672) that the Home hero and the H3 clip "Aurora Over the Sea" start from.
    media: { still: { src: 'images/home/still-ocean.webp', position: '50% 38%' } },
    sources: ['src/features/home/meta.ts', 'src/features/home/copy.ts'],
    text: {
      'zh-hant': { label: '從分鏡，到成片', lines: ['用自己的 GPU，', '做 AI 影片。'] },
      ja: { label: '絵コンテから、完成映像まで', lines: ['AI 映像制作を、', '自分の GPU で。'] },
      en: { label: 'From storyboard to synthesis', lines: ['AI Filmmaking', 'on Your Own GPUs.'] },
    },
  },
  tour: {
    layout: 'screen',
    tag: 'qwen',
    hud: 'Real capture · Image Studio',
    // The Tour hero's product shot: a finished take in Image Studio, the window without the settings panel.
    media: { shot: { ...capture('image-studio-takes'), crop: [0, 0, 0.8, 1], width: 580 } },
    sources: ['src/features/tour/meta.ts', 'src/features/tour/copy.ts'],
    text: {
      'zh-hant': { label: '操作導覽', lines: ['看它真的跑起來。'] },
      ja: { label: '操作ガイド', lines: ['実際の操作を、', 'そのまま。'] },
      en: { label: 'Tour', lines: ['See It Work.', 'For Real.'] },
    },
  },
  showcase: {
    layout: 'mosaic',
    tag: 'h3',
    // Three hero-graded films (MiniMax H3), frames as shown on the Showcase page; none has signage or lettering.
    media: { tile0: poster('through-the-frame'), tile1: poster('lantern-fpv'), tile2: poster('sky-whale') },
    sources: ['src/features/showcase/meta.ts', 'src/features/showcase/copy.ts'],
    text: {
      'zh-hant': { label: '作品', lines: ['這一頁的每一個畫面，', '都在作者家裡生成。'] },
      ja: { label: '作例', lines: ['この映像はすべて、', '自宅で生成しました。'] },
      en: { label: 'Showcase', lines: ['Every Frame Here', 'Was Generated at Home.'] },
    },
  },
  benchmarks: {
    layout: 'timeline',
    hud: 'Real capture · Records · Step Timeline',
    // Run cfa759df in Records: the Step Timeline, one track per machine (the site's `timeline` crop of this capture).
    media: { shot: { ...capture('records-run-steps'), crop: [0.2635, 0.5537, 0.5333, 0.2148], width: 1080 } },
    sources: ['src/features/benchmarks/meta.ts', 'src/features/benchmarks/copy/{locale}.ts'],
    text: {
      'zh-hant': { label: '數據分析', lines: ['每一秒，都有出處。'] },
      ja: { label: 'ベンチマーク', lines: ['すべての一秒に、出どころを。'] },
      en: { label: 'Benchmarks', lines: ['Every Second, Accounted For.'] },
    },
  },
  about: {
    layout: 'mark',
    // The About hero: the brand mark over its nebula art (Codex, screen-blended on the canvas).
    media: { nebula: { src: 'images/about/b02-about-header-2560.webp' }, mark: { src: 'brand/mark-512.webp' } },
    sources: ['src/features/about/meta.ts', 'src/features/about/copy.ts', 'src/i18n/common.ts'],
    text: {
      'zh-hant': { label: '關於', lines: ['為什麼要自己做？'], byline: '由 DennySORA 開發的個人、非商業專案。' },
      ja: { label: 'このプロジェクトについて', lines: ['なぜ、', '自分で作るのか。'], byline: 'DennySORA が開発する個人・非商用プロジェクトです。' },
      en: { label: 'About', lines: ['Why Build It Myself?'], byline: 'A personal, non-commercial project by DennySORA.' },
    },
  },
};

function cardsFor(ids) {
  const missing = PAGES.filter((page) => !CARDS[page]);
  if (missing.length) throw new Error(`no card spec for page(s): ${missing.join(', ')}`);
  const all = PAGES.flatMap((page) =>
    LOCALES.map((locale) => {
      const { text, sources, tag, ...rest } = CARDS[page];
      return { id: `${page}-${locale}`, page, locale, lang: HTML_LANG[locale], ...rest, ...text[locale], tag: tag ? TAGS[tag][locale] : '', sources };
    }),
  );
  if (!ids.length) return all;
  const unknown = ids.filter((id) => !all.some((card) => card.id === id));
  if (unknown.length) throw new Error(`unknown card(s): ${unknown.join(', ')}`);
  return all.filter((card) => ids.includes(card.id));
}

/** Every label, headline line, byline and badge must still be the site's copy. */
function checkCopy(cards) {
  const read = (path) => readFileSync(join(ROOT, path), 'utf8');
  const badge = read(BADGE_SOURCE);
  const stale = cards.flatMap((card) => {
    const source = card.sources.map((path) => read(path.replace('{locale}', card.locale))).join('\n');
    const texts = [card.label, ...card.lines, card.byline].filter((text) => text && !source.includes(text));
    // AiBadge spells the H3 texts as `AI 生成 · ${POWERED}`.
    if (card.tag && !(badge.includes(card.tag.replace(POWERED, '${POWERED}')) && badge.includes(`'${POWERED}'`))) texts.push(card.tag);
    return texts.map((text) => `${card.id}: “${text}”`);
  });
  if (stale.length) throw new Error(`card copy no longer matches the site copy:\n  ${stale.join('\n  ')}`);
}

async function checkSafeArea(page, card) {
  const outside = await page.evaluate(
    ({ selector, inset, width, height }) =>
      [...document.querySelectorAll(selector)]
        .map((el) => ({ name: el.getAttribute('class') ?? el.tagName, box: el.getBoundingClientRect() }))
        .filter(({ box }) => box.left < inset - 0.5 || box.top < inset - 0.5 || box.right > width - inset + 0.5 || box.bottom > height - inset + 0.5)
        .map(({ name, box }) => `${name} [${[box.left, box.top, box.right, box.bottom].map(Math.round).join(', ')}]`),
    { selector: TEXT, inset: SAFE, ...SIZE },
  );
  if (outside.length) throw new Error(`${card.id}: text outside the ${SAFE} px safe area: ${outside.join('; ')}`);
}

async function encode(page) {
  let shot;
  for (let quality = 100; quality >= 70; quality -= 2) {
    shot = { buffer: await page.screenshot({ type: 'jpeg', quality, clip: { x: 0, y: 0, ...SIZE } }), quality };
    if (shot.buffer.length <= MAX_BYTES) break;
  }
  return shot;
}

async function contactSheet(page, results, path) {
  const cells = results
    .map(({ card, buffer, quality }) => {
      const src = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      const info = `${card.id} · ${Math.round(buffer.length / 1024)} KB · q${quality}`;
      return `<figure><img src="${src}" width="600" height="315"><figcaption>${info}</figcaption></figure>`;
    })
    .join('');
  await page.setViewportSize({ width: 1872, height: 400 });
  await page.setContent(
    `<!doctype html><style>body{margin:0;background:#04060c;color:#b5bfd9;font:500 15px ui-monospace,Menlo,monospace}
    main{display:grid;grid-template-columns:repeat(3,600px);gap:24px;padding:24px}figure{margin:0}img{display:block;border-radius:6px}
    figcaption{padding-top:8px}</style><main>${cells}</main>`,
  );
  await page.screenshot({ path, type: 'jpeg', quality: 88, fullPage: true });
}

const args = process.argv.slice(2);
const sheetAt = args.indexOf('--sheet');
const sheet = sheetAt >= 0 ? resolve(args[sheetAt + 1] ?? 'og-contact-sheet.jpg') : null;
const cards = cardsFor(args.filter((arg, i) => !arg.startsWith('--') && (sheetAt < 0 || i !== sheetAt + 1)));
checkCopy(cards);

const { chromium } = await import(process.env.PLAYWRIGHT ? pathToFileURL(resolve(process.env.PLAYWRIGHT)).href : 'playwright');
const browser = await chromium.launch({ channel: 'chrome', args: ['--disable-gpu'] });
try {
  const page = await browser.newPage({ viewport: SIZE, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => console.error(`page error: ${error.message}`));
  mkdirSync(OUT_DIR, { recursive: true });
  const results = [];
  for (const card of cards) {
    await page.goto(TEMPLATE);
    await page.evaluate((data) => window.renderCard(data), card);
    await checkSafeArea(page, card);
    const { buffer, quality } = await encode(page);
    writeFileSync(join(OUT_DIR, `${card.id}.jpg`), buffer);
    results.push({ card, buffer, quality });
    console.log(`${card.id}.jpg  ${Math.round(buffer.length / 1024)} KB  q${quality}`);
  }
  if (sheet) {
    await contactSheet(page, results, sheet);
    console.log(`contact sheet: ${sheet}`);
  }
} finally {
  await browser.close();
}
