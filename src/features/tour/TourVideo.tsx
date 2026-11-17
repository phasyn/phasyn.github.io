import { FilmPlayer } from '../../components/media/FilmPlayer.tsx';
import type { TourVideo as TourVideoAsset } from '../../lib/assets.ts';
import { useSaveData } from '../../lib/works.ts';

interface TourVideoProps {
  video: TourVideoAsset;
  /** What the recording shows (also the video's accessible name). */
  caption: string;
  ui: { note: string; playWithSound: string };
}

/**
 * One screen recording of the real app, with its music and UI sounds, in the site's film player: the responsive poster
 * paints first; while on screen the recording loops muted as a preview (not under reduced motion or Save-Data). The big
 * "play with sound" button starts it over from the beginning with sound and brings up play/pause, the seek bar with the
 * time, mute and full screen (keyboard: Space/K, ← →, M, F). Only one film plays with sound at a time across the page.
 */
export function TourVideo({ video, caption, ui }: TourVideoProps) {
  const saveData = useSaveData();
  const { poster } = video;
  return (
    <figure className="m-0 min-w-0">
      <FilmPlayer
        src={video.path}
        poster={poster.src}
        posterSet={{ srcSet: poster.srcSet, sizes: '(min-width: 1024px) 60rem, 100vw' }}
        title={caption}
        aspect={`${String(poster.width)} / ${String(poster.height)}`}
        ambient={!saveData}
        startLabel={ui.playWithSound}
        badge="screen"
        className="rounded-xl border border-line shadow-edge"
      />
      <figcaption className="mt-3 grid gap-1">
        <span className="text-caption font-semibold text-brand-cyan">{ui.note}</span>
        <span className="text-data text-fg-secondary">{caption}</span>
      </figcaption>
    </figure>
  );
}
