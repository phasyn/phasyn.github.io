import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from '../../../components/brand/BrandMark.tsx';
import { GitHubMark } from '../../../components/brand/ExternalMarks.tsx';
import { Wordmark } from '../../../components/brand/Wordmark.tsx';
import { NebulaField, RevealText } from '../../../components/fx/index.ts';
import { ButtonLink } from '../../../components/ui/Button.tsx';
import { SourceSoon } from '../../../components/ui/SourceSoon.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { LINKS, pagePath } from '../../../site/config.ts';
import { HOME } from '../copy.ts';

/** Closing brand moment: the mark in its light, the source notice, and where to follow the project. */
export function ClosingSection() {
  const locale = useLocale();
  const t = useCopy(HOME).closing;
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden">
      <NebulaField position="absolute" intensity={1.05} particles={110} className="[mask-image:linear-gradient(180deg,transparent,#000_22%,#000_78%,transparent)]" />
      <div className="site-container site-section relative grid justify-items-center gap-8 text-center">
        <div className="reveal relative grid place-items-center">
          <span aria-hidden className="glow-backdrop absolute size-[26rem] max-w-[90vw] rounded-full opacity-90" />
          <span aria-hidden className="home-mark-halo absolute size-[15rem] rounded-full" />
          <BrandMark size={176} glow className="relative" />
        </div>
        <Wordmark width={248} gradient tagline decorative className="reveal justify-items-center" />
        <h2 id="closing-title" className="max-w-[20ch] text-display tracking-display text-balance-cjk text-fg">
          <RevealText text={t.title} on="view" />
        </h2>
        <p className="reveal max-w-[48ch] text-lead text-fg-secondary">{t.lead}</p>
        <SourceSoon className="reveal" />
        <div className="reveal flex flex-wrap justify-center gap-3">
          <ButtonLink href={LINKS.github} variant="primary" size="lg" icon={<GitHubMark className="size-4" />} className="home-cta">
            GitHub
          </ButtonLink>
          <ButtonLink
            href={LINKS.huggingface}
            variant="secondary"
            size="lg"
            icon={
              <span aria-hidden className="inline-grid size-4 place-items-center rounded-sm bg-overlay text-[9px] font-bold text-fg">
                HF
              </span>
            }
          >
            Hugging Face
          </ButtonLink>
        </div>
        <Link
          to={pagePath(locale, 'about')}
          viewTransition
          className="group reveal inline-flex min-h-10 items-center gap-1.5 rounded-md text-body font-medium text-action-fg no-underline hover:text-fg"
        >
          {t.about}
          <ArrowRight className="size-4 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
