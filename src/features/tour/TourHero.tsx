import { ArrowDown, Bot } from 'lucide-react';
import type { CSSProperties, MouseEvent } from 'react';
import { DecodeText, HudFrame, NebulaField, RevealText } from '../../components/fx/index.ts';
import { buttonClass } from '../../components/ui/Button.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { useReducedMotion } from '../../lib/hooks.ts';
import { CHAPTERS, TOTAL_LENGTH } from './chapters.ts';
import type { TourCopy } from './copy.ts';
import { ScreenViewer } from './screens/ScreenViewer.tsx';
import { CaptureBadge } from '../../components/ui/CaptureBadge.tsx';
import { captureBadge } from '../../site/captures.ts';

const at = (ms: number) => ({ '--tour-in': `${ms}ms` }) as CSSProperties;

/**
 * Launch moment: a local nebula behind the title (character reveal after the first-visit splash), the promise, the numbers,
 * the two ways in, and a real Image Studio capture as the product shot. Entrances are CSS (static under reduced motion).
 */
export function TourHero({ t }: { t: TourCopy }) {
  const reducedMotion = useReducedMotion();
  const minutes = Math.round(TOTAL_LENGTH / 60);
  const stats = [
    { value: String(CHAPTERS.length), label: t.hero.stats.chapters, approx: false },
    { value: String(minutes), label: t.hero.stats.minutes, approx: true },
    { value: '3', label: t.hero.stats.gpus, sub: t.hero.stats.gpusSub, approx: false },
  ];

  // In-page jumps: smooth where motion is allowed, focus to the target heading for keyboard users.
  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    target.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    history.replaceState(history.state, '', `#${id}`);
  };

  return (
    <section aria-labelledby="tour-title" className="relative isolate overflow-hidden">
      <NebulaField position="absolute" intensity={1.2} particles={160} className="-z-20 [mask-image:linear-gradient(180deg,#000_62%,transparent)]" />
      {/* Legibility scrim under the copy: the nebula band can run bright behind it (copy ≥ AA on the composited background). */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(72%_48%_at_50%_30%,rgb(7_11_20_/_0.86),rgb(7_11_20_/_0.58)_58%,rgb(7_11_20_/_0)_100%)]" />

      <div className="site-container grid justify-items-center gap-6 pt-[calc(var(--site-header-h)+4.5rem)] pb-10 text-center md:pt-[calc(var(--site-header-h)+6rem)]">
        <p aria-hidden lang="en" className="tour-hero-in eyebrow flex items-center gap-3 text-brand-cyan" style={at(0)}>
          <span className="tour-eyebrow-line hidden w-10 sm:inline-block" />
          <DecodeText text={t.hero.eyebrow} duration={1100} afterIntro />
          <span className="tour-eyebrow-line hidden w-10 [transform-origin:right_center] sm:inline-block" />
        </p>
        <RevealText as="h1" id="tour-title" text={t.hero.title} on="load" delay={150} className="max-w-[16ch] text-hero tracking-display text-balance-cjk text-fg" />
        <p className="tour-hero-in max-w-[40ch] text-lead text-balance-cjk text-fg-secondary" style={at(700)}>
          {t.hero.lead}
        </p>

        <dl className="tour-hero-in mt-1 grid w-full max-w-[26rem] grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line-subtle" style={at(850)}>
          {stats.map((stat) => (
            <div key={stat.label} className="grid content-start justify-items-center gap-0.5 bg-[rgb(7_11_20_/_0.78)] px-2 py-3 sm:px-4">
              <dt className="order-2 text-caption text-fg-tertiary">
                {stat.label}
                {stat.sub ? <span className="block text-[11px] leading-4 text-fg-tertiary/80">{stat.sub}</span> : null}
              </dt>
              <dd className="order-1 font-mono text-[1.75rem] leading-none font-semibold text-fg tabular-nums">
                {stat.approx ? <span className="mr-1 text-[0.6em] text-fg-tertiary">≈</span> : null}
                <DecodeText text={stat.value} duration={700} delay={300} afterIntro />
              </dd>
            </div>
          ))}
        </dl>

        <div className="tour-hero-in mt-2 flex flex-wrap items-center justify-center gap-3" style={at(1000)}>
          <a href="#c1" onClick={(event) => jump(event, 'c1')} className={buttonClass('primary', 'lg', 'tour-cta')}>
            {t.hero.start}
            <ArrowDown aria-hidden />
          </a>
          <a href="#agent" onClick={(event) => jump(event, 'agent')} className={buttonClass('secondary', 'lg')}>
            <Bot aria-hidden />
            {t.hero.agent}
          </a>
        </div>
        {/* Solid backing: the chip's tint alone falls below AA over the bright nebula. */}
        <span className="tour-hero-in inline-flex rounded-full bg-canvas">
          <SourceSoon />
        </span>
      </div>

      <figure className="site-container tour-hero-in grid justify-items-center gap-4 pb-20 md:pb-28" style={at(500)}>
        <div className="relative w-full max-w-[68rem]">
          <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-x-[8%] -inset-y-[14%] -z-10 opacity-75" />
          {/* The capture shows a generated still: its AI disclosure is the one real-screen label (src/site/captures.ts). */}
          <HudFrame label={captureBadge('image-studio-takes') ? 'IMAGE STUDIO' : 'REAL CAPTURE · IMAGE STUDIO'} orbit innerClassName="rounded-[1.15rem]">
            <ScreenViewer capture="image-studio-takes" alt={t.hero.capture} eager drift pending={{ title: t.screens.pendingTitle, body: t.screens.pendingBody }} />
            <CaptureBadge capture="image-studio-takes" className="top-3 left-3 max-w-[calc(100%-1.5rem)]" />
          </HudFrame>
        </div>
        <figcaption className="rounded-full bg-[rgb(7_11_20_/_0.82)] px-3 py-1 text-data text-fg-secondary">{t.hero.capture}</figcaption>
      </figure>
    </section>
  );
}
