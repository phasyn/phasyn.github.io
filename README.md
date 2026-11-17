# phasyn.dev

Official site of **Phasyn Studio** — static React site for GitHub Pages (custom domain `phasyn.dev`).
Locales: `zh-hant` (source), `ja`, `en`.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev          # http://127.0.0.1:5173 (Vite dev server)
pnpm typecheck    # react-router typegen + tsc (strict, library declarations included)
pnpm lint         # ESLint (typed, strict, zero warnings) + dependency-cruiser module boundaries (.dependency-cruiser.mjs)
pnpm format       # Prettier; `pnpm format:check` only checks
pnpm test         # Vitest boundary tests: preview file boundary, works importer validation (scripts/*.test.ts)
pnpm build        # prerender every locale route into build/client, then scripts/finalize-build.ts
pnpm preview      # GitHub-Pages-like static server for build/client (PORT=4173); also serves public/media with byte ranges
```

Before a commit: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` all pass. Rules are never loosened; a
single-line `eslint-disable-next-line` needs a reason after `--`.

## Layout

| Path | Owner / purpose |
|---|---|
| `src/site/config.ts` | Locales, pages, URLs, prerender list (no React) |
| `src/root.tsx`, `src/routes.ts`, `src/entry.server.tsx` | App shell and routing |
| `src/routes/*.tsx` | Thin route modules: `meta` + render the feature page |
| `src/features/<page>/` | One folder per page: `XxxPage.tsx`, `meta.ts`, `copy.ts`, page-only components. Home is a keynote of scenes (`features/home/data.ts` decides which exist); Tour is the detailed guide |
| `src/components/{layout,brand,ui,media}` | Shared building blocks (header/footer, Wordmark, BrandMark, Button, Chip, SourceSoon, HelpWanted, `AiBadge` (machine-generated media disclosure: `h3` / `qwen` / `mixed` / `screen`), FilmPlayer, WorkCard, `CaptureStage` (a real capture with camera, one spotlight + label per step, phone zoom and a 1:1 lightbox)) |
| `src/components/fx/` | **Shared FX kit** — `NebulaField` (WebGL aurora + particles; the layout already mounts a fixed one that calms below the first screen; add `position="absolute"` instances for local brand moments), `RevealText` (glowing per-character headline reveal, phrase-aware CJK wrapping; `on="load"` above the fold, `on="view"` below), `DecodeText` (scramble → resolve for short Latin labels/IDs), `CountUp` (measured numbers), `HudFrame` (corner brackets, `scan`, `orbit` (compositor-only `fx-orbit` ring), `label`), `SpotlightCard` (pointer light + tilt), `CursorAura` (rAF only while catching up with the pointer), `IntroSplash` (1 s, 700 ms hold = `--fx-intro-delay`; remembered 7 days; any pointer/key/wheel/touch input skips it and fires an `fx-intro-skip` event) |
| `src/i18n/` | `Copy<T>` (all locales required by type), `useLocale`, `useCopy`, shared `COMMON` strings |
| `src/site/captures.ts`, `src/site/art.ts` | **The one place to re-tune pictures**: per capture key its focus regions (`[x, y, w, h]` fractions), redaction boxes and AI-disclosure flag; per still its focus (and portrait focus) and badge, which stills the Home hero and reference scene use, and which illustration opens each Home scene (`SCENE_ART`, rendered by `features/home/SceneArt.tsx`) |
| `scripts/site-assets.ts` | Read by `vite.config.ts` at startup: which `public/images/ui/<key>.webp` + `@2x` captures and `public/images/art/<key>.webp` stills exist, with their sizes (`__SITE_ASSETS__`, read through `src/lib/assets.ts`). A scene or Tour picture whose file is missing is left out; restart `pnpm dev` after adding one |
| `src/lib/` | `cn()`, `mediaUrl()`, `pageMeta()`, hooks (`useReducedMotion`, `useHydrated`, `useInView`, `useOffscreenPause` (layout: `data-offscreen` pauses CSS animations of blocks far from the viewport), `supportsWebGL`) |
| `src/styles/tokens.css` | Brand token owner — unchanged copy of the brand system's `tokens.tailwind.css`. Never edit. |
| `src/styles/site.css` | Site layer: `text-hero/display/headline/lead`, `tracking-display`, `text-balance-cjk`, `site-container`, `site-section`, `eyebrow`, `reveal` (fixed 240 px range), `text-on-fx` (scrim for solid-colour copy over FX), `fx-orbit` (always-on loops rotate with `fx-rotate`; `fx-spin`/`--fx-angle` only for hover effects), `film-range`, `grain`, `glow-backdrop` |
| `public/brand/` | Brand assets from the brand system (`mark-*.webp`, `icon-*`, `areas/`, `illustrations/`, `backgrounds/`, `og-1200x630.jpg`) |
| `public/og/`, `scripts/og/` | Social cards `<page>-<locale>.jpg` (1200×630). For now every page uses `/brand/og-1200x630.jpg` (see the TODO in `scripts/og/render.mjs`); cards are rendered from `card.html` with real media: `PLAYWRIGHT=<playwright/index.mjs> node scripts/og/render.mjs [--sheet <file>]` on a Mac (CJK system fonts); the run fails if a card's copy or badge no longer matches the site |
| `src/site/works.ts`, `works.gen.ts`, `scripts/import-works.ts` | Showcase works (also Home's "Made with" cards): `node scripts/import-works.ts [--source <dir>] [--force] [--dry-run]` validates each `<slug>.json` + `<slug>.mp4` master (scripts/works-validate.ts), writes `public/media/works/<slug>.{web,hd}.mp4` (upload to the media base), posters in `public/images/works/` and `works.gen.ts`. Slate placeholders and labels: `src/i18n/works.ts`; card: `components/media/WorkCard.tsx` |
| `public/media/` | Review-only large media (git-ignored, removed from the build): `works/` from the importer, `tour/<key>.mp4` screen recordings (`src/site/tour-videos.ts`; shown when `public/images/tour/<key>-poster.webp` + `-poster-960.webp` exist) and `films/intro.mp4` (the Home intro film: one file for every locale, its lines in `public/captions/films/intro.<locale>.vtt`). Production reads `VITE_MEDIA_BASE` (Hugging Face): upload these folders there |
| `scripts/serve.ts`, `scripts/static-files.ts` | The preview server and its request-to-file mapping and byte ranges (never outside build/client or public/media) |
| `.dependency-cruiser.mjs` | Module boundaries: app shell → `routes/` → `features/<page>/` → `components/` → `lib/` → `i18n/` → `site/`; pages never import each other |

## Conventions

- Tokens only (no Tailwind default colour names; white is `text-[#fff]` / `rgb(255 255 255 / α)`). Brand gradient is a signal, never a fill under white text.
- Copy: every visible string comes from a typed `Copy<T>` object with all three locales. CJK headings: `text-balance-cjk`, no letter-spacing;
  Latin display: `tracking-display`. Product names, model IDs and component IDs are never translated.
- Content must be visible in the prerendered HTML (no JS required to read). Scroll reveal uses the CSS `reveal` utility.
- WebGL and other browser-only work mount after hydration (`useHydrated`), lazy-load their chunk, pause offscreen, clean up on
  unmount, and show a static poster for no-WebGL and `prefers-reduced-motion`.
- Videos use `FilmPlayer` (`src` per locale for burned-in subtitles, poster first, media and captions attached only within 600 px of the viewport, linear
  progress, keyboard shortcuts, full-screen toggle). `badge="h3" | "qwen" | "mixed"` pins the AI disclosure over the video; pass
  `available={false}` (a real boolean) for films not published yet, so nothing is requested; `ref` gives `seek` / `playFrom`.
- No illustrative UI: features are shown only with real captures (`CaptureStage`), cropped and spotlit, or in words. Concept pictures must not look like an interface.
- Video slots use the works importer's copies only (`useWorkSource`: the 1280-wide web copy, the 2560 master on large screens); never a smaller file and never CSS-upscaled media.
- Never put LAN IPs, filesystem paths, usernames or private media in copy, mock-ups or media.
