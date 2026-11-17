// Screen recordings of the real Phasyn Studio UI shown on the Tour page (English UI, recorded in a sandbox, private ids
// blurred). Each key has a web copy at <media base>/tour/<key>.mp4 (1920×1080, H.264, AAC music + UI sounds) and posters
// public/images/tour/<key>-poster.webp (1920 wide) + <key>-poster-960.webp; a recording appears only when its posters exist
// (scripts/site-assets.ts). Upload the mp4 to the media base together with the works.
export type TourVideoKey = 'character-to-shot' | 'pick-take' | 'edit' | 'export' | 'image-studio';
