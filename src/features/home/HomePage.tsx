import './home.css';
import { SectionSeam } from './components/SectionHeading.tsx';
import { BenchmarksSection } from './sections/BenchmarksSection.tsx';
import { ClosingSection } from './sections/ClosingSection.tsx';
import { FeaturesSection } from './sections/FeaturesSection.tsx';
import { HeroSection } from './sections/HeroSection.tsx';
import { LabSection } from './sections/LabSection.tsx';
import { MadeWithSection } from './sections/MadeWithSection.tsx';
import { ManifestoSection } from './sections/ManifestoSection.tsx';
import { PipelineSection } from './sections/PipelineSection.tsx';
import { ProofStrip } from './sections/ProofStrip.tsx';
import { UnderTheHoodSection } from './sections/UnderTheHoodSection.tsx';
import { UsableTodaySection } from './sections/UsableTodaySection.tsx';

/**
 * phasyn.dev Home, in the order of the marketing review (desire → trust → action): hero → proof numbers → made with Phasyn
 * Studio (film and real clips) → why (condensed) → pipeline → verified features → under the hood (architecture + diagnostics)
 * → benchmarks → in the lab → can I use it today → follow. Every section renders complete in the prerendered HTML; motion is
 * layered on top and collapses to the same content under prefers-reduced-motion.
 */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <ProofStrip />
      <MadeWithSection />
      <SectionSeam />
      <ManifestoSection />
      <SectionSeam />
      <PipelineSection />
      <SectionSeam />
      <FeaturesSection />
      <SectionSeam />
      <UnderTheHoodSection />
      <SectionSeam />
      <BenchmarksSection />
      <LabSection />
      <UsableTodaySection />
      <ClosingSection />
    </>
  );
}
