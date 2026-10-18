/**
 * Illustrative UI primitives — small, generic re-creations of Phasyn Studio screens for the marketing pages (Home, Tour).
 *
 * Rules every consumer follows (BRIEF §4–§5, DESIGN_GUIDE §17, work/product/mockup-spec.md):
 * - A visible "Illustrative UI" label on every composition (`AppWindow` shows `IllustrativeBadge` by default; use the badge
 *   directly on anything else). Made-up values are only allowed inside a labelled frame; prefer real measurements with the
 *   machine named in a caption.
 * - English UI labels in every locale (as in the Tour recordings; `AppWindow`/`Terminal` render `lang="en"`). Exact labels come
 *   from work/product/ui-map.md. Never show LAN IPs, hostnames, user@host prompts, absolute paths or private names.
 * - Workbench look inside the window: solid panels, no glow on tables/charts/code; glow only where the App glows
 *   (GeneratingFrame while generating, the playhead).
 * - Motion: transform/opacity only, linear playheads, finite sequences (no endless loops), paused off screen, and the complete
 *   static end state for the server render, no-JS readers and `prefers-reduced-motion` (gate everything on
 *   `useMockPlayback().armed`).
 *
 * Typical use:
 *
 *   const play = useMockPlayback<HTMLDivElement>();
 *   <div ref={play.ref}>
 *     <AppWindow title="Video Studio · Edit" label="Prompt being written for a shot">
 *       <PromptBox text={prompt} armed={play.armed} run={play.seen} />
 *       <TimelineStrip duration={12} video={clips} playing={play.armed && play.seen} paused={!play.visible} />
 *     </AppWindow>
 *   </div>
 */
import './mock.css';

export { AppWindow, type AppWindowProps } from './AppWindow.tsx';
export { GeneratingFrame, type GeneratingFrameProps } from './GeneratingFrame.tsx';
export { IllustrativeBadge } from './IllustrativeBadge.tsx';
export { MockChip, MockCount, Panel, type MockChipTone, type PanelProps } from './Panel.tsx';
export { sliceChars, useMockPlayback, useTypewriter, type MockPlayback } from './playback.ts';
export { PromptBox, type PromptBoxProps } from './PromptBox.tsx';
export { RecorderBars, type RecorderBarRow, type RecorderBarsProps } from './RecorderBars.tsx';
export { Terminal, type TerminalLine, type TerminalLineKind, type TerminalProps } from './Terminal.tsx';
export { TimelineStrip, type TimelineAudioClip, type TimelineStripProps, type TimelineVideoClip } from './TimelineStrip.tsx';
