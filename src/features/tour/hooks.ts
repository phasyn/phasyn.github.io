import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { parseVtt, type Cue } from '../../components/media/captions.ts';
import type { FilmPlayerHandle } from '../../components/media/FilmPlayer.tsx';
import type { ChapterId } from './chapters.ts';

// Reading line: a chapter is current while it crosses the band 40–45 % down the viewport.
const READING_BAND = '-40% 0px -55% 0px';

/**
 * Which chapter is under the reading line. Null on the server, before hydration and above the first chapter, so the index
 * is a plain list of anchors without JavaScript. Between two chapters the last one stays current.
 */
export function useActiveChapter(ids: readonly ChapterId[]): ChapterId | null {
  const [active, setActive] = useState<ChapterId | null>(null);
  useEffect(() => {
    const targets = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const first = targets[0];
    if (!first) return;
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const current = ids.find((id) => crossing.has(id));
        if (current) setActive(current);
        else if (first.getBoundingClientRect().top > window.innerHeight * 0.45) setActive(null);
        else {
          const last = targets[targets.length - 1];
          if (last && last.getBoundingClientRect().bottom < window.innerHeight * 0.4) setActive(null);
        }
      },
      { rootMargin: READING_BAND },
    );
    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

export interface FilmControl {
  /** The element around the player (scrolled into view and observed before a seek). */
  wrapRef: RefObject<HTMLDivElement | null>;
  /** Pass to FilmPlayer as `ref`. */
  playerRef: RefObject<FilmPlayerHandle | null>;
  /** Pass to FilmPlayer as `onTimeUpdate`. */
  onTimeUpdate: (seconds: number) => void;
  /** Playback position once the video has played; null before. */
  time: number | null;
  /** Start playback at `seconds`, bringing the player into view first. */
  seek: (seconds: number) => void;
}

/**
 * Chapter-timestamp control over the shared FilmPlayer's imperative handle. FilmPlayer pauses itself below 35 % visibility,
 * so a seek scrolls the player in first and starts once it is well in view (the latest seek wins; unmount cancels).
 */
export function useFilmControl(reducedMotion: boolean): FilmControl {
  const wrapRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<FilmPlayerHandle>(null);
  const [time, setTime] = useState<number | null>(null);
  const pending = useRef<{ observer: IntersectionObserver; timer: number } | null>(null);
  const onTimeUpdate = useCallback((seconds: number) => setTime(seconds), []);

  const cancelPending = useCallback(() => {
    if (!pending.current) return;
    pending.current.observer.disconnect();
    window.clearTimeout(pending.current.timer);
    pending.current = null;
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const seek = useCallback(
    (seconds: number) => {
      const frame = wrapRef.current;
      if (!frame || !playerRef.current) return;
      cancelPending();
      const start = () => playerRef.current?.playFrom(seconds);
      const rect = frame.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)) / Math.max(1, rect.height);
      if (visible >= 0.6) {
        start();
        return;
      }
      frame.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry || entry.intersectionRatio < 0.6 || !pending.current) return;
          observer.disconnect();
          // Let FilmPlayer's own visibility state catch up before it is activated.
          pending.current.timer = window.setTimeout(() => {
            pending.current = null;
            start();
          }, 140);
        },
        { threshold: [0.6] },
      );
      pending.current = { observer, timer: 0 };
      observer.observe(frame);
    },
    [cancelPending, reducedMotion],
  );

  return { wrapRef, playerRef, onTimeUpdate, time, seek };
}

const cueCache = new Map<string, Promise<Cue[]>>();

function loadCues(path: string): Promise<Cue[]> {
  let request = cueCache.get(path);
  if (!request) {
    request = fetch(path)
      .then((response) => (response.ok ? response.text() : ''))
      .then((text) => parseVtt(text))
      .catch(() => []);
    cueCache.set(path, request);
  }
  return request;
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim().toLowerCase();

function matchAnchors(cues: readonly Cue[], anchors: readonly string[]): (number | null)[] {
  let from = 0;
  return anchors.map((anchor) => {
    const wanted = normalize(anchor);
    const index = cues.findIndex((cue, i) => i >= from && normalize(cue.text).startsWith(wanted));
    if (index < 0) return null;
    from = index + 1;
    return cues[index]?.start ?? null;
  });
}

/**
 * Where each step starts in the video: the first cue at or after the previous step whose text begins with the step's English
 * anchor line. English pages reuse the cues FilmPlayer already loaded (`playerCues`: null while it loads); other locales read
 * the site-hosted English subtitles once (all locales share one timing) when `enabled` (the chapter is near the viewport).
 * A missing file or an unmatched anchor simply means no timestamp for that step.
 */
export function useStepTimes(
  path: string,
  anchors: readonly string[],
  enabled: boolean,
  playerCues?: readonly Cue[] | null,
): readonly (number | null)[] | null {
  const [fetched, setFetched] = useState<readonly Cue[] | null>(null);
  const usePlayer = playerCues !== undefined;
  useEffect(() => {
    if (usePlayer || !enabled) return;
    let alive = true;
    void loadCues(path).then((cues) => {
      if (alive) setFetched(cues);
    });
    return () => {
      alive = false;
    };
  }, [path, enabled, usePlayer]);
  const cues = usePlayer ? playerCues : fetched;
  const key = anchors.join('\u0000');
  return useMemo(() => {
    if (!cues || cues.length === 0) return null;
    const found = matchAnchors(cues, key.split('\u0000'));
    return found.some((time) => time !== null) ? found : null;
  }, [cues, key]);
}
