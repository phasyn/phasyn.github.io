import { Mail } from 'lucide-react';
import { BrandMark } from '../../components/brand/BrandMark.tsx';
import { GitHubMark } from '../../components/brand/ExternalMarks.tsx';
import { NebulaField } from '../../components/fx/index.ts';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { LINKS } from '../../site/config.ts';
import { cn } from '../../lib/cn.ts';
import type { AboutCopy } from './copy.ts';
import { SectionHeading, useDisplayBreak, withBalance } from './parts.tsx';

/**
 * Closing brand moment: a local living nebula behind the mark (with the hero, the page's only glowing scenes). The
 * quiet aurora (a 1600 px copy of /brand/backgrounds/aurora.webp, 9 KB) is screen-blended on top: it is the still
 * scene without JavaScript or WebGL, and adds its cyan ribbon to the live one.
 */
export const ABOUT_CLOSING_BACKGROUND = { src: '/images/about/aurora-1600.webp', width: 1600, height: 1000 } as const;

const SCRIM = 'radial-gradient(62% 70% at 50% 50%, rgb(7 11 20 / 0.72), rgb(7 11 20 / 0.25) 70%, rgb(7 11 20 / 0) 100%)';

export function ContactPanel({ title, contact, emailLabel }: { title: string; contact: AboutCopy['contact']; emailLabel: string }) {
  const display = useDisplayBreak();
  return (
    <section id="contact" aria-labelledby="contact-title" className="site-container pt-8 pb-24 md:pt-12 md:pb-32">
      <div className="reveal relative isolate overflow-hidden rounded-3xl border border-line px-5 py-16 text-center shadow-raised sm:px-10 md:py-24">
        <NebulaField position="absolute" intensity={1.1} particles={110} className="-z-30" />
        <img
          src={ABOUT_CLOSING_BACKGROUND.src}
          width={ABOUT_CLOSING_BACKGROUND.width}
          height={ABOUT_CLOSING_BACKGROUND.height}
          alt=""
          aria-hidden
          loading="lazy"
          decoding="sync"
          draggable={false}
          className="absolute inset-0 -z-20 size-full object-cover object-[30%_60%] opacity-80 mix-blend-screen select-none"
        />
        <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: SCRIM }} />
        <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-60" />

        <BrandMark size={64} glow className="mx-auto" />
        <div className="mt-8">
          <SectionHeading id="contact" title={title} align="center" />
        </div>
        {/* The shared chip is nowrap; on a phone the English notice is wider than the panel, so let it wrap (balanced) here. */}
        <SourceSoon className="mt-6 max-w-full rounded-xl py-1 text-left whitespace-normal [text-wrap:balance] [&_svg]:shrink-0" />

        <p className={withBalance(cn('mx-auto mt-12 max-w-[32em] text-lead text-fg-secondary', display))}>{contact.lead}</p>
        <a
          href={`mailto:${LINKS.email}`}
          className="mt-4 inline-flex max-w-full items-center gap-3 rounded-md text-headline tracking-display text-fg no-underline decoration-action-fg underline-offset-[0.2em] hover:underline"
        >
          <Mail aria-hidden className="size-[0.8em] shrink-0 text-action-fg" />
          <span className="sr-only">{emailLabel}: </span>
          <span className="min-w-0 [overflow-wrap:anywhere]">{LINKS.email}</span>
        </a>

        <ul className="mt-10 flex flex-wrap justify-center gap-3">
          <li>
            <ButtonLink href={LINKS.github} variant="secondary" icon={<GitHubMark className="size-4" />}>
              GitHub · phasyn
            </ButtonLink>
          </li>
          <li>
            <ButtonLink
              href={LINKS.huggingface}
              variant="secondary"
              icon={
                <span aria-hidden className="inline-grid size-4 place-items-center rounded-sm bg-overlay text-[9px] font-bold text-fg">
                  HF
                </span>
              }
            >
              Hugging Face · phasyn
            </ButtonLink>
          </li>
        </ul>
      </div>
    </section>
  );
}
