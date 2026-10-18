import './showcase.css';
import { Breakdown } from './Breakdown.tsx';
import { CharacterSection } from './CharacterSection.tsx';
import { Closing, Notes } from './Closing.tsx';
import { Gallery } from './Gallery.tsx';
import { ShowcaseHero } from './ShowcaseHero.tsx';
import { Workflows } from './Workflows.tsx';

/**
 * Showcase: real Phasyn Studio output only, generated through the controller API on the author's two machines / three
 * GPUs. Hero (claim, totals computed from the items, featured theatre) → gallery (films row, filters, every result with
 * its run facts) → one prompt → still → clip breakdown with the machine timeline → character consistency → workflows →
 * honest notes → closing. Every section renders complete in the prerendered HTML; motion is layered on top and collapses
 * to the same content under prefers-reduced-motion.
 */
export function ShowcasePage() {
  return (
    <>
      <ShowcaseHero />
      <Gallery />
      <Breakdown />
      <CharacterSection />
      <Workflows />
      <Notes />
      <Closing />
    </>
  );
}
