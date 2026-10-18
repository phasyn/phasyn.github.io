import { ArrowRight, Play, UserRound } from 'lucide-react';
import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { buttonClass, ButtonLink } from '../../../components/ui/Button.tsx';
import { Chip } from '../../../components/ui/Chip.tsx';
import { SourceSoon } from '../../../components/ui/SourceSoon.tsx';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { useReducedMotion } from '../../../lib/hooks.ts';
import { pagePath } from '../../../site/config.ts';
import { MotionToggle } from '../components/MotionToggle.tsx';
import { HOME } from '../copy.ts';
import { HeroStage } from '../hero/HeroStage.tsx';

/**
 * 100dvh launch moment: the frame-stack scene (or its poster) behind the copy. Copy sits left of the stack on landscape
 * viewports and under it on portrait ones (the scene uses the same aspect-ratio switch). The copy drifts up and fades as the
 * hero scrolls away (CSS scroll timeline, static elsewhere).
 */
export function HeroSection() {
  const locale = useLocale();
  const t = useCopy(HOME).hero;
  const common = commonCopy(locale);
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [live, setLive] = useState(false);

  // "Watch the film": smooth scroll where motion is allowed, then move focus to the film heading for keyboard users.
  const onWatch = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      const target = document.getElementById('film');
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      document.getElementById('film-title')?.focus({ preventScroll: true });
      history.replaceState(null, '', '#film');
    },
    [reduced],
  );

  return (
    <section ref={sectionRef} aria-labelledby="hero-title" className="home-hero relative isolate flex min-h-dvh flex-col overflow-clip">
      <HeroStage sectionRef={sectionRef} userPaused={paused} onLiveChange={setLive} className="-z-20" />
      <div aria-hidden className="home-hero-scrim pointer-events-none absolute inset-0 -z-10" />

      <div className="site-container relative flex flex-1 flex-col justify-center pt-[calc(var(--site-header-h)+2.5rem)] pb-20 [@media(max-aspect-ratio:1/1)]:justify-end [@media(max-aspect-ratio:1/1)]:pb-14">
        <div className="home-hero-copy grid max-w-[38rem] justify-items-start gap-6 [@media(max-aspect-ratio:1/1)]:max-w-[34rem]">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-fg-secondary">
            <span className="h-px w-10 bg-brand-gradient" />
            {t.eyebrow}
          </p>
          <h1 id="hero-title" className="text-hero tracking-display text-balance-cjk text-fg">
            {t.title}
          </h1>
          <p className="max-w-[34ch] text-lead text-fg-secondary">{t.lead}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <a href="#film" onClick={onWatch} className={buttonClass('primary', 'lg')}>
              <Play className="fill-current" aria-hidden />
              {t.watch}
            </a>
            <ButtonLink to={pagePath(locale, 'tour')} variant="secondary" size="lg" icon={null}>
              {t.tour}
              <ArrowRight aria-hidden />
            </ButtonLink>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Chip icon={<UserRound aria-hidden />}>{common.personalProject}</Chip>
            <SourceSoon />
          </div>
        </div>
      </div>

      {live && !reduced ? (
        <MotionToggle
          paused={paused}
          onToggle={() => setPaused((value) => !value)}
          pauseLabel={t.pause}
          playLabel={t.play}
          className="absolute right-(--site-gutter) bottom-6 z-10"
        />
      ) : null}
    </section>
  );
}
