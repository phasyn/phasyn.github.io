import { useSyncExternalStore } from 'react';
import type { SlateEntry } from '../i18n/works.ts';
import type { Work } from '../site/works.ts';

/** With at least this many real works published, the "rendering" placeholders of the slate disappear. */
export const MIN_PUBLISHED = 6;

export type WallEntry = { kind: 'work'; work: Work } | { kind: 'slate'; entry: SlateEntry };

/** Featured works first (by rank), then the rest in importer order. */
export function rankedWorks(works: readonly Work[]): Work[] {
  return works
    .map((work, index) => ({ work, index }))
    .sort((a, b) => (a.work.featured ?? Infinity) - (b.work.featured ?? Infinity) || a.index - b.index)
    .map(({ work }) => work);
}

function fills(work: Work, entry: SlateEntry): boolean {
  return work.slug === entry.slug || work.title['zh-hant'] === entry.title['zh-hant'];
}

/**
 * The wall: real works first; while fewer than MIN_PUBLISHED exist, the slate entries no real work has filled follow as
 * "rendering" cards (they request no media).
 */
export function wallEntries(works: readonly Work[], slate: readonly SlateEntry[]): WallEntry[] {
  const real: WallEntry[] = rankedWorks(works).map((work) => ({ kind: 'work', work }));
  if (works.length >= MIN_PUBLISHED) return real;
  const open = slate.filter((entry) => !works.some((work) => fills(work, entry)));
  return [...real, ...open.map((entry): WallEntry => ({ kind: 'slate', entry }))];
}

/** "0:10", "1:05". */
export function formatLength(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(total / 60))}:${String(total % 60).padStart(2, '0')}`;
}

/** Network Information API (Chromium): `saveData` is the user's Data Saver / Lite mode. */
type SaveDataNavigator = Navigator & { connection?: { saveData?: boolean } };

const LARGE = '(min-width: 1440px)';

function subscribeLarge(onChange: () => void) {
  const query = window.matchMedia(LARGE);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
}

/** The visitor asked to save data. The server snapshot assumes yes, so nothing heavy is promised in prerendered HTML. */
export function useSaveData(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => (navigator as SaveDataNavigator).connection?.saveData === true,
    () => true,
  );
}

/**
 * Which copy of a work to play: the full-size master on viewports at least 1440 px wide (device pixel ratio ≥ 1, no
 * Save-Data), the 1280-wide (720p) web copy everywhere else (phones, the server).
 */
export function useWorkSource(work: Work): string {
  const saveData = useSaveData();
  const large = useSyncExternalStore(
    subscribeLarge,
    () => window.matchMedia(LARGE).matches && window.devicePixelRatio >= 1,
    () => false,
  );
  return large && !saveData ? work.media.hd : work.media.web;
}
