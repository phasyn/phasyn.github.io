import { Clapperboard, Film, Images, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AppWindow, GeneratingFrame, MockChip, MockCount, PromptBox, TimelineStrip } from '../../../../components/mock/index.ts';
import { useLocale } from '../../../../i18n/locale.tsx';
import { cn } from '../../../../lib/cn.ts';
import { mediaUrl } from '../../../../lib/media.ts';
import { HTML_LANG } from '../../../../site/config.ts';
import { REAL } from '../../art.ts';
import { MOCK_UI } from '../../copy.ts';

export interface PaneProps {
  /** This pane is the one being shown and is on screen: run its sequence. */
  active: boolean;
  /** Motion allowed and hydrated (useMockPlayback().armed); false renders the final state statically. */
  armed: boolean;
  /** Accessible summary of the illustrative window. */
  label: string;
  className?: string;
}

const still = REAL.stills.ocean;

function MockTabs({ tabs, current }: { tabs: readonly string[]; current: number }) {
  return (
    <div className="flex items-end gap-4 border-b border-line-subtle text-data">
      {tabs.map((tab, index) => (
        <span
          key={tab}
          className={cn('-mb-px border-b-2 pb-2', index === current ? 'border-brand-blue font-semibold text-fg' : 'border-transparent text-fg-tertiary')}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

function MockPrimary({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-action-gradient px-3 text-data font-semibold whitespace-nowrap text-[#fff] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.18),0_1px_2px_rgb(0_0_0_/_0.35)]">
      {children}
    </span>
  );
}

function RealBadge({ children, className }: { children: ReactNode; className?: string }) {
  const locale = useLocale();
  return (
    <span
      lang={HTML_LANG[locale]}
      className={cn('material-hud inline-flex h-6 items-center gap-1.5 rounded-full px-2 text-[11px] font-medium whitespace-nowrap text-fg', className)}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      {children}
    </span>
  );
}

/** Step 1 — Image Studio "Basics": generation mode and the real prompt typing out. */
export function PromptPane({ active, armed, label, className }: PaneProps) {
  return (
    <AppWindow title={MOCK_UI.imageStudio} label={label} className={cn('h-full', className)}>
      <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <MockTabs tabs={[MOCK_UI.basics, MOCK_UI.sampling, MOCK_UI.image]} current={0} />
        <div className="grid gap-2">
          <span className="text-caption text-fg-tertiary">{MOCK_UI.generationMode}</span>
          <div className="grid gap-2 @container sm:grid-cols-2">
            <span className="flex min-h-10 items-center gap-2 rounded-md border border-brand-blue/70 bg-brand-gradient-soft px-3 text-data text-fg">
              <span aria-hidden className="grid size-3.5 place-items-center rounded-full border border-action-fg">
                <span className="size-1.5 rounded-full bg-action-fg" />
              </span>
              {MOCK_UI.modeText}
            </span>
            <span className="flex min-h-10 items-center gap-2 rounded-md border border-line-subtle bg-canvas px-3 text-data text-fg-secondary">
              <span aria-hidden className="size-3.5 rounded-full border border-line-control" />
              <span className="truncate">{MOCK_UI.modeReference}</span>
            </span>
          </div>
        </div>
        <PromptBox
          text={MOCK_UI.imagePrompt}
          run={active}
          armed={armed}
          cps={42}
          footer={
            <>
              <span>{MOCK_UI.promptHint}</span>
              <span className="machine ml-auto truncate">1152 × 672 · {MOCK_UI.outputSizeValue}</span>
            </>
          }
        />
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-subtle pt-4">
          <span className="text-caption text-fg-tertiary">{MOCK_UI.outputSize}</span>
          <MockPrimary>
            <Images className="size-3.5" aria-hidden />
            {MOCK_UI.generateImage}
          </MockPrimary>
        </div>
      </div>
    </AppWindow>
  );
}

/** Step 2 — Image Studio takes: the GeneratingFrame breathes over a soft preview, then the real still lands. */
export function ImagePane({ active, armed, label, className, realBadge }: PaneProps & { realBadge: string }) {
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!armed) {
      setGenerating(false);
      return;
    }
    setGenerating(true);
    if (!active) return;
    const id = window.setTimeout(() => setGenerating(false), 2400);
    return () => window.clearTimeout(id);
  }, [active, armed]);

  return (
    <AppWindow title={MOCK_UI.imageStudio} label={label} className={cn('h-full', className)}>
      <div className="flex h-full flex-col justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 text-data">
          <span className="truncate font-semibold text-fg">{MOCK_UI.takesOf}</span>
          <MockCount>1</MockCount>
        </div>
        <GeneratingFrame active={generating} aspect={`${still.width} / ${still.height}`} hud={generating ? MOCK_UI.previewOf : undefined}>
          <img
            src={still.small}
            alt=""
            width={384}
            height={224}
            loading="lazy"
            decoding="async"
            className={cn('absolute inset-0 size-full scale-110 object-cover blur-md saturate-75 transition-opacity duration-(--duration-spring-smooth)', generating ? 'opacity-90' : 'opacity-0')}
          />
          <span
            aria-hidden
            className={cn(
              'absolute inset-0 bg-[linear-gradient(rgb(255_255_255_/_0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255_/_0.05)_1px,transparent_1px)] bg-[size:16px_16px] transition-opacity duration-(--duration-spring-smooth)',
              generating ? 'opacity-100' : 'opacity-0',
            )}
          />
          <img
            src={still.src}
            alt=""
            width={still.width}
            height={still.height}
            loading="lazy"
            decoding="async"
            className={cn('absolute inset-0 size-full object-cover transition-opacity duration-(--duration-spring-smooth) ease-(--ease-spring-smooth)', generating ? 'opacity-0' : 'opacity-100')}
          />
          <span className={cn('absolute right-2 bottom-2 z-[3] transition-opacity duration-(--duration-base)', generating ? 'opacity-0' : 'opacity-100')}>
            <RealBadge>{realBadge}</RealBadge>
          </span>
        </GeneratingFrame>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-2 text-caption text-fg-secondary">
            <span className="machine text-fg">{MOCK_UI.take}</span>
            {!generating ? (
              <MockChip tone="action" icon={<span aria-hidden className="text-[10px]">★</span>}>
                {MOCK_UI.inUse}
              </MockChip>
            ) : null}
          </span>
          <span className="inline-flex h-8 items-center gap-2 rounded-lg border border-[rgb(255_255_255_/_0.08)] bg-brand-gradient-soft px-2.5 text-data text-fg">
            <Clapperboard className="size-3.5 text-brand-cyan" aria-hidden />
            {MOCK_UI.useInVideo}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[MOCK_UI.modeText, MOCK_UI.modeReference, MOCK_UI.partialMask].map((mode) => (
            <span key={mode} className="rounded-full border border-line-subtle bg-sunken px-2 py-0.5 text-[11px] text-fg-tertiary">
              {mode}
            </span>
          ))}
        </div>
      </div>
    </AppWindow>
  );
}

interface VideoPaneProps extends PaneProps {
  realBadge: string;
  labels: { sound: string; mute: string; play: string; replay: string };
}

/**
 * Step 3 — Video Studio: the real fl2va clip made from that still plays once, muted, when the step is shown; the timeline
 * playhead follows the video's own clock (linear). Sound, play and replay are real buttons outside the illustrative window.
 * Nothing autoplays under reduced motion; the clip then starts only from the Play button.
 */
export function VideoPane({ active, armed, label, className, realBadge, labels }: VideoPaneProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const [attached, setAttached] = useState(false);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);

  // The clip is requested only once its step is first shown.
  useEffect(() => {
    if (active) setAttached(true);
  }, [active]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !attached) return;
    if (active && armed) {
      video.muted = muted;
      video.currentTime = 0;
      void video.play().catch(() => setPlaying(false));
    } else if (!active) {
      video.pause();
    }
    // `muted` is applied by the sound toggle itself; re-running on it would restart the clip.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, armed, attached]);

  // Linear playhead from the video clock while playing (one rAF loop, stopped when paused or ended).
  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    const tick = () => {
      const video = videoRef.current;
      const head = playheadRef.current;
      if (video && head && video.duration > 0) head.style.transform = `translateX(${Math.min(1, video.currentTime / video.duration) * 100}%)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const restart = (withSound: boolean) => {
    const video = videoRef.current;
    setAttached(true);
    if (!video) return;
    video.muted = !withSound;
    setMuted(!withSound);
    video.currentTime = 0;
    void video.play().catch(() => setPlaying(false));
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    if (muted) restart(true);
    else {
      video.muted = true;
      setMuted(true);
    }
  };

  return (
    <div className={cn('grid gap-3', className)}>
      <AppWindow title={MOCK_UI.videoEdit} label={label}>
        <div className="@container">
          <div className="grid gap-3 p-3 sm:p-4 @[34rem]:grid-cols-[minmax(0,1fr)_11.5rem]">
            <div className="grid min-w-0 gap-2">
              <div className="flex items-center gap-2 text-data">
                <Film className="size-3.5 text-fg-tertiary" aria-hidden />
                <span className="font-semibold text-fg">{MOCK_UI.viewer}</span>
                <span className="machine truncate text-[11px] text-fg-tertiary">{MOCK_UI.viewerShot}</span>
              </div>
              <div className="relative overflow-hidden rounded-xl border border-line-subtle bg-stage" style={{ aspectRatio: '768 / 448' }}>
                <img src={still.src} alt="" width={still.width} height={still.height} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                {attached ? (
                  <video
                    ref={videoRef}
                    className="absolute inset-0 size-full object-cover"
                    src={mediaUrl(REAL.oceanClip)}
                    poster={still.src}
                    muted
                    playsInline
                    preload="auto"
                    onPlay={() => {
                      setPlaying(true);
                      setEnded(false);
                    }}
                    onPause={() => setPlaying(false)}
                    onEnded={() => {
                      setPlaying(false);
                      setEnded(true);
                    }}
                  />
                ) : null}
                <span className="absolute right-2 bottom-2">
                  <RealBadge>{realBadge}</RealBadge>
                </span>
              </div>
            </div>
            <div className="hidden min-w-0 content-start gap-2 rounded-lg border border-line-subtle bg-surface p-2.5 @[34rem]:grid">
              <span className="text-[11px] font-semibold text-fg-secondary">{MOCK_UI.generation}</span>
              <span className="text-[11px] text-fg-tertiary">{MOCK_UI.firstFrame}</span>
              <span className="relative overflow-hidden rounded-md border border-brand-blue/60" style={{ aspectRatio: '768 / 448' }}>
                <img src={still.small} alt="" width={384} height={224} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
              </span>
              <span className="text-[11px] text-fg-tertiary">{MOCK_UI.computeRoute}</span>
              <span className="machine truncate rounded-md border border-line-subtle bg-sunken px-2 py-1 text-[11px] text-fg-secondary">fl2va</span>
            </div>
          </div>
          <div className="grid gap-2 border-t border-line-subtle p-3 sm:px-4">
            <div className="flex items-center gap-2 text-data">
              <span className="font-semibold text-fg">{MOCK_UI.timeline}</span>
              <span className="machine text-[11px] text-fg-tertiary">{MOCK_UI.timelineMeta}</span>
              <span className="ml-auto hidden text-[11px] text-fg-tertiary sm:inline">{MOCK_UI.exportSequence}</span>
            </div>
            <TimelineStrip
              duration={5.17}
              tickEvery={1}
              staticAt={ended ? 1 : 0}
              playheadRef={playheadRef}
              video={[{ id: 'c1', start: 0, end: 5.17, index: 1, title: MOCK_UI.clipTitles[0], thumb: still.small, selected: true }]}
              audio={[{ id: 'a1', start: 0, end: 5.17, seed: 11 }]}
            />
          </div>
        </div>
      </AppWindow>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => restart(!muted)}
          disabled={playing}
          className="pressable inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-raised px-3.5 text-data font-medium text-fg hover:border-action/60 disabled:opacity-50"
        >
          {ended ? <RotateCcw className="size-4" aria-hidden /> : playing ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
          {ended ? labels.replay : labels.play}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={!muted}
          className="pressable inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-raised px-3.5 text-data font-medium text-fg hover:border-action/60"
        >
          {muted ? <VolumeX className="size-4" aria-hidden /> : <Volume2 className="size-4" aria-hidden />}
          {muted ? labels.sound : labels.mute}
        </button>
      </div>
    </div>
  );
}
