import { AudioLines, CircleDashed, CircleDot, Gauge, Layers, Puzzle, ScanLine, SlidersHorizontal, type LucideIcon } from 'lucide-react';
import { SpotlightCard } from '../../../components/fx/index.ts';
import { Chip } from '../../../components/ui/Chip.tsx';
import { cn } from '../../../lib/cn.ts';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import type { ArtKey } from '../art.ts';
import { ArtImage } from '../components/ArtImage.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME, type RoadmapKey } from '../copy.ts';

type Status = 'inDevelopment' | 'planned';

/**
 * Statuses follow the author's own wording (docs/about-statement.zh-hant.md): multi-level rendering 「正在開發」, TTS 「也開發了一套」,
 * super-resolution/interpolation 「一樣在整合中」 → in development; sliders, broader model support and VAE/DiT optimisation are
 * described as future work → planned. Nothing here is shipped.
 */
const ITEMS: { key: RoadmapKey; art: ArtKey; icon: LucideIcon; status: Status }[] = [
  { key: 'render', art: 'roadmap.render', icon: Layers, status: 'inDevelopment' },
  { key: 'voice', art: 'roadmap.voice', icon: AudioLines, status: 'inDevelopment' },
  { key: 'upscale', art: 'roadmap.upscale', icon: ScanLine, status: 'inDevelopment' },
  { key: 'sliders', art: 'roadmap.sliders', icon: SlidersHorizontal, status: 'planned' },
  { key: 'models', art: 'roadmap.extensibility', icon: Puzzle, status: 'planned' },
  { key: 'optimise', art: 'roadmap.optimise', icon: Gauge, status: 'planned' },
];

export function RoadmapSection() {
  const locale = useLocale();
  const t = useCopy(HOME).roadmap;
  const common = commonCopy(locale);
  return (
    <section aria-labelledby="roadmap-title" className="site-section relative">
      <div className="site-container">
        <SectionHeading id="roadmap-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {ITEMS.map(({ key, art, icon, status }, index) => {
            const item = t.items[key];
            const column = index % 3;
            return (
              <li key={key} className={cn('reveal min-w-0', column === 1 && 'home-stagger-1', column === 2 && 'home-stagger-2')}>
                <SpotlightCard tilt={5} className="flex h-full flex-col gap-4 rounded-3xl border-line-subtle p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <ArtImage art={art} size={104} fallback={icon} className="-mt-2 -ml-2" />
                  {status === 'inDevelopment' ? (
                    <Chip tone="info" icon={<CircleDot aria-hidden />}>
                      {common.inDevelopment}
                    </Chip>
                  ) : (
                    <Chip icon={<CircleDashed aria-hidden />}>{common.planned}</Chip>
                  )}
                </div>
                <h3 className="text-[1.3rem] leading-tight font-semibold text-fg">{item.title}</h3>
                <p className="text-body leading-relaxed text-fg-secondary">{item.body}</p>
                </SpotlightCard>
              </li>
            );
          })}
        </ul>
        <p className="reveal mt-8 text-caption text-fg-tertiary">{t.note}</p>
      </div>
    </section>
  );
}
