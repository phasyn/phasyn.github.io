// Whether any <video> on the page is playing, so decorative GPU effects can yield the GPU to video decoding and
// compositing.

const playing = new Set<HTMLVideoElement>();
const listeners = new Set<() => void>();
let installed = false;

function track(event: Event) {
  const video = event.target;
  if (!(video instanceof HTMLVideoElement)) return;
  const wasPlaying = isVideoPlaying();
  if (event.type === 'playing') playing.add(video);
  else playing.delete(video);
  if (wasPlaying !== isVideoPlaying()) for (const listener of listeners) listener();
}

/** True while at least one connected <video> is playing. */
export function isVideoPlaying(): boolean {
  // A video removed from the DOM mid-playback never sends `pause`.
  for (const video of playing) if (!video.isConnected) playing.delete(video);
  return playing.size > 0;
}

/** Calls `listener` whenever the page switches between "a video is playing" and "no video is playing". */
export function onVideoActivity(listener: () => void): () => void {
  if (!installed && typeof document !== 'undefined') {
    installed = true;
    // Media events don't bubble, so listen in the capture phase.
    for (const type of ['playing', 'pause', 'ended', 'emptied']) document.addEventListener(type, track, true);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
