import { useMemo, type CSSProperties, type Ref } from 'react';
import { cn } from '../../lib/cn.ts';
import './mock.css';

export interface TimelineVideoClip {
  /** Stable id (React key). */
  id: string;
  /** Start and end in seconds on the sequence. */
  start: number;
  end: number;
  /** Clip title chip, e.g. "Opening frame". */
  title?: string;
  /** Mono index shown before the title (1-based, as in the App: "1 · Opening frame"). */
  index?: number;
  /** Image used as a filmstrip thumbnail strip (repeated). */
  thumb?: string;
  /** Not rendered yet: dashed outline with hatching at the planned length. */
  pending?: boolean;
  /** Draw the selected state (brand edge, glow-sm). */
  selected?: boolean;
}

export interface TimelineAudioClip {
  id: string;
  start: number;
  end: number;
  /** Seed for the procedural waveform, so it is stable across renders. */
  seed?: number;
}

export interface TimelineStripProps {
  /** Seconds covered by the strip. */
  duration: number;
  video: TimelineVideoClip[];
  audio?: TimelineAudioClip[];
  /** Run the playhead once across the strip, linearly, in `duration` seconds (then it rests at the end). */
  playing?: boolean;
  /** Pause the playhead (e.g. while the strip is off screen). */
  paused?: boolean;
  /** Static playhead position (0–1) when not playing; also the reduced-motion position. */
  staticAt?: number;
  /**
   * Drive the playhead yourself (e.g. from a playing <video>): the element receives `transform: translateX(p * 100%)` updates
   * from the owner, and `playing`/`paused` are ignored. Keep updates linear.
   */
  playheadRef?: Ref<HTMLDivElement>;
  /** Ruler label step in seconds. */
  tickEvery?: number;
  /** Track header labels (English UI: "V1 Video", "A1 Audio"). */
  videoLabel?: string;
  audioLabel?: string;
  className?: string;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded waveform bars (0–1 heights) with a soft envelope; pure, so prerender and client agree. */
function waveform(seed: number, bars: number): number[] {
  const random = mulberry32(seed);
  const out: number[] = [];
  let level = 0.4;
  for (let i = 0; i < bars; i++) {
    level += (random() - 0.5) * 0.5;
    level = Math.min(0.95, Math.max(0.12, level));
    const envelope = Math.sin((Math.PI * (i + 0.5)) / bars) ** 0.35;
    out.push(Math.max(0.08, level * envelope * (0.6 + random() * 0.4)));
  }
  return out;
}

function timecode(seconds: number): string {
  const s = Math.round(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Compact re-creation of the Video Studio timeline (DESIGN_GUIDE §12.21): 24 px ruler with mono labels, V1 video clips
 * (clip-video fill, filmstrip, blue→violet base line, title chip), A1 audio clips (cyan waveform) and a 1 px playhead with the
 * cyan→blue handle. The playhead moves linearly (no easing), only via transform, and never loops forever.
 */
export function TimelineStrip({
  duration,
  video,
  audio = [],
  playing = false,
  paused = false,
  staticAt = 0.18,
  tickEvery = 2,
  videoLabel = 'V1',
  audioLabel = 'A1',
  playheadRef,
  className,
}: TimelineStripProps) {
  const controlled = playheadRef !== undefined;
  const running = playing && !controlled;
  const ticks = useMemo(() => {
    const list: number[] = [];
    for (let t = 0; t <= duration + 1e-6; t += tickEvery) list.push(t);
    return list;
  }, [duration, tickEvery]);
  const pct = (value: number) => `${(value / duration) * 100}%`;

  return (
    <div className={cn('flex overflow-hidden rounded-lg border border-line-subtle bg-surface text-fg', className)}>
      {/* Track headers */}
      <div className="flex w-[3.25rem] shrink-0 flex-col border-r border-line-subtle">
        <div className="h-6 border-b border-line-subtle bg-sunken/80" />
        <div className="flex h-14 items-center justify-center border-b border-line-subtle">
          <span className="machine rounded-md bg-brand-blue/15 px-1.5 py-0.5 text-[10px] text-brand-blue ring-1 ring-brand-blue/35">{videoLabel}</span>
        </div>
        <div className="flex h-9 items-center justify-center">
          <span className="machine rounded-md bg-brand-cyan/12 px-1.5 py-0.5 text-[10px] text-brand-cyan ring-1 ring-brand-cyan/30">{audioLabel}</span>
        </div>
      </div>

      {/* Ruler and tracks; the playhead overlay spans all three rows of this column. */}
      <div className="relative min-w-0 flex-1">
        <div className="relative h-6 border-b border-line-subtle bg-sunken/80">
          {ticks.map((t) => (
            <span key={t} className="absolute top-0 flex h-full items-end pb-1" style={{ left: pct(t) }}>
              <span className="h-2 w-px bg-line-strong" />
              {t < duration - 1e-6 ? <span className="machine ml-1 text-[10px] leading-none text-fg-tertiary">{timecode(t)}</span> : null}
            </span>
          ))}
        </div>

        <div className="relative h-14 border-b border-line-subtle">
          {video.map((clip) => (
            <div
              key={clip.id}
              className={cn(
                'absolute inset-y-1.5 overflow-hidden rounded-md',
                clip.pending
                  ? 'border border-dashed border-line-strong bg-[repeating-linear-gradient(135deg,rgb(255_255_255_/_0.035)_0_6px,transparent_6px_12px)]'
                  : 'border border-clip-video-edge/60 bg-clip-video',
                clip.selected && 'border-transparent shadow-glow-sm',
              )}
              style={{ left: `calc(${pct(clip.start)} + 2px)`, width: `calc(${pct(clip.end - clip.start)} - 4px)` }}
            >
              {!clip.pending && clip.thumb ? (
                <span
                  aria-hidden
                  className="absolute inset-0 opacity-70"
                  style={{ backgroundImage: `url(${clip.thumb})`, backgroundSize: 'auto 100%', backgroundRepeat: 'repeat-x', backgroundPosition: 'left center' }}
                />
              ) : null}
              {!clip.pending ? <span aria-hidden className="absolute inset-0 bg-linear-to-r from-brand-blue/30 to-brand-violet/30" /> : null}
              {!clip.pending ? <span aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-linear-to-r from-brand-blue to-brand-violet" /> : null}
              {clip.title ? (
                <span className="absolute top-1 left-1 inline-flex max-w-[calc(100%-0.5rem)] items-center gap-1 truncate rounded-sm bg-sunken/75 px-1 text-[10px] leading-4 text-fg">
                  {clip.index !== undefined ? <span className="machine text-brand-cyan">{clip.index}</span> : null}
                  <span className="truncate">{clip.title}</span>
                </span>
              ) : null}
              {clip.selected ? <span aria-hidden className="brand-edge" /> : null}
            </div>
          ))}
        </div>

        <div className="relative h-9">
          {audio.map((clip) => (
            <AudioClip key={clip.id} clip={clip} left={pct(clip.start)} width={pct(clip.end - clip.start)} />
          ))}
        </div>

        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div
            key={running ? 'run' : 'rest'}
            ref={playheadRef}
            className={cn('absolute inset-0', running && 'mock-playhead mock-loop')}
            {...(paused && running ? { 'data-mock-paused': '' } : {})}
            style={
              {
                '--mock-duration': `${duration}s`,
                animationIterationCount: 1,
                animationFillMode: 'forwards',
                transform: running ? undefined : `translateX(${staticAt * 100}%)`,
              } as CSSProperties
            }
          >
            <span className="absolute inset-y-0 left-0 w-px bg-playhead shadow-glow-sm" />
            <span className="absolute top-0 left-0 h-[15px] w-[11px] -translate-x-1/2 bg-linear-to-b from-brand-cyan to-brand-blue [clip-path:polygon(0_0,100%_0,100%_60%,50%_100%,0_60%)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function AudioClip({ clip, left, width }: { clip: TimelineAudioClip; left: string; width: string }) {
  const bars = useMemo(() => waveform(clip.seed ?? 7, 72), [clip.seed]);
  return (
    <div
      className="absolute inset-y-1 overflow-hidden rounded-md border border-clip-audio-edge/55 bg-clip-audio"
      style={{ left: `calc(${left} + 2px)`, width: `calc(${width} - 4px)` }}
    >
      <svg aria-hidden viewBox={`0 0 ${bars.length * 2} 20`} preserveAspectRatio="none" className="absolute inset-0 size-full">
        {bars.map((h, i) => (
          <rect key={i} x={i * 2 + 0.3} width={1.4} y={10 - h * 9} height={h * 18} className="fill-brand-cyan/70" />
        ))}
      </svg>
    </div>
  );
}
