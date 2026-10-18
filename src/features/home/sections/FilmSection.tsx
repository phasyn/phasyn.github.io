import { FilmPlayer } from '../../../components/media/FilmPlayer.tsx';
import { useCopy } from '../../../i18n/locale.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';

/** The intro film. Until it is rendered the player shows its poster and the "in preparation" state. */
export function FilmSection() {
  const t = useCopy(HOME).film;
  return (
    <section id="film" aria-labelledby="film-title" className="site-section relative scroll-mt-4">
      <div className="site-container grid gap-12 md:gap-16">
        <SectionHeading id="film-title" headingTabIndex={-1} eyebrow={t.eyebrow} title={t.title} lead={t.lead} align="center" />
        <div className="reveal relative mx-auto w-full max-w-[70rem]">
          <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-x-[10%] -inset-y-[18%] -z-10 opacity-70" />
          <div className="relative rounded-[1.6rem] p-px [background:linear-gradient(140deg,rgb(73_207_255_/_0.45),rgb(62_137_255_/_0.12)_38%,rgb(114_125_255_/_0.1)_62%,rgb(171_123_255_/_0.4))]">
            <FilmPlayer
              src={{ 'zh-hant': 'films/intro.zh-hant.mp4', ja: 'films/intro.ja.mp4', en: 'films/intro.en.mp4' }}
              poster="/brand/backgrounds/hero.webp"
              title={t.videoTitle}
              ambient
            />
          </div>
        </div>
      </div>
    </section>
  );
}
