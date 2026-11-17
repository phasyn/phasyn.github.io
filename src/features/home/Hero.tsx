import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { GitHubMark } from '../../components/brand/ExternalMarks.tsx';
import { RevealText } from '../../components/fx/index.ts';
import { CaptureStage } from '../../components/media/CaptureStage.tsx';
import { AiBadge } from '../../components/ui/AiBadge.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { HelpWanted } from '../../components/ui/HelpWanted.tsx';
import { useCopy, useLocale } from '../../i18n/locale.tsx';
import type { ArtImage } from '../../lib/assets.ts';
import { cn } from '../../lib/cn.ts';
import { useHydrated, useReducedMotion } from '../../lib/hooks.ts';
import { mediaUrl } from '../../lib/media.ts';
import { useSaveData, useWorkSource } from '../../lib/works.ts';
import { artSources } from '../../site/art.ts';
import { LINKS, pagePath } from '../../site/config.ts';
import type { Work } from '../../site/works.ts';
import { HOME } from './copy.ts';
import { HERO, HERO_PORTRAIT } from './data.ts';

const at = (ms: number): CSSProperties => ({ '--home-at': `${String(ms)}ms` });

/**
 * The opening: one sentence, two ways in, and the strongest real picture there is (data.ts): a published work as a
 * full-bleed muted loop (its poster is the first paint), else a still, else the real Shot workspace under the type.
 */
export function Hero() {
  const fullBleed = HERO.kind === 'work' || HERO.kind === 'art';
  return (
    <section
      aria-labelledby="hero-title"
      className={cn(
        'home-hero relative isolate flex flex-col overflow-clip',
        fullBleed ? 'min-h-[100svh] justify-end' : 'pt-(--site-header-h)',
      )}
    >
      {HERO.kind === 'work' ? <HeroVideo work={HERO.work} /> : null}
      {HERO.kind === 'art' ? <HeroStill image={HERO.image} /> : null}
      {fullBleed ? <div aria-hidden className="home-hero-scrim absolute inset-0 -z-10" /> : null}
      <HeroCopy
        fullBleed={fullBleed}
        badge={HERO.kind === 'work' ? 'h3' : HERO.kind === 'art' ? HERO.image.badge : null}
      />
      {HERO.kind === 'capture' ? <HeroCapture /> : null}
    </section>
  );
}

function HeroCopy({ fullBleed, badge }: { fullBleed: boolean; badge: 'h3' | 'qwen' | 'mixed' | null }) {
  const locale = useLocale();
  const t = useCopy(HOME).hero;
  return (
    <div
      className={cn(
        'site-container relative grid gap-6',
        fullBleed
          ? 'pt-[calc(var(--site-header-h)+3rem)] pb-14 md:pb-20'
          : 'justify-items-center pt-[clamp(3.5rem,2rem+6vw,7rem)] text-center',
      )}
    >
      <div
        className={cn('home-in grid gap-6', fullBleed ? 'justify-items-start' : 'justify-items-center')}
        style={at(0)}
      >
        <HelpWanted />
      </div>
      <RevealText
        as="h1"
        id="hero-title"
        text={t.title}
        on="load"
        delay={80}
        className={cn(
          'home-hero-title tracking-display text-balance-cjk text-fg',
          fullBleed ? 'max-w-[14em] text-on-fx' : 'max-w-[13em]',
        )}
      />
      <p className={cn('home-in text-on-fx max-w-[34em] text-lead text-balance-cjk text-fg-secondary')} style={at(160)}>
        {t.lead}
      </p>
      <div className={cn('home-in flex flex-wrap items-center gap-3', !fullBleed && 'justify-center')} style={at(260)}>
        <ButtonLink to={pagePath(locale, 'tour')} variant="primary" size="lg" icon={null} className="home-cta">
          {t.works}
          <ArrowRight aria-hidden />
        </ButtonLink>
        <ButtonLink href={LINKS.studioRepo} variant="secondary" size="lg" icon={<GitHubMark className="size-4" />}>
          {t.github}
        </ButtonLink>
      </div>
      {fullBleed && badge ? (
        <p
          className="home-in flex flex-wrap items-center gap-2 text-caption text-fg-secondary md:absolute md:right-(--site-gutter) md:bottom-6 md:justify-end"
          style={at(400)}
        >
          <span className="text-on-fx">{t.madeWith}</span>
          <AiBadge variant={badge} />
        </p>
      ) : null}
    </div>
  );
}

function HeroCapture() {
  const t = useCopy(HOME).hero;
  return (
    <div className="site-container home-in relative mt-12 pb-[clamp(3rem,2rem+4vw,6rem)] md:mt-16" style={at(420)}>
      <div className="relative mx-auto max-w-[72rem]">
        <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-x-[8%] -inset-y-[12%] -z-10" />
        <CaptureStage
          capture="shot-workspace"
          alt={t.captureAlt}
          eager
          reveal={false}
          displayWidth="min(100vw, 72rem)"
        />
      </div>
    </div>
  );
}

/** Portrait screens (taller than 3:4) get the portrait still, so a phone never shows a narrow slice of a wide one. */
const PORTRAIT = '(max-aspect-ratio: 3/4)';

function HeroStill({ image }: { image: ArtImage }) {
  const { src, srcSet } = artSources(image.key, image.hidpi, image.width);
  const portrait = HERO_PORTRAIT ? artSources(HERO_PORTRAIT.key, HERO_PORTRAIT.hidpi, HERO_PORTRAIT.width) : null;
  return (
    <picture>
      {HERO_PORTRAIT && portrait ? (
        <source
          media={PORTRAIT}
          srcSet={portrait.srcSet ?? portrait.src}
          sizes="100vw"
          width={HERO_PORTRAIT.width}
          height={HERO_PORTRAIT.height}
        />
      ) : null}
      <img
        src={src}
        {...(srcSet ? { srcSet, sizes: '100vw' } : {})}
        width={image.width}
        height={image.height}
        alt=""
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="home-hero-media home-hero-still absolute inset-0 -z-20 size-full object-cover select-none"
        style={{
          '--home-focus': image.focus,
          ...(HERO_PORTRAIT ? { '--home-portrait-focus': HERO_PORTRAIT.focus } : {}),
        }}
      />
    </picture>
  );
}

/**
 * The featured work as a backdrop: the poster paints first (it is the LCP); the video (1280-wide copy on phones, the
 * 2560 master on large screens) attaches after hydration and plays muted in a loop only while on screen, never under reduced
 * motion or Save-Data. Decorative: the work itself, with sound and controls, is on the Showcase page.
 */
function HeroVideo({ work }: { work: Work }) {
  const src = useWorkSource(work);
  const saveData = useSaveData();
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const live = hydrated && !reduced && !saveData;

  useEffect(() => {
    const video = videoRef.current;
    if (!live || !video) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
    };
  }, [live, src]);

  return (
    <div aria-hidden className="home-hero-media absolute inset-0 -z-20">
      <img
        src={work.media.poster.src}
        srcSet={work.media.poster.srcSet}
        sizes="100vw"
        width={work.media.poster.width}
        height={work.media.poster.height}
        alt=""
        decoding="async"
        fetchPriority="high"
        className="absolute inset-0 size-full object-cover"
      />
      {live ? (
        <video
          ref={videoRef}
          src={mediaUrl(src)}
          muted
          loop
          playsInline
          preload="metadata"
          disablePictureInPicture
          tabIndex={-1}
          onPlaying={() => {
            setPlaying(true);
          }}
          className={cn(
            'absolute inset-0 size-full object-cover transition-opacity duration-700',
            playing ? 'opacity-100' : 'opacity-0',
          )}
        />
      ) : null}
    </div>
  );
}
