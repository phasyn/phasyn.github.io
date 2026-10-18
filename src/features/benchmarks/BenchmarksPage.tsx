import { Suspense } from 'react';
import { ExperimentsSection, MethodSection } from './sections/Closing.tsx';
import { DitSection } from './sections/DitSection.tsx';
import { BenchHero } from './sections/Hero.tsx';
import { JumpNav, StepTicker, Takeaways } from './sections/Overview.tsx';
import { ReferencesSection } from './sections/References.tsx';
import { SpeedSection } from './sections/SpeedTable.tsx';
import { TodaySection } from './sections/Today.tsx';

/*
 * Benchmarks page: a brand-moment hero (local nebula, load reveal, HUD stat tiles), then data sections on near-solid
 * canvas bands — takeaways, the speed tables (the core), today's runs, the DiT variants and the reference-cost view —
 * closing with method and the experiment index. Everything a reader needs is in the prerendered HTML; the full row set loads after hydration.
 * The boundary lets the page hydrate once its locale's copy module has loaded (the layout hydrates independently).
 */
export function BenchmarksPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <BenchHero />
      <StepTicker />
      <JumpNav />
      <Takeaways />
      <SpeedSection />
      <TodaySection />
      <DitSection />
      <ReferencesSection />
      <MethodSection />
      <ExperimentsSection />
    </Suspense>
  );
}
