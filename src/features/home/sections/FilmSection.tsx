import { HudFrame, NebulaField } from '../../../components/fx/index.ts';
import { FilmPlayer } from '../../../components/media/FilmPlayer.tsx';
import { useCopy } from '../../../i18n/locale.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';

/**
 * The intro film (71.5 s, burned-in locale cut, WebVTT captions) inside a HUD frame, over a local nebula. Poster first: no ambient
 * loop until a light films/ambient.mp4 exists — the full film (~36 MB) only loads when someone presses play.
 */
export function FilmSection() {
  const t = useCopy(HOME).film;
  return (
    <section id="film" tabIndex={-1} aria-labelledby="film-title" className="site-section relative isolate overflow-hidden outline-none">
      <NebulaField position="absolute" intensity={0.9} particles={90} className="[mask-image:linear-gradient(180deg,transparent,#000_25%,#000_70%,transparent)]" />
      <div className="site-container relative grid gap-12 md:gap-16">
        <SectionHeading id="film-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} align="center" />
        <div className="reveal relative mx-auto w-full max-w-[70rem]">
          <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-x-[10%] -inset-y-[18%] -z-10 opacity-70" />
          <HudFrame label="INTRO FILM" orbit innerClassName="rounded-[1.4rem]">
            <FilmPlayer
              src={{ 'zh-hant': 'films/intro.zh-hant.mp4', ja: 'films/intro.ja.mp4', en: 'films/intro.en.mp4' }}
              captions={{ 'zh-hant': '/captions/films/intro.zh-hant.vtt', ja: '/captions/films/intro.ja.vtt', en: '/captions/films/intro.en.vtt' }}
              poster="/brand/backgrounds/hero.webp"
              title={t.videoTitle}
            />
          </HudFrame>
        </div>
      </div>
    </section>
  );
}
