import './showcase.css';
import { Gallery } from './Gallery.tsx';
import { ShowcaseHero } from './ShowcaseHero.tsx';

/**
 * Showcase: real Phasyn Studio output only. Hero (claim, measured totals, featured theatre) → gallery (films row, filters,
 * every result with its run facts) → … Every section renders complete in the prerendered HTML; motion is layered on top.
 */
export function ShowcasePage() {
  return (
    <>
      <ShowcaseHero />
      <Gallery />
    </>
  );
}
