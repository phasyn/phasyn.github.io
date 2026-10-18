import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Brand utilities from tokens.css plus the site's display type scale (site.css)
// must be registered, or tailwind-merge treats them as colours and drops them.
type PhasynClassGroup = 'border-brand-gradient' | 'text-brand-gradient' | 'material' | 'pressable' | 'stagger';

const twMerge = extendTailwindMerge<PhasynClassGroup>({
  extend: {
    theme: {
      text: [
        'title',
        'page',
        'section',
        'body',
        'data',
        'caption',
        'reading',
        'metric',
        'hero',
        'display',
        'headline',
        'lead',
        'eyebrow',
      ],
      radius: ['sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full'],
      shadow: ['raised', 'edge', 'overlay', 'popover', 'window', 'glow', 'glow-sm'],
      breakpoint: ['sm', 'md', 'lg', 'xl'],
      animate: [
        'fade-in',
        'fade-out',
        'pop-in',
        'dialog-in',
        'dialog-out',
        'sheet-in',
        'sheet-out',
        'drawer-in',
        'drawer-out',
        'toast-in',
        'toast-out',
        'reveal',
        'shimmer',
        'glow-pulse',
        'rise-in',
      ],
      ease: ['standard', 'enter', 'exit', 'spring-smooth', 'spring-snappy', 'spring-bouncy'],
    },
    classGroups: {
      'bg-image': ['bg-brand-gradient', 'bg-brand-gradient-soft', 'bg-action-gradient'],
      'border-brand-gradient': ['border-brand-gradient'],
      'text-brand-gradient': ['text-brand-gradient'],
      material: ['material-sidebar', 'material-popover', 'material-sheet', 'material-hud'],
      pressable: ['pressable'],
      stagger: ['stagger'],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
