import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';

// Placeholder until the about page is built.
export function AboutPage() {
  const copy = commonCopy(useLocale());
  return (
    <section className="site-container grid min-h-[70dvh] content-center gap-6 pt-(--site-header-h)">
      <p className="eyebrow text-brand-cyan" lang="en">Phasyn Studio</p>
      <h1 className="text-display tracking-display text-balance-cjk text-fg">{copy.nav['about']}</h1>
      <SourceSoon className="justify-self-start" />
    </section>
  );
}
