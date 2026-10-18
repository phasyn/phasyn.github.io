import { AtSign, Film, ScanSearch, Sparkles, Wand2, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { SpotlightCard } from '../../../components/fx/index.ts';
import { Chip } from '../../../components/ui/Chip.tsx';
import { useCopy } from '../../../i18n/locale.tsx';
import { cn } from '../../../lib/cn.ts';
import type { ArtKey } from '../art.ts';
import { ArtImage } from '../components/ArtImage.tsx';
import { RealScreen } from '../components/RealScreen.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME, type FeatureKey } from '../copy.ts';
import { SCREENS, type CropName, type ScreenKey } from '../screens.ts';

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

interface FeatureSpec {
  key: FeatureKey;
  /** The real screen that proves it; the card stays text-only until that capture exists (screens.ts). */
  screen: ScreenKey;
  crop?: CropName;
  art: ArtKey;
  Icon: LucideIcon;
  className: string;
  stagger?: 0 | 1 | 2;
}

const FEATURES: readonly FeatureSpec[] = [
  { key: 'imageStudio', screen: 'render-engine-image', crop: 'panel', art: 'imageStudio', Icon: Sparkles, className: 'md:col-span-2 lg:col-span-3' },
  { key: 'advisor', screen: 'prompt-advisor', art: 'advisor', Icon: Wand2, className: 'md:col-span-2 lg:col-span-3', stagger: 1 },
  { key: 'references', screen: 'references-mentions', art: 'reverse', Icon: AtSign, className: 'lg:col-span-2' },
  { key: 'timeline', screen: 'timeline-effects', art: 'timeline', Icon: Film, className: 'lg:col-span-2', stagger: 1 },
  { key: 'imageToPrompt', screen: 'image-to-prompt-result', art: 'reverse', Icon: ScanSearch, className: 'md:col-span-2 lg:col-span-2', stagger: 2 },
];

/**
 * Verified features only, as a bento of five. A card shows its real Phasyn Studio screen once the capture exists; until then it
 * is a text card — never an empty "capture pending" frame. Things that are in testing or coming live in the Lab section.
 */
export function FeaturesSection() {
  const t = useCopy(HOME).features;
  return (
    <section aria-labelledby="features-title" className="home-section relative">
      <div className="site-container">
        <SectionHeading id="features-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {FEATURES.map((feature) => {
            const card = t.cards[feature.key];
            const captured = SCREENS[feature.screen].capture !== undefined;
            const wide = feature.className.includes('lg:col-span-3');
            return (
              <Tile key={feature.key} className={feature.className} stagger={feature.stagger} tilt={wide ? 2.5 : 4}>
                <div className={cn('grid gap-6', captured && wide && 'lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:items-start')}>
                  <div className="grid content-start gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-[1.375rem] leading-tight font-semibold text-fg sm:text-[1.5rem]">{card.title}</h3>
                      <ArtImage art={feature.art} size={88} fallback={feature.Icon} className="-mt-3 -mr-3 hidden shrink-0 sm:block" />
                    </div>
                    <p className="text-reading text-fg-secondary">{card.body}</p>
                    {feature.key === 'imageStudio' ? (
                      <ul className="mt-1 flex flex-wrap gap-2">
                        {t.tags.map((tag) => (
                          <li key={tag}>
                            <Chip>{tag}</Chip>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    {feature.key === 'timeline' ? <p className="mt-1 text-caption leading-relaxed text-fg-tertiary">{t.spec}</p> : null}
                  </div>
                  {captured ? <RealScreen screen={feature.screen} crop={feature.crop} displayWidth="min(28rem, 88vw)" /> : null}
                </div>
              </Tile>
            );
          })}
        </div>
      </div>
    </section>
  );
}
