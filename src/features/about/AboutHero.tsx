import { ArrowDown } from 'lucide-react';
import { BrandMark } from '../../components/brand/BrandMark.tsx';
import { cn } from '../../lib/cn.ts';
import type { AboutCopy } from './copy.ts';
import { stagger, useDisplayBreak, withBalance } from './parts.tsx';

/**
 * Hero art: the dedicated Codex About-header background (B2 `b02-about-header`, work/art/ASSETS.md): a nebula of
 * distant glass frames at both edges and a dark empty centre for the title. Change it here only.
 */
export const ABOUT_HERO_BACKGROUND = { src: '/images/about/b02-about-header-2560.webp', width: 2560, height: 1440 } as const;

// Canvas-coloured scrim: keeps the centre quiet behind the type and fades the art into the page below.
const SCRIM = [
  'radial-gradient(48% 46% at 50% 47%, rgb(7 11 20 / 0.6), rgb(7 11 20 / 0) 100%)',
  'linear-gradient(to bottom, rgb(7 11 20 / 0.45), rgb(7 11 20 / 0) 20%, rgb(7 11 20 / 0) 64%, var(--color-canvas))',
].join(', ');

export function AboutHero({ copy, personalProject }: { copy: AboutCopy['hero']; personalProject: string }) {
  const display = useDisplayBreak();
  return (
    <header className="relative isolate flex min-h-[max(36rem,100svh)] flex-col overflow-hidden bg-canvas pt-(--site-header-h)">
      <img
        src={ABOUT_HERO_BACKGROUND.src}
        width={ABOUT_HERO_BACKGROUND.width}
        height={ABOUT_HERO_BACKGROUND.height}
        alt=""
        aria-hidden
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="absolute inset-0 -z-20 size-full object-cover object-[30%_50%] select-none md:object-center"
      />
      <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: SCRIM }} />

      <div className="site-container flex flex-1 flex-col items-center justify-center py-16 text-center md:py-20">
        <BrandMark size={72} glow className="motion-safe:animate-rise-in" />
        <p lang="en" className="eyebrow mt-9 text-brand-cyan motion-safe:animate-rise-in" style={stagger(2)}>
          {copy.eyebrow}
        </p>
        <h1
          id="about-title"
          className={withBalance(cn('mt-5 max-w-[15em] text-display tracking-display text-fg motion-safe:animate-rise-in md:text-hero', display))}
          style={stagger(4)}
        >
          {copy.title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>
        <p className={withBalance(cn('mt-7 max-w-[36em] text-lead text-fg-secondary motion-safe:animate-rise-in', display))} style={stagger(6)}>
          {copy.standfirst.map((sentence) => (
            <span key={sentence} className="block">
              {sentence}
            </span>
          ))}
        </p>
        <p
          className="mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-data text-fg-secondary motion-safe:animate-rise-in"
          style={stagger(8)}
        >
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
        className="pressable mx-auto mb-7 inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-caption text-fg-tertiary no-underline hover:bg-raised/60 hover:text-fg"
      >
        {copy.startReading}
        <ArrowDown aria-hidden className="size-3.5" />
      </a>
    </header>
  );
}
