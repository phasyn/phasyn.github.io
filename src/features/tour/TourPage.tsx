import './tour.css';
import { ArrowRight, Clapperboard, MessageCircleQuestion } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DecodeText, HudFrame, NebulaField, RevealText } from '../../components/fx/index.ts';
import { CaptureStage } from '../../components/media/CaptureStage.tsx';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { HelpWanted } from '../../components/ui/HelpWanted.tsx';
import { useLocale } from '../../i18n/locale.tsx';
import { hasCapture, tourVideo } from '../../lib/assets.ts';
import { cn } from '../../lib/cn.ts';
import type { CaptureKey } from '../../site/captures.ts';
import { pagePath } from '../../site/config.ts';
import type { TourVideoKey } from '../../site/tour-videos.ts';
import { SECTION_IDS, TOUR, type Faq, type SectionId, type TourCopy } from './copy.ts';
import { TourVideo } from './TourVideo.tsx';

/** Latin HUD tag per topic (decorative). */
const TAGS: Record<SectionId, string> = {
  shots: 'SHOTS · TAKES',
  references: 'REFERENCES',
  edit: 'EDIT',
  render: 'RENDER',
  export: 'EXPORT',
  plugins: 'PLUGINS',
  image: 'IMAGE STUDIO',
  records: 'RECORDS',
};

/** Real captures per topic, in order; those not in public/images/ui are left out (the topic is then text only). */
const SECTION_CAPTURES: Record<SectionId, readonly CaptureKey[]> = {
  shots: ['shot-workspace', 'shot-takes-compare'],
  references: ['prompt-suggestions'],
  edit: ['edit-workspace'],
  render: ['render-queue'],
  export: ['export-dialog'],
  plugins: ['plugin-manager'],
  image: ['image-studio'],
  records: [],
};

/**
 * The screen recording that leads a topic, chosen by what it actually shows (src/site/tour-videos.ts); a topic shows it only
 * when its posters exist. Render and plugins have no recording yet; records never will.
 */
const SECTION_VIDEO: Partial<Record<SectionId, TourVideoKey>> = {
  shots: 'pick-take',
  references: 'character-to-shot',
  edit: 'edit',
  export: 'export',
  image: 'image-studio',
};

/** The focus region of each capture (src/site/captures.ts); phones zoom onto it. */
const SPOT_REGION: Partial<Record<CaptureKey, string>> = {
  'shot-workspace': 'takes',
  'prompt-suggestions': 'suggestions',
  'edit-workspace': 'timeline',
  'export-dialog': 'options',
};

/**
 * Tour: the detailed guide. Hero → eight topics beside a sticky index (each: one line, the real capture you can enlarge,
 * short points, a question or two) → where next. Complete in the prerendered HTML. A topic with a screen
 * recording leads with it and keeps its captures below as a second look; recordings and captures appear only when their
 * files exist.
 */
export function TourPage() {
  const t = TOUR[useLocale()];
  const active = useActiveSection();
  return (
    <>
      <TourHero t={t} />
      <div className="relative isolate before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[linear-gradient(180deg,rgb(7_11_20_/_0),rgb(7_11_20_/_0.8)_8rem,rgb(7_11_20_/_0.8)_calc(100%_-_8rem),rgb(7_11_20_/_0))]">
        <div className="site-container lg:grid lg:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] lg:gap-x-12 xl:gap-x-16">
          <TopicIndex t={t} active={active} />
          <div className="min-w-0 lg:col-start-2 lg:row-start-1">
            {SECTION_IDS.map((id, i) => (
              <Topic key={id} id={id} number={i + 1} t={t} />
            ))}
          </div>
        </div>
      </div>
      <Closing t={t} />
    </>
  );
}

function TourHero({ t }: { t: TourCopy }) {
  return (
    <section aria-labelledby="tour-title" className="relative isolate overflow-hidden">
      <NebulaField
        position="absolute"
        intensity={1.1}
        particles={140}
        className="-z-20 [mask-image:linear-gradient(180deg,#000_60%,transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_50%_45%,rgb(7_11_20_/_0.82),rgb(7_11_20_/_0.5)_60%,rgb(7_11_20_/_0)_100%)]"
      />
      <div className="site-container grid justify-items-center gap-6 pt-[calc(var(--site-header-h)+clamp(3.5rem,2rem+5vw,6.5rem))] pb-[clamp(3rem,2rem+4vw,6rem)] text-center">
        <p aria-hidden lang="en" className="tour-in eyebrow flex items-center gap-3 text-brand-cyan">
          <span className="tour-line" />
          <DecodeText text="TOUR · 08 TOPICS" duration={1000} afterIntro />
          <span className="tour-line [transform-origin:right_center]" />
        </p>
        <RevealText
          as="h1"
          id="tour-title"
          text={t.hero.title}
          on="load"
          delay={150}
          className="max-w-[14ch] text-hero tracking-display text-balance-cjk text-fg"
        />
        <p className="tour-in text-on-fx max-w-[34em] text-lead text-balance-cjk text-fg-secondary">{t.hero.lead}</p>
        <p className="tour-in inline-flex items-center gap-2 rounded-full border border-line-strong bg-[rgb(7_11_20_/_0.8)] px-3.5 py-1.5 text-caption text-fg-secondary">
          <Clapperboard aria-hidden className="size-4 text-brand-cyan" />
          {t.hero.recording}
        </p>
        <p className="tour-in text-on-fx max-w-[40em] text-caption text-fg-secondary">{t.hero.requirements}</p>
      </div>
    </section>
  );
}

/** Which topic is under the reading line (40–45 % down the viewport); null above the first one and on the server. */
function useActiveSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);
  useEffect(() => {
    const targets = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const crossing = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id);
          else crossing.delete(entry.target.id);
        }
        const current = SECTION_IDS.find((id) => crossing.has(id));
        if (current) setActive(current);
        else if ((targets[0]?.getBoundingClientRect().top ?? 0) > window.innerHeight * 0.45) setActive(null);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    for (const target of targets) observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, []);
  return active;
}

function TopicIndex({ t, active }: { t: TourCopy; active: SectionId | null }) {
  const link = (id: SectionId, i: number, compact: boolean) => {
    const current = id === active;
    return (
      <a
        href={`#${id}`}
        aria-current={current ? 'location' : undefined}
        className={cn(
          'pressable no-underline',
          compact
            ? cn(
                'inline-flex h-9 items-center gap-2 rounded-full border px-3 text-data',
                current
                  ? 'border-action/50 bg-brand-gradient-soft text-fg'
                  : 'border-line-strong bg-raised/70 text-fg-secondary hover:text-fg',
              )
            : cn(
                'relative grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline rounded-lg px-3 py-2 text-data',
                current ? 'bg-brand-gradient-soft text-fg' : 'text-fg-secondary hover:bg-raised/60 hover:text-fg',
              ),
        )}
      >
        <span
          aria-hidden
          lang="en"
          className={cn('machine text-[11px]', current ? 'text-brand-cyan' : 'text-fg-tertiary')}
        >
          {String(i + 1).padStart(2, '0')}
        </span>
        <span className={compact ? 'whitespace-nowrap' : 'min-w-0 font-medium'}>{t.sections[id].title}</span>
      </a>
    );
  };
  return (
    <>
      <nav aria-label={t.index} className="sticky top-(--site-header-h) z-30 -mx-(--site-gutter) lg:hidden">
        <ol className="flex gap-2 overflow-x-auto border-b border-line-subtle bg-[rgb(7_11_20_/_0.9)] px-(--site-gutter) py-2.5 backdrop-blur-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTION_IDS.map((id, i) => (
            <li key={id} className="shrink-0">
              {link(id, i, true)}
            </li>
          ))}
        </ol>
      </nav>
      <aside className="hidden lg:col-start-1 lg:row-start-1 lg:block">
        <div className="sticky top-[calc(var(--site-header-h)+2.5rem)] pt-20">
          <HudFrame label="TOPICS · 08" innerClassName="bg-[rgb(7_11_20_/_0.74)] backdrop-blur-md">
            <nav aria-label={t.index} className="p-2 pt-4">
              <ol className="grid gap-0.5">
                {SECTION_IDS.map((id, i) => (
                  <li key={id}>{link(id, i, false)}</li>
                ))}
              </ol>
            </nav>
          </HudFrame>
        </div>
      </aside>
    </>
  );
}

function Topic({ id, number, t }: { id: SectionId; number: number; t: TourCopy }) {
  const captures = SECTION_CAPTURES[id].filter(hasCapture);
  const videoKey = SECTION_VIDEO[id];
  const asset = videoKey ? tourVideo(videoKey) : undefined;
  const video = videoKey && asset ? { asset, caption: t.videos[videoKey] } : undefined;
  const section = t.sections[id];
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="tour-topic scroll-mt-[calc(var(--site-header-h)+4.5rem)] py-16 first:pt-12 md:py-24 lg:scroll-mt-[calc(var(--site-header-h)+1.5rem)] lg:first:pt-24"
    >
      <header className="grid gap-4">
        <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
          <span className="machine">{String(number).padStart(2, '0')}</span>
          <span className="tour-line" />
          {TAGS[id]}
        </p>
        <RevealText
          as="h2"
          id={`${id}-title`}
          text={section.title}
          on="view"
          className="text-display tracking-display text-balance-cjk text-fg"
        />
        <p className="reveal max-w-[36em] text-lead text-balance-cjk text-fg-secondary">{section.summary}</p>
      </header>

      {video ? (
        <div className="relative mt-9 md:mt-11">
          <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-[6%] -z-10 opacity-70" />
          <TourVideo video={video.asset} caption={video.caption} ui={t.video} />
        </div>
      ) : null}

      {captures.length > 0 ? (
        <div
          className={cn(
            'grid gap-8',
            video ? 'mt-8 md:grid-cols-2 md:gap-6' : 'mt-9 md:mt-11',
            !video && captures.length > 1 && 'xl:grid-cols-2 xl:gap-6',
          )}
        >
          {captures.map((key) => (
            <div key={key} className="relative">
              {video ? null : (
                <div aria-hidden className="glow-backdrop pointer-events-none absolute -inset-[6%] -z-10 opacity-70" />
              )}
              <CaptureStage
                capture={key}
                alt={t.captures[key]}
                steps={spotOf(key, t)}
                displayWidth={video || captures.length > 1 ? 'min(100vw, 30rem)' : 'min(100vw, 60rem)'}
              />
              <p className="mt-3 text-caption text-fg-secondary">{t.captures[key]}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-9 grid gap-8 md:mt-11 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] xl:gap-10">
        {'groups' in section ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {section.groups.map((group, i) => (
              <li
                key={group.title}
                className="tour-card reveal grid content-start gap-1.5 rounded-xl border border-line-subtle bg-surface/80 p-4 shadow-edge"
                style={{ '--i': i }}
              >
                <h3 className="text-body font-semibold text-fg">{group.title}</h3>
                <p className="text-data text-fg-secondary">{group.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="grid content-start gap-3">
            {section.points.map((point) => (
              <li key={point} className="reveal flex gap-3 text-body text-fg-secondary">
                <span
                  aria-hidden
                  className="mt-[0.68em] size-1.5 shrink-0 rounded-full bg-brand-cyan shadow-[0_0_8px_rgb(73_207_255)]"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
        <FaqList title={t.faqTitle} items={section.faq} />
      </div>
    </section>
  );
}

function FaqList({ title, items }: { title: string; items: readonly Faq[] }) {
  if (items.length === 0) return null;
  return (
    <div className="reveal grid content-start gap-4 rounded-2xl border border-line bg-[rgb(7_11_20_/_0.6)] p-5">
      <p className="flex items-center gap-2 text-caption font-semibold text-fg-tertiary">
        <MessageCircleQuestion aria-hidden className="size-4 text-brand-cyan" />
        {title}
      </p>
      <dl className="grid gap-4">
        {items.map((item) => (
          <div key={item.q} className="grid gap-1">
            <dt className="text-data font-semibold text-fg">{item.q}</dt>
            <dd className="text-data text-fg-secondary">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Closing({ t }: { t: TourCopy }) {
  const locale = useLocale();
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden">
      <div className="site-container site-section grid justify-items-center gap-7 text-center">
        <RevealText
          as="h2"
          id="closing-title"
          text={t.closing.title}
          on="view"
          className="max-w-[18ch] text-display tracking-display text-balance-cjk text-fg"
        />
        <div className="reveal flex flex-wrap justify-center gap-3">
          <ButtonLink to={pagePath(locale, 'about')} variant="primary" size="lg" icon={null}>
            {t.closing.about}
            <ArrowRight aria-hidden />
          </ButtonLink>
        </div>
        <HelpWanted className="reveal" />
      </div>
    </section>
  );
}

function spotOf(key: CaptureKey, t: TourCopy) {
  const region = SPOT_REGION[key];
  const label = t.spots[key];
  return region && label ? [{ region, label }] : [];
}
