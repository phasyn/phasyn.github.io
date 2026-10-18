import { useSyncExternalStore } from 'react';
import { useCopy } from '../../../i18n/locale.tsx';
import { useHydrated, useReducedMotion } from '../../../lib/hooks.ts';
import { HOME } from '../copy.ts';
import { ManifestoGrid } from './manifesto/ManifestoGrid.tsx';
import { ManifestoScene } from './manifesto/ManifestoScene.tsx';

/** The pinned scene needs a tablet-sized or larger, tall enough viewport; phones get the still composition. */
const STAGE = '(min-width: 768px) and (min-height: 560px)';

function subscribeStage(onChange: () => void) {
  const query = window.matchMedia(STAGE);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function useStageViewport(): boolean {
  return useSyncExternalStore(
    subscribeStage,
    () => window.matchMedia(STAGE).matches,
    () => false,
  );
}

/**
 * Why Phasyn exists, in the author's words: five pain points, then the turn. With motion allowed on a tall enough viewport it is
 * a pinned, game-like scene (ManifestoScene); the prerendered HTML, reduced motion, phones and short viewports get the still
 * composition (ManifestoGrid: a single-column log on phones, pain cards from md up, then the final statement). Both carry the same text in the same order.
 */
export function ManifestoSection() {
  const t = useCopy(HOME).manifesto;
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const stage = useStageViewport();
  return hydrated && !reducedMotion && stage ? <ManifestoScene t={t} /> : <ManifestoGrid t={t} />;
}
