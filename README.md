# phasyn.dev

Official site of **Phasyn Studio** — static React site for GitHub Pages (custom domain `phasyn.dev`).
Locales: `zh-hant` (source), `ja`, `en`. Project decisions live in `../docs/BRIEF.md`.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev          # http://127.0.0.1:5173 (Vite dev server)
pnpm typecheck    # react-router typegen + tsc
pnpm build        # prerender every locale route into build/client, then scripts/finalize-build.ts
pnpm preview      # GitHub-Pages-like static server for build/client (PORT=4173); also serves public/media with byte ranges
```

## Layout

| Path | Owner / purpose |
|---|---|
| `src/site/config.ts` | Locales, pages, URLs, prerender list (no React) |
| `src/root.tsx`, `src/routes.ts`, `src/entry.server.tsx` | App shell and routing (lead) |
| `src/routes/*.tsx` | Thin route modules: `meta` + render the feature page |
| `src/features/<page>/` | One folder per page: `XxxPage.tsx`, `meta.ts`, `copy.ts`, page-only components |
| `src/components/{layout,brand,ui,media}` | Shared building blocks (header/footer, Wordmark, BrandMark, Button, Chip, SourceSoon, `AiBadge` (machine-generated media disclosure: `h3` / `qwen` / `mixed`), FilmPlayer) |
| `src/components/fx/` | **Shared FX kit (lead-owned, BRIEF §4.1)** — `NebulaField` (WebGL aurora + particles; the layout already mounts a fixed one that calms below the first screen; add `position="absolute"` instances for local brand moments), `RevealText` (glowing per-character headline reveal, phrase-aware CJK wrapping; `on="load"` above the fold, `on="view"` below), `DecodeText` (scramble → resolve for short Latin labels/IDs), `CountUp` (measured numbers), `HudFrame` (corner brackets, `scan`, `orbit` (compositor-only `fx-orbit` ring), `label`), `SpotlightCard` (pointer light + tilt), `DataTicker` (HUD ticker of real values with device dots), `CursorAura` (rAF only while catching up with the pointer), `IntroSplash` (1 s, 700 ms hold = `--fx-intro-delay`; remembered 7 days; any pointer/key/wheel/touch input skips it and fires an `fx-intro-skip` event) |
| `src/i18n/` | `Copy<T>` (all locales required by type), `useLocale`, `useCopy`, shared `COMMON` strings |
| `src/lib/` | `cn()`, `mediaUrl()`, `pageMeta()`, hooks (`useReducedMotion`, `useHydrated`, `useInView`, `useOffscreenPause` (layout: `data-offscreen` pauses CSS animations of blocks far from the viewport), `supportsWebGL`) |
| `src/styles/tokens.css` | Brand token owner — unchanged copy of the brand system's `tokens.tailwind.css`. Never edit. |
| `src/styles/site.css` | Site layer: `text-hero/display/headline/lead`, `tracking-display`, `text-balance-cjk`, `site-container`, `site-section`, `eyebrow`, `reveal` (fixed 240 px range), `text-on-fx` (scrim for solid-colour copy over FX), `fx-orbit` (always-on loops rotate with `fx-rotate`; `fx-spin`/`--fx-angle` only for hover effects), `film-range`, `grain`, `glow-backdrop` |
| `public/brand/` | Brand assets from the brand system (`mark-*.webp`, `icon-*`, `areas/`, `illustrations/`, `backgrounds/`, `og-1200x630.jpg`) |
| `public/og/`, `scripts/og/` | Social cards `<page>-<locale>.jpg` (1200×630, `pageMeta()`'s default image), rendered from `card.html` with real media: `PLAYWRIGHT=<playwright/index.mjs> node scripts/og/render.mjs [--sheet <file>]` on a Mac (CJK system fonts); the run fails if a card's copy or badge no longer matches the site |
| `public/media/` | Review-only large media (git-ignored, removed from the build). Production reads `VITE_MEDIA_BASE` (Hugging Face) |

## Conventions

- Tokens only (no Tailwind default colour names; white is `text-[#fff]` / `rgb(255 255 255 / α)`). Brand gradient is a signal, never a fill under white text.
- Copy: every visible string comes from a typed `Copy<T>` object with all three locales. CJK headings: `text-balance-cjk`, no letter-spacing;
  Latin display: `tracking-display`. Product names, model IDs and component IDs are never translated.
- Content must be visible in the prerendered HTML (no JS required to read). Scroll reveal uses the CSS `reveal` utility.
- WebGL/three.js and other browser-only work mount after hydration (`useHydrated`), lazy-load their chunk, pause offscreen, clean up on
  unmount, and show a static poster for no-WebGL and `prefers-reduced-motion`.
- Videos use `FilmPlayer` (`src` per locale for burned-in subtitles, poster first, media and captions attached only within 600 px of the viewport, linear
  progress, keyboard shortcuts, full-screen toggle). `badge="h3" | "qwen" | "mixed"` pins the AI disclosure over the video; pass
  `available={false}` (a real boolean) for films not published yet, so nothing is requested; `ref` gives `seek` / `playFrom`.
- Illustrative UI re-creations show a visible 「介面示意 / UI イメージ / Illustrative UI」 label (`COMMON.illustrative`).
- Never put LAN IPs, filesystem paths, usernames or private media in copy, mock-ups or media.
