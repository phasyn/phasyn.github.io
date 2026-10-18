import { useSyncExternalStore } from 'react';
import { useCopy } from '../../../i18n/locale.tsx';
import { useHydrated, useReducedMotion } from '../../../lib/hooks.ts';
import { HOME } from '../copy.ts';
import { ManifestoGrid } from './manifesto/ManifestoGrid.tsx';
import { ManifestoScene } from './manifesto/ManifestoScene.tsx';

const TALL = '(min-height: 560px)';

function subscribeTall(onChange: () => void) {
  const query = window.matchMedia(TALL);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Pinned scenes need room: on short viewports (landscape phones) the still composition reads better. */
function useTallViewport(): boolean {
  return useSyncExternalStore(
    subscribeTall,
    () => window.matchMedia(TALL).matches,
    () => false,
  );
}

/**
 * Why Phasyn exists, in the author's words: five pain points, then the turn. With motion allowed on a tall enough viewport it is
 * a pinned, game-like scene (ManifestoScene); the prerendered HTML, reduced motion and short viewports get the still grid of pain
 * cards and the final statement (ManifestoGrid). Both carry the same text in the same order.
 */
export function ManifestoSection() {
  const t = useCopy(HOME).manifesto;
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const tall = useTallViewport();
  return hydrated && !reducedMotion && tall ? <ManifestoScene t={t} /> : <ManifestoGrid t={t} />;
}
