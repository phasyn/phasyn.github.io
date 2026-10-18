import { ArrowRight, Pause, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HudFrame, SpotlightCard } from '../../../components/fx/index.ts';
import { FilmPlayer } from '../../../components/media/FilmPlayer.tsx';
import { ButtonLink } from '../../../components/ui/Button.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { mediaUrl } from '../../../lib/media.ts';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME, type HomeCopy } from '../copy.ts';
import { CLIPS, type ClipKey, type ClipReceipt } from '../data.ts';
import { showcasePath } from '../links.ts';

const fill = (template: string, values: Record<string, string>) => template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');

interface ClipCardProps {
  clip: ClipReceipt;
  t: HomeCopy['made'];
  playing: boolean;
  onPlay: (key: ClipKey | null) => void;
}

/**
 * One real clip with its receipt: the frame-0 poster until someone presses play, then the clip itself with sound (only one
 * plays at a time). Run, seed, end-to-end time and the machine of every step are printed under it.
 */
function ClipCard({ clip, t, playing, onPlay }: ClipCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [attached, setAttached] = useState(false);
  const poster = `/images/home/clip-${clip.key}-poster.webp`;
  const title = t.clips[clip.key];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.muted = false;
      void video.play().catch(() => onPlay(null));
    } else video.pause();
  }, [playing, attached, onPlay]);

  return (
    <li className="reveal min-w-0">
      <SpotlightCard tilt={3} className="h-full rounded-2xl border-line-subtle bg-surface p-2">
        <figure className="grid gap-3">
          <div className="relative overflow-hidden rounded-xl bg-stage" style={{ aspectRatio: '768 / 448' }}>
            <img src={poster} alt="" width={768} height={448} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
            {attached ? (
              <video
                ref={videoRef}
                className="absolute inset-0 size-full object-cover"
                src={mediaUrl(`home/${clip.key}.mp4`)}
                poster={poster}
                playsInline
                preload="auto"
                aria-label={title}
                onEnded={() => onPlay(null)}
              />
            ) : null}
            <button
              type="button"
              onClick={() => {
                setAttached(true);
                onPlay(playing ? null : clip.key);
              }}
              aria-pressed={playing}
              aria-label={`${playing ? t.pause : t.play}: ${title}`}
              className="group/play absolute inset-0 grid place-items-center focus-visible:outline-offset-[-4px]"
            >
              <span className="grid size-12 place-items-center rounded-full bg-[rgb(7_11_20_/_0.55)] text-fg shadow-[0_0_0_1px_rgb(255_255_255_/_0.18)] backdrop-blur-sm transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover/play:scale-110">
                {playing ? <Pause className="size-5" aria-hidden /> : <Play className="size-5 translate-x-px fill-current" aria-hidden />}
              </span>
            </button>
            <span aria-hidden lang="en" className="material-hud machine pointer-events-none absolute top-2 left-2 inline-flex h-6 items-center rounded-full px-2 text-[11px] text-fg">
              run {clip.run}
            </span>
          </div>
          <figcaption className="grid gap-1 px-1.5 pb-1">
            <span className="text-data font-semibold text-fg">{title}</span>
            <span lang="en" className="machine text-[12px] text-fg-secondary">
              {fill(t.receipt, { seed: String(clip.seed), s: String(clip.seconds) })}
            </span>
            <span className="text-caption text-fg-tertiary">{t.machines}</span>
          </figcaption>
        </figure>
      </SpotlightCard>
    </li>
  );
}

/**
 * "Made with Phasyn Studio": the intro film first (the hero's "Watch the film" lands here), then four real clips of The
 * Courier with their receipts, and the way to every output on the Showcase page. Poster first everywhere: the 36 MB film and
 * the clips load only when someone presses play.
 */
export function MadeWithSection() {
  const locale = useLocale();
  const t = useCopy(HOME).made;
  const [playing, setPlaying] = useState<ClipKey | null>(null);

  return (
    <section aria-labelledby="made-title" className="home-section relative">
      <div className="site-container grid gap-10 md:gap-14">
        <SectionHeading id="made-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />

        <figure id="film" tabIndex={-1} className="reveal relative mx-auto grid w-full max-w-[70rem] gap-3 outline-none">
          <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-x-[8%] -inset-y-[14%] -z-10 opacity-50" />
          <HudFrame label="INTRO FILM" orbit innerClassName="rounded-[1.4rem]">
            <FilmPlayer
              src={{ 'zh-hant': 'films/intro.zh-hant.mp4', ja: 'films/intro.ja.mp4', en: 'films/intro.en.mp4' }}
              captions={{ 'zh-hant': '/captions/films/intro.zh-hant.vtt', ja: '/captions/films/intro.ja.vtt', en: '/captions/films/intro.en.vtt' }}
              poster={`/images/home/film-poster-${locale}.webp`}
              title={t.videoTitle}
            />
          </HudFrame>
          <figcaption className="text-data text-fg-secondary">{t.filmNote}</figcaption>
        </figure>

        <div className="grid gap-6">
          <h3 className="reveal text-headline tracking-display text-balance-cjk text-fg">{t.wallTitle}</h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CLIPS.map((clip) => (
              <ClipCard key={clip.key} clip={clip} t={t} playing={playing === clip.key} onPlay={setPlaying} />
            ))}
          </ul>
          <div className="reveal flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
            <p className="max-w-[80ch] text-caption leading-relaxed text-fg-secondary">{t.footnote}</p>
            <ButtonLink to={showcasePath(locale)} variant="secondary" icon={null} className="shrink-0">
              {t.seeAll}
              <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
