import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { mediaUrl } from '../../lib/media.ts';
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
  /** Wrap FilmPlayer directly in an element with this ref. */
  wrapRef: RefObject<HTMLDivElement | null>;
  /** Playback position while the video has played at least once; null before. */
  time: number | null;
  playing: boolean;
  /** Start (or move) playback at `seconds`, bringing the player into view first. */
  seek: (seconds: number) => void;
}

/**
 * Adapter around the shared FilmPlayer, which exposes no imperative handle (shared change requested in the report):
 * reads time from the media events (captured on the wrapper, media events do not bubble) and seeks through the DOM.
 * FilmPlayer pauses itself below 35 % visibility, so a seek scrolls the player in first and starts once it is well in view.
 */
export function useFilmControl(reducedMotion: boolean): FilmControl {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const pending = useRef<{ observer: IntersectionObserver; timer: number } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onTime = (event: Event) => {
      const video = event.target as HTMLVideoElement;
      if (video.tagName === 'VIDEO') setTime(video.currentTime);
    };
    const onPlay = () => setPlaying(true);
    const onStop = () => setPlaying(false);
    wrap.addEventListener('timeupdate', onTime, true);
    wrap.addEventListener('play', onPlay, true);
    wrap.addEventListener('pause', onStop, true);
    wrap.addEventListener('ended', onStop, true);
    return () => {
      wrap.removeEventListener('timeupdate', onTime, true);
      wrap.removeEventListener('play', onPlay, true);
      wrap.removeEventListener('pause', onStop, true);
      wrap.removeEventListener('ended', onStop, true);
    };
  }, []);

  const cancelPending = useCallback(() => {
    if (!pending.current) return;
    pending.current.observer.disconnect();
    window.clearTimeout(pending.current.timer);
    pending.current = null;
  }, []);

  useEffect(() => cancelPending, [cancelPending]);

  const seek = useCallback(
    (seconds: number) => {
      const frame = wrapRef.current?.firstElementChild as HTMLElement | null;
      const video = frame?.querySelector('video');
      if (!frame || !video) return;
      cancelPending();
      const start = () => {
        // Before its first play FilmPlayer shows a poster button that activates the player (sound on, from 0).
        const poster = frame.querySelector<HTMLButtonElement>(':scope > button');
        if (poster) poster.click();
        video.currentTime = seconds;
        void video.play().catch(() => {});
      };
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

  return { wrapRef, time, playing, seek };
}

const cueCache = new Map<string, Promise<number[] | null>>();

function parseCueStarts(vtt: string): number[] {
  const starts: number[] = [];
  for (const line of vtt.split(/\r?\n/)) {
    const match = line.match(/^\s*(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{3})\s+-->/);
    if (!match) continue;
    const [, h, m, s, ms] = match;
    starts.push(Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s) + Number(ms) / 1000);
  }
  return starts;
}

function loadCues(path: string): Promise<number[] | null> {
  let request = cueCache.get(path);
  if (!request) {
    request = fetch(mediaUrl(path))
      .then(async (response) => {
        if (!response.ok) return null;
        const starts = parseCueStarts(await response.text());
        return starts.length ? starts : null;
      })
      .catch(() => null);
    cueCache.set(path, request);
  }
  return request;
}

/**
 * Subtitle cue start times for a chapter: the pinned `cueStarts` if given, else read once from the WebVTT export next to the
 * video (all locales share one timing, so the English file is enough). Fetched only when `enabled` (the chapter is near the
 * viewport); a missing file simply means no timestamps.
 */
export function useCueStarts(path: string, pinned: readonly number[] | undefined, enabled: boolean): readonly number[] | null {
  const [starts, setStarts] = useState<readonly number[] | null>(pinned ?? null);
  useEffect(() => {
    if (pinned || !enabled) return;
    let alive = true;
    void loadCues(path).then((result) => {
      if (alive && result) setStarts(result);
    });
    return () => {
      alive = false;
    };
  }, [path, pinned, enabled]);
  return pinned ?? starts;
}
