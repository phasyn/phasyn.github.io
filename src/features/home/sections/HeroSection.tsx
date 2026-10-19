import { ArrowRight, Play, UserRound } from 'lucide-react';
import { useCallback, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { RevealText } from '../../../components/fx/index.ts';
import { buttonClass, ButtonLink } from '../../../components/ui/Button.tsx';
import { AiBadge } from '../../../components/ui/AiBadge.tsx';
import { Chip } from '../../../components/ui/Chip.tsx';
import { SourceSoon } from '../../../components/ui/SourceSoon.tsx';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { supportsWebGL, useHydrated, useReducedMotion } from '../../../lib/hooks.ts';
import { pagePath } from '../../../site/config.ts';
import { MotionToggle } from '../components/MotionToggle.tsx';
import { HOME } from '../copy.ts';
import { HeroStage, prefersPoster } from '../hero/HeroStage.tsx';

/**
 * 100dvh launch moment: the frame-stack scene (or its poster) behind the copy — what it is (H1), what it does (two-line
 * subhead), and where to go (film, outputs, numbers). Copy sits left of the stack on landscape viewports and under it on
 * portrait ones. Where the live scene runs, the hero is pinned so the scroll drives the camera into the film strip of real
 * stills; poster-only devices (reduced motion, no WebGL, touch-first, Save-Data, ≤4 GB) get a plain first screen.
 */
export function HeroSection() {
  const locale = useLocale();
  const t = useCopy(HOME).hero;
  const common = commonCopy(locale);
  const reduced = useReducedMotion();
  const hydrated = useHydrated();
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [live, setLive] = useState(false);
  const posterOnly = hydrated && (reduced || prefersPoster() || !supportsWebGL());

  // "Watch the film": smooth scroll where motion is allowed, then move focus to the film for keyboard users.
  const onWatch = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById('film');
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      target.focus({ preventScroll: true });
      history.replaceState(null, '', '#film');
    },
    [reduced],
  );

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="home-hero relative" {...(posterOnly ? { 'data-static': '' } : {})}>
      <div className="home-hero-pin relative isolate flex min-h-dvh flex-col overflow-clip">
        <HeroStage sectionRef={sectionRef} userPaused={paused} onLiveChange={setLive} className="-z-20" />
        <div aria-hidden className="home-hero-scrim pointer-events-none absolute inset-0 -z-10" />

        <div className="site-container relative flex flex-1 flex-col justify-center pt-[calc(var(--site-header-h)+2.5rem)] pb-20 [@media(max-aspect-ratio:1/1)]:justify-end [@media(max-aspect-ratio:1/1)]:pb-14">
          <div className="home-hero-copy grid max-w-[40rem] justify-items-start gap-6 [@media(max-aspect-ratio:1/1)]:max-w-[34rem]">
            <p className="home-hero-in text-on-fx flex items-center gap-3 text-[0.9375rem] font-medium text-fg-secondary" style={{ '--home-in': '0ms' } as CSSProperties}>
              <span aria-hidden className="home-eyebrow-line w-10" />
              {t.brand}
            </p>
            <RevealText
              as="h1"
              id="hero-title"
              text={t.title}
              on="load"
              delay={80}
              className="text-[clamp(2.4rem,1.4rem+3.4vw,4.5rem)] leading-[1.06] font-[650] tracking-display text-balance-cjk text-fg"
            />
            <p className="home-hero-in text-on-fx max-w-[30em] text-lead text-fg-secondary" style={{ '--home-in': '150ms' } as CSSProperties}>
              <span className="block">{t.lead[0]}</span>
              <span className="block text-balance-cjk">{t.lead[1]}</span>
            </p>
            <div className="home-hero-in mt-2 flex flex-wrap items-center gap-x-3 gap-y-3" style={{ '--home-in': '250ms' } as CSSProperties}>
              <a href="#film" onClick={onWatch} className={buttonClass('primary', 'lg', 'home-cta')}>
                <Play className="fill-current" aria-hidden />
                {t.watch}
              </a>
              <ButtonLink to={pagePath(locale, 'showcase')} variant="secondary" size="lg" icon={null}>
                {t.showcase}
                <ArrowRight aria-hidden />
              </ButtonLink>
              <Link
                to={pagePath(locale, 'benchmarks')}
                viewTransition
                className="group inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-body font-medium text-action-fg no-underline hover:text-fg"
              >
                {t.numbers}
                <ArrowRight className="size-4 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <div className="home-hero-in flex flex-wrap items-center gap-2" style={{ '--home-in': '300ms' } as CSSProperties}>
              <Chip icon={<UserRound aria-hidden />}>{common.personalProject}</Chip>
              <SourceSoon />
            </div>
          </div>
        </div>

        {/* Only where the live scene can reach its film strip of real stills. */}
        {live ? (
          <p className="home-hero-strip pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-wrap items-center justify-center gap-2 px-(--site-gutter) text-center text-caption text-fg-secondary">
            <AiBadge variant="qwen" />
            <span className="material-hud inline-flex min-h-7 items-center gap-2 rounded-full px-3">
              <span aria-hidden className="size-1.5 rounded-full bg-success" />
              {t.strip}
            </span>
          </p>
        ) : null}

        {live && !reduced ? (
          <MotionToggle
            paused={paused}
            onToggle={() => setPaused((value) => !value)}
            pauseLabel={t.pause}
            playLabel={t.play}
            className="absolute right-(--site-gutter) bottom-6 z-10"
          />
        ) : null}
      </div>
    </section>
  );
}
