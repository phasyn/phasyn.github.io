/*
 * Real still captures of Phasyn Studio shown on the site, keyed by capture: the file name without `.webp`. Home serves
 * public/images/home/ui/<key>.webp (+ @2x) and Tour public/images/tour/ui/<key>.webp — byte-identical files; Showcase's
 * Breakdown shows public/images/showcase/page/records-run-cfa759df.webp (+ @2x), the same file as records-run-steps.
 * Audited 2026-10-19 by looking at every file (the dimmed workspace behind the Generation Engine sheet was brightened).
 *
 * `generated`: the capture visibly shows a generated image or video frame (Image Studio previews or takes, a Video Studio
 * editor or player, references and assets). Those carry the AiBadge `screen` disclosure ("Real screen · contains
 * AI-generated content", MiniMax H3 AUP / Qwen licence) wherever they are shown, as the capture's one real-screen label.
 * Captures with only UI (component graph, inspector, records tables, empty previews) get nothing.
 *
 * A capture that is not listed counts as generated until someone looks at it and lists it here, so a new capture never
 * ships without its disclosure.
 */

export interface CaptureAudit {
  /** Where it is shown. */
  shown: readonly string[];
  /** What is visible, in plain words, for reviewers. */
  shows: string;
  /** Shows a generated image or video frame. */
  generated: boolean;
}

export const CAPTURES = {
  'image-studio-takes': {
    shown: ['Home · pipeline step 2', 'Tour · hero', 'Tour · chapter 01 screens'],
    shows: 'Image Studio after generation: a Qwen-Image 2.1 still in the viewer, the Takes strip and the image list.',
    generated: true,
  },
  'image-studio-generating': {
    shown: ['Home · pipeline step 1', 'Tour · chapter 01 screens'],
    shows: 'Image Studio mid-run: the preview is still empty (appears once DiT starts), the take is a spinner, list thumbnails are placeholders.',
    generated: false,
  },
  'render-engine-image': {
    shown: ['Home · features (Image Studio card)', 'Tour · chapter 01 screens'],
    shows: 'Generation Engine sheet; the dimmed workspace behind it has empty viewer and takes states.',
    generated: false,
  },
  'components-pipeline-graph': {
    shown: ['Home · under the hood', 'Tour · chapter 05 screens'],
    shows: 'Components · Pipelines: the fl2va-pc node graph, outline and inspector (UI only).',
    generated: false,
  },
  'component-inspector-precision': {
    shown: ['Home · under the hood', 'Tour · chapter 05 screens'],
    shows: 'Components: instance table, component inspector and event log (UI only).',
    generated: false,
  },
  'records-run-steps': {
    shown: ['Home · under the hood', 'Tour · chapter 05 screens'],
    shows: 'Records · Run Details: graph, Step Timeline, activity log and the prompt as text (no image or video frame).',
    generated: false,
  },
  'records-run-cfa759df': {
    shown: ['Showcase · breakdown'],
    shows: 'Same file as records-run-steps.',
    generated: false,
  },
} as const satisfies Record<string, CaptureAudit>;

/** The AiBadge variant a real capture needs, or null for a UI-only capture. Unlisted captures get the disclosure. */
export function captureBadge(capture: string): 'screen' | null {
  const audit = (CAPTURES as Record<string, CaptureAudit | undefined>)[capture];
  return audit && !audit.generated ? null : 'screen';
}
