import { FlaskConical, ScanSearch, ShieldCheck, Sparkles, UsersRound, Wand2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { SpotlightCard } from '../../../components/fx/index.ts';
import { Chip } from '../../../components/ui/Chip.tsx';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import { REAL } from '../art.ts';
import { ArtImage } from '../components/ArtImage.tsx';
import { RealScreen } from '../components/RealScreen.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME } from '../copy.ts';

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

/** The swap wizard's real step names, exactly as the English UI writes them (decorative; the body text says them in the locale). */
const SWAP_STEPS = ['Source video', 'Characters', 'Scene-Cut Detection', 'Segment Plan', 'Output & Create'] as const;

function SwapSteps() {
  return (
    <ol lang="en" aria-hidden className="mt-6 grid gap-2.5">
      {SWAP_STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-3 text-data text-fg-secondary">
          <span className="machine grid size-6 shrink-0 place-items-center rounded-full border border-line-strong text-[11px] text-fg-tertiary">{index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

/**
 * Feature bento: five tiles. Every UI in them is a real Phasyn Studio screen (RealScreen; "real capture pending" until the capture
 * exists) and every image is real output.
 */
export function FeaturesSection() {
  const t = useCopy(HOME).features;
  const common = commonCopy(useLocale());
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
            <RealScreen screen="image-to-prompt-result" className="mt-7" displayWidth="min(46rem, 88vw)" />
          </Tile>

          <Tile className="lg:col-span-2" stagger={1}>
            <ArtImage art="swap" size={128} fallback={UsersRound} className="-mt-2 -ml-2" />
            <div className="mt-2 grid gap-3">
              <TileHeading title={t.swap.title}>
                <Chip tone="warning" icon={<FlaskConical aria-hidden />}>
                  {common.inTesting}
                </Chip>
              </TileHeading>
              <p className="text-reading text-fg-secondary">{t.swap.body}</p>
            </div>
            <SwapSteps />
            <p className="mt-6 flex items-start gap-2 rounded-xl border border-line-subtle bg-sunken/60 px-3.5 py-3 text-caption leading-relaxed text-fg-secondary">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-cyan" aria-hidden />
              {t.swap.note}
            </p>
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
            <RealScreen screen="prompt-advisor" crop="panel" className="mt-6" displayWidth="min(24rem, 88vw)" />
          </Tile>

          <Tile className="md:col-span-2 lg:col-span-4" tilt={2.5} stagger={1}>
            <div className="flex items-start justify-between gap-6">
              <div className="grid max-w-[36rem] gap-3">
                <TileHeading title={t.timeline.title} />
                <p className="text-reading text-fg-secondary">{t.timeline.body}</p>
              </div>
              <ArtImage art="timeline" size={124} fallback={Sparkles} className="-mt-3 -mr-3 hidden sm:block" />
            </div>
            <RealScreen screen="timeline-effects" className="mt-7" displayWidth="min(46rem, 88vw)" />
          </Tile>

          <Tile className="md:col-span-2 lg:col-span-6" tilt={2}>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12">
              <div className="grid content-start gap-3">
                <div className="flex items-start justify-between gap-4">
                  <TileHeading title={t.imageStudio.title} />
                  <ArtImage art="imageStudio" size={96} fallback={Sparkles} className="-mt-2 -mr-2 hidden sm:block lg:hidden" />
                </div>
                <p className="max-w-[44ch] text-reading text-fg-secondary">{t.imageStudio.body}</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {t.imageStudio.chips.map((chip) => (
                    <li key={chip}>
                      <Chip>{chip}</Chip>
                    </li>
                  ))}
                  <li>
                    <Chip tone="info">
                      {t.imageStudio.removeBackground} · {common.coming}
                    </Chip>
                  </li>
                </ul>
              </div>
              <figure className="grid gap-3">
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
                      sizes="(min-width: 80rem) 330px, (min-width: 52.5rem) 45vw, 90vw"
                      className="aspect-[12/7] w-full rounded-xl border border-line-subtle bg-stage object-cover"
                    />
                  ))}
                </div>
                <figcaption className="text-caption leading-relaxed text-fg-tertiary">{t.imageStudio.caption}</figcaption>
              </figure>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
