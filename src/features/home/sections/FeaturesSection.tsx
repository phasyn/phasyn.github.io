import { FlaskConical, Languages, Lightbulb, ScanSearch, Sparkles, UsersRound, Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { SpotlightCard } from '../../../components/fx/index.ts';
import { AppWindow, IllustrativeBadge, MockChip, TimelineStrip, useMockPlayback } from '../../../components/mock/index.ts';
import { Chip } from '../../../components/ui/Chip.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import { HTML_LANG, LOCALES } from '../../../site/config.ts';
import { REAL } from '../art.ts';
import { ArtImage } from '../components/ArtImage.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME, LANG_NAMES, MOCK_UI } from '../copy.ts';

/**
 * Feature tile: the FX kit's SpotlightCard (pointer light, glare, gentle tilt) inside a wrapper that owns the scroll reveal,
 * so the reveal animation and the tilt never write the same transform.
 */
function Tile({ className, tilt = 4, stagger = 0, children }: { className?: string; tilt?: number; stagger?: 0 | 1 | 2; children: ReactNode }) {
  return (
    <div className={cn('reveal min-w-0', stagger === 1 && 'home-stagger-1', stagger === 2 && 'home-stagger-2', className)}>
      <SpotlightCard tilt={tilt} className="h-full rounded-3xl border-line-subtle">
        <article className="relative flex h-full min-w-0 flex-col p-6 before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(120%_70%_at_0%_0%,rgb(62_137_255_/_0.09),transparent_62%)] sm:p-8">
          {children}
        </article>
      </SpotlightCard>
    </div>
  );
}

function TileHeading({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <h3 className="text-[1.375rem] leading-tight font-semibold text-fg sm:text-[1.5rem]">{title}</h3>
      {children}
    </div>
  );
}

const STILL_ORDER = ['ocean', 'cliff', 'rain', 'portrait'] as const;

function ReverseMock({ label }: { label: string }) {
  return (
    <AppWindow title="Inference Studio · Image to Prompt" label={label} className="mt-7">
      <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative overflow-hidden rounded-lg border border-line-subtle bg-stage" style={{ aspectRatio: '1152 / 672' }}>
          <img src={REAL.stills.rain.small} alt="" width={384} height={224} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
          <span className="absolute top-2 left-2 rounded-full bg-sunken/80 px-2 py-0.5 text-[10px] text-fg-secondary">Source Image</span>
        </div>
        <div className="grid content-start gap-2">
          <span className="text-[11px] font-semibold text-fg-secondary">{MOCK_UI.sceneCandidates}</span>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
            {MOCK_UI.sections.map((section, index) => (
              <li key={section} className="grid gap-1">
                <span className="truncate text-[11px] text-fg-tertiary">{section}</span>
                <span className="block h-1.5 rounded-full bg-raised" style={{ width: `${92 - ((index * 17) % 40)}%` }} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppWindow>
  );
}

function SwapSteps() {
  return (
    <ol lang="en" aria-hidden className="mt-6 grid gap-2.5">
      {MOCK_UI.swapSteps.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-data text-fg-secondary">
          <span className="machine grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-[11px] text-fg-tertiary">{index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

function AdvisorMock() {
  return (
    <div lang="en" className="mt-6 grid gap-3 rounded-xl border border-line-subtle bg-sunken p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-semibold text-fg-secondary">{MOCK_UI.advisorTitle}</span>
        <IllustrativeBadge />
      </div>
      <div className="grid gap-2 rounded-lg border border-line bg-surface p-3">
        <span className="flex items-start gap-2 text-data text-fg">
          <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-info" aria-hidden />
          {MOCK_UI.advisorFinding}
        </span>
        <span className="flex items-center gap-2">
          <MockChip tone="info">{MOCK_UI.official}</MockChip>
          <span className="ml-auto inline-flex h-6 items-center rounded-md border border-line-strong bg-raised px-2 text-[11px] text-fg">{MOCK_UI.applyFix}</span>
        </span>
      </div>
    </div>
  );
}

function TimelineMock({ label }: { label: string }) {
  const play = useMockPlayback<HTMLDivElement>({ threshold: 0.5 });
  const clips = STILL_ORDER.map((key, index) => ({
    id: key,
    start: index * 5.17,
    end: (index + 1) * 5.17,
    index: index + 1,
    title: MOCK_UI.clipTitles[index] ?? '',
    thumb: REAL.stills[key].small,
  }));
  return (
    <div ref={play.ref} className="mt-7">
      <AppWindow title={MOCK_UI.videoEdit} label={label}>
        <div className="grid gap-3 p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {MOCK_UI.effects.map((effect) => (
              <span key={effect} className="rounded-full border border-line-subtle bg-sunken px-2 py-0.5 text-[11px] text-fg-secondary">
                {effect}
              </span>
            ))}
            <span className="ml-auto inline-flex h-7 items-center rounded-md border border-line-strong bg-raised px-2.5 text-[11px] text-fg">{MOCK_UI.exportSequence}</span>
          </div>
          <TimelineStrip
            duration={20.68}
            tickEvery={4}
            video={clips}
            audio={[{ id: 'a', start: 0, end: 20.68, seed: 5 }]}
            playing={play.armed && play.seen}
            paused={!play.visible}
            staticAt={0.32}
          />
        </div>
      </AppWindow>
    </div>
  );
}

function LanguagesVisual() {
  const locale = useLocale();
  return (
    <div className="mt-7 grid gap-1.5">
      {LOCALES.map((code, index) => (
        <span
          key={code}
          lang={HTML_LANG[code]}
          className={cn(
            'text-[clamp(1.75rem,1.2rem+1.6vw,2.6rem)] leading-[1.15] font-semibold',
            code === locale ? 'text-brand-gradient' : 'text-fg-tertiary/70',
          )}
        >
          {LANG_NAMES[index]}
        </span>
      ))}
    </div>
  );
}

/** Feature bento: six tiles with real output and labelled illustrative UI. */
export function FeaturesSection() {
  const t = useCopy(HOME).features;
  return (
    <section aria-labelledby="features-title" className="site-section relative">
      <div className="site-container">
        <SectionHeading id="features-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          <Tile className="md:col-span-2 lg:col-span-4" tilt={2.5}>
            <div className="flex items-start justify-between gap-6">
              <div className="grid max-w-[36rem] gap-3">
                <TileHeading title={t.reverse.title} />
                <p className="text-reading text-fg-secondary">{t.reverse.body}</p>
                <p className="flex items-center gap-2 text-caption text-fg-tertiary">
                  <ScanSearch className="size-3.5 shrink-0" aria-hidden />
                  {t.reverse.note}
                </p>
              </div>
              <ArtImage art="reverse" size={132} fallback={ScanSearch} className="-mt-3 -mr-3 hidden sm:block" />
            </div>
            <ReverseMock label={t.mockLabels.reverse} />
          </Tile>

          <Tile className="lg:col-span-2" stagger={1}>
            <ArtImage art="swap" size={128} fallback={UsersRound} className="-mt-2 -ml-2" />
            <div className="mt-2 grid gap-3">
              <TileHeading title={t.swap.title}>
                <Chip tone="warning" icon={<FlaskConical aria-hidden />}>
                  {t.swap.status}
                </Chip>
              </TileHeading>
              <p className="text-reading text-fg-secondary">{t.swap.body}</p>
            </div>
            <SwapSteps />
          </Tile>

          <Tile className="lg:col-span-2">
            <ArtImage art="advisor" size={128} fallback={Wand2} className="-mt-2 -ml-2" />
            <div className="mt-2 grid gap-3">
              <TileHeading title={t.advisor.title} />
              <p className="text-reading text-fg-secondary">{t.advisor.body}</p>
              <p className="flex items-center gap-2 text-caption font-medium text-action-fg">
                <Sparkles className="size-3.5" aria-hidden />
                {t.advisor.sources}
              </p>
            </div>
            <AdvisorMock />
          </Tile>

          <Tile className="md:col-span-2 lg:col-span-4" tilt={2.5} stagger={1}>
            <div className="flex items-start justify-between gap-6">
              <div className="grid max-w-[36rem] gap-3">
                <TileHeading title={t.timeline.title} />
                <p className="text-reading text-fg-secondary">{t.timeline.body}</p>
              </div>
              <ArtImage art="timeline" size={124} fallback={Sparkles} className="-mt-3 -mr-3 hidden sm:block" />
            </div>
            <TimelineMock label={t.mockLabels.timeline} />
          </Tile>

          <Tile className="lg:col-span-3">
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-3">
                <TileHeading title={t.imageStudio.title} />
                <p className="text-reading text-fg-secondary">{t.imageStudio.body}</p>
              </div>
              <ArtImage art="imageStudio" size={96} fallback={Sparkles} className="-mt-2 -mr-2 hidden sm:block" />
            </div>
            <ul className="mt-5 flex flex-wrap gap-2">
              {t.imageStudio.chips.map((chip) => (
                <li key={chip}>
                  <Chip>{chip}</Chip>
                </li>
              ))}
              <li>
                <Chip tone="info">
                  {t.imageStudio.removeBackground} · {t.imageStudio.coming}
                </Chip>
              </li>
            </ul>
            <figure className="mt-6 grid gap-3">
              <div className="grid grid-cols-2 gap-2">
                {STILL_ORDER.map((key) => (
                  <img
                    key={key}
                    src={REAL.stills[key].src}
                    alt=""
                    width={REAL.stills[key].width}
                    height={REAL.stills[key].height}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 80rem) 280px, (min-width: 52.5rem) 45vw, 90vw"
                    className="aspect-[12/7] w-full rounded-xl border border-line-subtle bg-stage object-cover"
                  />
                ))}
              </div>
              <figcaption className="text-caption text-fg-tertiary">{t.imageStudio.caption}</figcaption>
            </figure>
          </Tile>

          <Tile className="lg:col-span-3" stagger={1}>
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-3">
                <TileHeading title={t.languages.title} />
                <p className="text-reading text-fg-secondary">{t.languages.body}</p>
              </div>
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl border border-action/25 bg-brand-gradient-soft text-brand-cyan">
                <Languages className="size-5" />
              </span>
            </div>
            <LanguagesVisual />
          </Tile>
        </div>
      </div>
    </section>
  );
}
