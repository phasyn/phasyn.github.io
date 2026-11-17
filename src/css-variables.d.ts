// @types/react keeps CSSProperties closed and points to module augmentation for anything else: this lets a style object set
// CSS custom properties (`--name`), which the site's CSS reads for delays, progress and layout, without type assertions.
import 'react';

declare module 'react' {
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
