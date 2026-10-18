import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

/*
 * Codex illustration set for this page (work/art, every cutout passed transparency QA; see work/art/ASSETS.md),
 * copied unchanged to public/images/about/. Cutouts are 480 px squares with an @2x (960 px) copy, subject
 * centred on true transparency. They are decorative: the text next to each one carries the meaning.
 */
export const CUTOUTS = {
  pipeline: 'f01-pipeline',
  reversePrompt: 'f02-reverse-prompt',
  characterSwap: 'f03-character-swap',
  distributedNodes: 'f04-distributed-nodes',
  diagnostics: 'f05-diagnostics',
  agentSkill: 'f06-agent-skill',
  promptAdvisor: 'f07-prompt-advisor',
  multilevelRender: 'f08-multilevel-render',
  voice: 'f09-voice',
  upscaleInterpolate: 'f10-upscale-interpolate',
  fineControl: 'f11-fine-control',
  extensibility: 'f12-extensibility',
  vaeDit: 'f13-vae-dit',
  gpuBurst: 'f14-gpu-burst',
} as const;
export type CutoutSlug = (typeof CUTOUTS)[keyof typeof CUTOUTS];

const BASE = '/images/about';

/**
 * One cutout at a fixed displayed size (width/height attributes plus the size classes passed in, so nothing
 * shifts while it loads), 1x/2x from the 480/960 px files. Lazy: all of them sit below the hero.
 */
export function Cutout({ slug, size, className }: { slug: CutoutSlug; size: number; className?: string }) {
  return (
    <img
      src={`${BASE}/${slug}.webp`}
      srcSet={`${BASE}/${slug}.webp 1x, ${BASE}/${slug}@2x.webp 2x`}
      width={size}
      height={size}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      draggable={false}
      className={cn('shrink-0 select-none', className)}
    />
  );
}

/**
 * A passage with its illustration: art beside the text from md up (text stays the reading spine), above it
 * on phones.
 */
export function ArtAside({ slug, children, className }: { slug: CutoutSlug; children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid gap-4 md:grid-cols-[minmax(0,1fr)_8.5rem] md:items-center md:gap-8', className)}>
      <Cutout slug={slug} size={136} className="size-24 md:order-last md:size-34" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
