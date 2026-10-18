import { ArrowDown } from 'lucide-react';
import type { CSSProperties } from 'react';
import { BrandMark } from '../../components/brand/BrandMark.tsx';
import { NebulaField, RevealText } from '../../components/fx/index.ts';
import { cn } from '../../lib/cn.ts';
import type { AboutCopy } from './copy.ts';
import { HeroDecode } from './motion.tsx';
import { useDisplayBreak, withBalance } from './parts.tsx';

/**
 * Hero art: the dedicated Codex About-header background (B2 `b02-about-header`, work/art/ASSETS.md): a nebula of
 * distant glass frames at both edges and a dark empty centre for the title. Change it here only.
 */
export const ABOUT_HERO_BACKGROUND = { src: '/images/about/b02-about-header-2560.webp', width: 2560, height: 1440 } as const;

/** Extra delay after the splash; RevealText `on="load"` already waits for it (`--fx-intro-delay`, 0 when skipped). */
const TITLE_DELAY_MS = 250;

// Canvas-coloured scrim: keeps the centre quiet behind the type and fades the scene into the page below.
const SCRIM = [
  'radial-gradient(46% 44% at 50% 48%, rgb(7 11 20 / 0.74), rgb(7 11 20 / 0.28) 70%, rgb(7 11 20 / 0) 100%)',
  'linear-gradient(to bottom, rgb(7 11 20 / 0.5), rgb(7 11 20 / 0) 20%, rgb(7 11 20 / 0) 62%, var(--color-canvas))',
].join(', ');
const MOBILE_SCRIM = 'radial-gradient(75% 36% at 50% 55%, rgb(7 11 20 / 0.6), rgb(7 11 20 / 0) 100%)';

/*
 * Entrances (transform/opacity only, collapse to static under reduced motion). `--hero-base` is the splash wait on a
 * first visit and 0 when <html> carries `fx-intro-skip`; each element adds its own `--hero-at`. RevealText bakes its
 * delay into each character, so the same skip shortens that delay with a more specific rule.
 */
const ENTER = 'motion-safe:[animation:rise-in_var(--duration-spring-smooth)_var(--ease-spring-smooth)_calc(var(--hero-base)_+_var(--hero-at,0ms))_backwards]';
const at = (ms: number) => ({ '--hero-at': `${ms}ms` }) as CSSProperties;

export function AboutHero({ copy, personalProject }: { copy: AboutCopy['hero']; personalProject: string }) {
  const display = useDisplayBreak();
  return (
    // The splash hold is the FX kit's --fx-intro-delay (0 when skipped or under reduced motion).
    <header className="relative isolate flex min-h-[max(36rem,100svh)] flex-col overflow-hidden pt-(--site-header-h) [--hero-base:var(--fx-intro-delay)]">
      {/* Living nebula (WebGL, pauses offscreen; a still frame under reduced motion, the brand space gradient without WebGL). */}
      <NebulaField position="absolute" intensity={1.3} particles={180} className="-z-30" />
      {/* The glass-frame art is screen-blended: its dark centre leaves the nebula alone, its frames add light. */}
      <img
        src={ABOUT_HERO_BACKGROUND.src}
        width={ABOUT_HERO_BACKGROUND.width}
        height={ABOUT_HERO_BACKGROUND.height}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="absolute inset-0 -z-20 size-full object-cover object-[30%_50%] mix-blend-screen select-none md:object-center"
      />
      <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: SCRIM }} />
      {/* Portrait crops put more of the nebula band behind the text: a second, phone-only scrim keeps it ≥ AA. */}
      <div aria-hidden className="absolute inset-0 -z-10 md:hidden" style={{ backgroundImage: MOBILE_SCRIM }} />

      <div className="site-container flex flex-1 flex-col items-center justify-center py-16 text-center md:py-20">
        <span className={ENTER} style={at(0)}>
          <BrandMark size={72} glow />
        </span>
        <p lang="en" className={cn('eyebrow mt-9 text-brand-cyan', ENTER)} style={at(120)}>
          <HeroDecode text={copy.eyebrow} />
        </p>
        <h1
          id="about-title"
          aria-label={copy.title.join('')}
          className={withBalance(
            cn('mt-5 max-w-[15em] text-display tracking-display text-fg md:text-hero'),
          )}
        >
          {copy.title.map((line, index) => (
            <RevealText key={line} text={line} on="load" delay={TITLE_DELAY_MS + index * 260} className="block" />
          ))}
        </h1>
        <p className={withBalance(cn('mt-7 max-w-[36em] text-lead text-fg-secondary', ENTER, display))} style={at(700)}>
          {copy.standfirst.map((sentence) => (
            <span key={sentence} className="block">
              {sentence}
            </span>
          ))}
        </p>
        <p className={cn('mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-data text-fg-secondary', ENTER)} style={at(900)}>
          <span className="sr-only">{copy.bylineLabel}: </span>
          <span className="font-semibold text-fg">DennySORA</span>
          <span aria-hidden className="text-fg-tertiary">
            ·
          </span>
          <span lang="en">Phasyn Studio</span>
          <span aria-hidden className="mx-1 hidden h-3.5 w-px bg-line-strong sm:block" />
          <span className="w-full text-fg-tertiary sm:w-auto">{personalProject}</span>
        </p>
      </div>

      <a
        href="#why"
        className={cn(
          'pressable mx-auto mb-7 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-caption text-fg-tertiary no-underline hover:bg-raised/60 hover:text-fg',
          ENTER,
        )}
        style={at(1100)}
      >
        {copy.startReading}
        <ArrowDown aria-hidden className="size-3.5" />
      </a>
    </header>
  );
}
