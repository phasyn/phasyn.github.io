import './home.css';
import { SectionSeam } from './components/SectionHeading.tsx';
import { ArchitectureSection } from './sections/ArchitectureSection.tsx';
import { BenchmarksSection } from './sections/BenchmarksSection.tsx';
import { ClosingSection } from './sections/ClosingSection.tsx';
import { DiagnosticsSection } from './sections/DiagnosticsSection.tsx';
import { FeaturesSection } from './sections/FeaturesSection.tsx';
import { FilmSection } from './sections/FilmSection.tsx';
import { HeroSection } from './sections/HeroSection.tsx';
import { ManifestoSection } from './sections/ManifestoSection.tsx';
import { MeasuredTicker } from './sections/MeasuredTicker.tsx';
import { PipelineSection } from './sections/PipelineSection.tsx';
import { RoadmapSection } from './sections/RoadmapSection.tsx';

/**
 * phasyn.dev Home: hero (three.js frame stack) → measured ticker → film → manifesto → pipeline story → features →
 * distributed architecture → diagnostics and agent → benchmarks → roadmap → closing. Every section renders complete in the
 * prerendered HTML; motion is layered on top and collapses to the same content under prefers-reduced-motion.
 */
export function HomePage() {
  return (
    <>
      <HeroSection />
      <MeasuredTicker />
      <FilmSection />
      <SectionSeam />
      <ManifestoSection />
      <SectionSeam />
      <PipelineSection />
      <SectionSeam />
      <FeaturesSection />
      <SectionSeam />
      <ArchitectureSection />
      <SectionSeam />
      <DiagnosticsSection />
      <SectionSeam />
      <BenchmarksSection />
      <SectionSeam />
      <RoadmapSection />
      <ClosingSection />
    </>
  );
}
