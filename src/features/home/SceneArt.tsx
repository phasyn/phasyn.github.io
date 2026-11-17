import { AiBadge } from '../../components/ui/AiBadge.tsx';
import type { ArtImage } from '../../lib/assets.ts';
import { cn } from '../../lib/cn.ts';
import { artSources } from '../../site/art.ts';

interface SceneArtProps {
  image: ArtImage;
  /** `band` opens a scene with a real capture; `tall` is the picture of the scene itself (your own computer, the close). */
  size?: 'band' | 'tall';
}

/**
 * The illustration that opens a Home scene: a full-bleed band (at most the still's own 1664 px, never upscaled) whose edges
 * fade into the night. The next scene's headline rises over its faded lower edge (home.css `.home-art + *`), so the art sits
 * behind the heading only, never behind or over a capture. It drifts in with the scroll; under reduced motion it is static.
 * Decorative (empty alt); its AI disclosure sits once at its lower right, like the hero's.
 */
export function SceneArt({ image, size = 'band' }: SceneArtProps) {
  const { src, srcSet } = artSources(image.key, image.hidpi, image.width);
  return (
    <div className={cn('home-art relative isolate', size === 'tall' && 'home-art-tall')}>
      <div aria-hidden className="home-art-frame absolute inset-0 mx-auto max-w-[104rem] overflow-clip">
        <img
          src={src}
          {...(srcSet ? { srcSet, sizes: 'min(100vw, 104rem)' } : {})}
          width={image.width}
          height={image.height}
          alt=""
          loading="lazy"
          decoding="async"
          draggable={false}
          data-fit={image.portraitFit}
          className="home-art-img absolute inset-x-0 w-full object-cover select-none"
          style={{ '--art-focus': image.focus, '--art-focus-portrait': image.portraitFocus }}
        />
      </div>
      <div className="home-art-badge site-container pointer-events-none absolute inset-x-0 flex justify-end">
        <AiBadge variant={image.badge} />
      </div>
    </div>
  );
}
