// Large media (films, demo recordings) is hosted outside the Pages artifact.
// During review it is served from `public/media/` (git-ignored); after approval
// the build sets VITE_MEDIA_BASE to the Hugging Face dataset's resolve URL.
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE as string | undefined)?.replace(/\/$/, '') ?? '/media';

export function mediaUrl(path: string): string {
  return `${MEDIA_BASE}/${path.replace(/^\//, '')}`;
}
