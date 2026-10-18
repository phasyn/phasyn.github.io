import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { ITEMS } from './data.ts';

// WIP checkpoint: the full page (hero, gallery, breakdown, character, workflows, notes) replaces this.
export function ShowcasePage() {
  const locale = useLocale();
  const copy = commonCopy(locale);
  return (
    <section className="site-container grid min-h-[70dvh] content-center gap-6 pt-(--site-header-h)">
      <p className="eyebrow text-brand-cyan" lang="en">Phasyn Studio</p>
      <h1 className="text-display tracking-display text-balance-cjk text-fg">{copy.nav['showcase']}</h1>
      <ul className="grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <li key={item.slug}>
            <img src={item.media.image.src} srcSet={item.media.image.srcSet} sizes="(min-width: 640px) 33vw, 100vw" width={item.media.image.width} height={item.media.image.height} alt={item.title[locale]} loading="lazy" className="h-auto w-full rounded-xl" />
          </li>
        ))}
      </ul>
      <SourceSoon className="justify-self-start" />
    </section>
  );
}
