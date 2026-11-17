import { ArrowRight, Cpu, FileCode2, House, Info } from 'lucide-react';
import { useState, type CSSProperties } from 'react';
import { BrandMark } from '../../components/brand/BrandMark.tsx';
import { GitHubMark } from '../../components/brand/ExternalMarks.tsx';
import { HudFrame, RevealText } from '../../components/fx/index.ts';
import { FilmPlayer } from '../../components/media/FilmPlayer.tsx';
import { WorkCard } from '../../components/media/WorkCard.tsx';
import { AiBadge } from '../../components/ui/AiBadge.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { Chip } from '../../components/ui/Chip.tsx';
import { HelpWanted } from '../../components/ui/HelpWanted.tsx';
import { useCopy, useLocale } from '../../i18n/locale.tsx';
import { WORKS_COPY } from '../../i18n/works.ts';
import type { ArtImage } from '../../lib/assets.ts';
import { cn } from '../../lib/cn.ts';
import { useSaveData, useWorkSource } from '../../lib/works.ts';
import { artSources } from '../../site/art.ts';
import { LINKS, pagePath } from '../../site/config.ts';
import type { Work } from '../../site/works.ts';
import { HOME } from './copy.ts';
import { PREVIEW_WORKS, REFERENCE_VISUAL, UPSCALE_PAIR, sceneArt } from './data.ts';
import { Scene } from './Scene.tsx';

interface Numbered {
  index: number;
}

/** Scene 1 without a capture: the published work, muted while on screen (sound on press). */
export function PromptWorkScene({ index, work }: Numbered & { work: Work }) {
  const t = useCopy(HOME).prompt;
  return (
    <Scene id="describe" index={index} tag="DESCRIBE" title={t.title} lead={t.lead}>
      <WorkStage work={work} label={t.workLabel} />
    </Scene>
  );
}

function WorkStage({ work, label }: { work: Work; label: string }) {
  const locale = useLocale();
  const src = useWorkSource(work);
  const saveData = useSaveData();
  return (
    <div className="capture-reveal relative mt-4 w-full max-w-[68rem] md:mt-8">
      <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-x-[6%] -inset-y-[10%] -z-10" />
      <HudFrame label="TAKE · 24 FPS">
        <FilmPlayer
          src={src}
          poster={work.media.poster.src}
          posterSet={{ srcSet: work.media.poster.srcSet, sizes: 'min(100vw, 68rem)' }}
          title={WORKS_COPY[locale].videoLabel(work.title[locale])}
          aspect="1280 / 736"
          ambient={!saveData}
          badge="h3"
          className="rounded-xl"
        />
      </HudFrame>
      <p className="mt-3 text-caption text-fg-secondary">{label}</p>
    </div>
  );
}

/** Scene 2: three works made from one character reference, or three stills of one character. */
export function ReferenceScene({ index }: Numbered) {
  const t = useCopy(HOME).reference;
  const locale = useLocale();
  if (!REFERENCE_VISUAL) return null;
  const tiles =
    REFERENCE_VISUAL.kind === 'art'
      ? REFERENCE_VISUAL.images.map((image) => ({ key: image.key, node: <Still image={image} alt={t.stillAlt} /> }))
      : REFERENCE_VISUAL.works.map((work) => ({
          key: work.slug,
          node: (
            <img
              src={work.media.poster.src}
              srcSet={work.media.poster.srcSet}
              sizes="(min-width: 768px) 33vw, 100vw"
              width={work.media.poster.width}
              height={work.media.poster.height}
              alt={work.title[locale]}
              loading="lazy"
              decoding="async"
              className="size-full object-cover"
            />
          ),
        }));
  const badge = REFERENCE_VISUAL.kind === 'art' ? (REFERENCE_VISUAL.images[0]?.badge ?? 'mixed') : 'h3';
  return (
    <Scene id="reference" index={index} tag="REFERENCE" title={t.title} lead={t.lead}>
      <div className="relative mt-4 w-full max-w-[72rem] md:mt-8">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {tiles.map((tile, i) => (
            <li
              key={tile.key}
              className={cn(
                'home-tile capture-reveal relative overflow-hidden rounded-2xl border border-line-subtle bg-stage shadow-window',
                // Works and stills are both landscape (≈1.74:1): show them whole, never cropped to a portrait tile.
                'aspect-[1664/960]',
                i === 0 && 'col-span-2 md:col-span-1',
              )}
              style={{ '--i': i }}
            >
              {tile.node}
            </li>
          ))}
        </ul>
        <span className="pointer-events-none absolute top-2.5 left-2.5 z-10">
          <AiBadge variant={badge} />
        </span>
      </div>
    </Scene>
  );
}

function Still({ image, alt }: { image: ArtImage; alt: string }) {
  const { src, srcSet } = artSources(image.key, image.hidpi, image.width);
  return (
    <img
      src={src}
      {...(srcSet ? { srcSet, sizes: '(min-width: 768px) 33vw, 100vw' } : {})}
      width={image.width}
      height={image.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="size-full object-cover"
      style={{ objectPosition: image.focus }}
    />
  );
}

/** Scene "upscale": the same frame before and after the 2× upscale, compared with a slider. */
export function UpscaleScene({ index }: Numbered) {
  const t = useCopy(HOME).upscale;
  const [split, setSplit] = useState(50);
  if (!UPSCALE_PAIR) return null;
  const { before, after } = UPSCALE_PAIR;
  const image = (item: ArtImage, alt: string, style?: CSSProperties) => (
    <img
      src={artSources(item.key, false, item.width).src}
      width={item.width}
      height={item.height}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-cover"
      style={{ objectPosition: item.focus, ...style }}
    />
  );
  return (
    <Scene
      id="upscale"
      index={index}
      tag="UPSCALE"
      title={t.title}
      lead={t.lead}
      note={
        <Chip tone="info" icon={<Info aria-hidden />}>
          {t.status}
        </Chip>
      }
    >
      <figure className="capture-reveal relative mt-4 w-full max-w-[68rem] md:mt-8">
        <HudFrame label="ANIME4K · 2×">
          <div
            className="relative overflow-hidden rounded-xl bg-stage"
            style={{ aspectRatio: `${String(after.width)} / ${String(after.height)}` }}
          >
            {image(before, t.before)}
            {image(after, t.after, { clipPath: `inset(0 0 0 ${String(split)}%)` })}
            <span
              aria-hidden
              className="absolute inset-y-0 w-px bg-brand-cyan shadow-[0_0_12px_rgb(73_207_255)]"
              style={{ left: `${String(split)}%` }}
            />
            <span className="material-hud absolute top-3 left-3 rounded-full px-3 py-1 text-caption font-medium text-fg">
              {t.before}
            </span>
            <span className="material-hud absolute top-3 right-3 rounded-full px-3 py-1 text-caption font-medium text-fg">
              {t.after}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={split}
              aria-label={t.slider}
              onChange={(event) => {
                setSplit(Number(event.currentTarget.value));
              }}
              className="absolute inset-0 size-full cursor-ew-resize opacity-0"
            />
          </div>
        </HudFrame>
        <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-2 text-caption text-fg-secondary">
          {t.note}
          <AiBadge variant={after.badge} />
        </figcaption>
      </figure>
    </Scene>
  );
}

const LOCAL_ART = sceneArt('local') !== undefined;
const CLOSING_ART = sceneArt('start') !== undefined;

/**
 * Scene "local": three plain facts, then "can I use it today?". Its concept picture is the rooftop illustration above the
 * headline (HomePage); without it, the mark in a ring of light stands in (a concept picture, not an interface).
 */
export function LocalScene({ index }: Numbered) {
  const t = useCopy(HOME).local;
  const icons = [Cpu, House, FileCode2] as const;
  return (
    <Scene id="local" index={index} tag="LOCAL" title={t.title} lead={t.lead}>
      <div className="relative mt-6 grid w-full max-w-[60rem] justify-items-center gap-10 md:mt-10">
        {LOCAL_ART ? null : (
          <div className="reveal relative grid place-items-center">
            <span aria-hidden className="glow-backdrop absolute size-[20rem] max-w-[90vw] rounded-full" />
            <span aria-hidden className="home-ring absolute size-[11rem] rounded-full" />
            <BrandMark size={96} glow loading="lazy" className="relative" />
          </div>
        )}
        <ul className="grid w-full gap-3 sm:grid-cols-3 sm:gap-4">
          {t.points.map((point, i) => {
            const Icon = icons[i] ?? Cpu;
            return (
              <li
                key={point}
                className="home-tile reveal flex items-center gap-4 rounded-2xl border border-line-subtle bg-[rgb(7_11_20_/_0.72)] px-4 py-3.5 text-left shadow-edge sm:grid sm:justify-items-center sm:gap-3 sm:px-5 sm:py-6 sm:text-center"
                style={{ '--i': i }}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-action/25 bg-brand-gradient-soft text-brand-cyan">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-body font-medium text-balance-cjk text-fg">{point}</span>
              </li>
            );
          })}
        </ul>
        <div className="reveal grid max-w-[44rem] gap-2 rounded-2xl border border-line bg-surface px-5 py-4 text-left shadow-edge sm:px-6">
          <p className="text-body font-semibold text-fg">{t.question}</p>
          <p className="text-data text-fg-secondary">
            {t.answer}{' '}
            <a href="#license" className="font-medium text-action-fg underline-offset-4 hover:text-fg">
              {t.license}
            </a>
          </p>
        </div>
      </div>
    </Scene>
  );
}

/** Works preview: up to six published works in the Showcase card; press to play with sound. */
export function WorksScene({ index }: Numbered) {
  const t = useCopy(HOME).works;
  const locale = useLocale();
  if (PREVIEW_WORKS.length === 0) return null;
  return (
    <Scene id="works" index={index} tag="WORKS" title={t.title} lead={t.lead}>
      <ul className="mt-4 grid w-full gap-4 text-left sm:grid-cols-2 lg:grid-cols-3 md:mt-8">
        {PREVIEW_WORKS.map((work, i) => (
          <li key={work.slug} className="home-tile reveal min-w-0" style={{ '--i': i }}>
            <WorkCard
              entry={{ kind: 'work', work }}
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw"
              compact
              className="h-full"
            />
          </li>
        ))}
      </ul>
      <ButtonLink to={pagePath(locale, 'showcase')} variant="secondary" size="lg" icon={null} className="reveal mt-2">
        {t.seeAll}
        <ArrowRight aria-hidden />
      </ButtonLink>
    </Scene>
  );
}

/** The close: one line, the two ways in, what it needs; under the sea-of-clouds illustration (HomePage), else the mark. */
export function CtaScene() {
  const t = useCopy(HOME).cta;
  const locale = useLocale();
  return (
    <section aria-labelledby="start-title" className="home-scene relative isolate overflow-hidden">
      <div className="site-container grid justify-items-center gap-7 text-center">
        {CLOSING_ART ? null : (
          <div className="reveal relative grid place-items-center">
            <span aria-hidden className="glow-backdrop absolute size-[22rem] max-w-[90vw] rounded-full opacity-80" />
            <BrandMark size={88} glow loading="lazy" className="relative" />
          </div>
        )}
        <RevealText
          as="h2"
          id="start-title"
          text={t.title}
          on="view"
          className="home-hero-title max-w-[16ch] tracking-display text-balance-cjk text-fg"
        />
        <p className="reveal text-on-fx max-w-[34em] text-lead text-balance-cjk text-fg-secondary">{t.lead}</p>
        <div className="reveal flex flex-wrap justify-center gap-3">
          <ButtonLink
            href={LINKS.studioRepo}
            variant="primary"
            size="lg"
            icon={<GitHubMark className="size-4" />}
            className="home-cta"
          >
            {t.github}
          </ButtonLink>
          <ButtonLink to={pagePath(locale, 'tour')} variant="secondary" size="lg" icon={null}>
            {t.tour}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
        <HelpWanted className="reveal" />
        <p className="text-on-fx text-caption text-fg-secondary">{t.requirements}</p>
      </div>
    </section>
  );
}

/**
 * The intro film (INTRO_FILM_READY in data.ts): one 1080p video per locale with its lines designed into the picture, so it
 * has no WebVTT track (the film has no dialogue; the figcaption says what it shows).
 */
export function FilmScene() {
  const t = useCopy(HOME).film;
  return (
    <section id="film" aria-label={t.videoTitle} className="home-scene relative">
      <figure className="site-container reveal relative mx-auto grid w-full max-w-[60rem] gap-3">
        <HudFrame label="INTRO FILM">
          <FilmPlayer
            src={{ 'zh-hant': 'films/intro.zh-hant.mp4', ja: 'films/intro.ja.mp4', en: 'films/intro.en.mp4' }}
            // The video's own poster attribute: the film opens on black, so a poster drawn under the video would be hidden by
            // the first frame once metadata loads.
            poster="/images/home/film-poster.webp"
            title={t.videoTitle}
            badge="mixed"
          />
        </HudFrame>
        <figcaption className="text-data text-fg-secondary">{t.note}</figcaption>
      </figure>
    </section>
  );
}
