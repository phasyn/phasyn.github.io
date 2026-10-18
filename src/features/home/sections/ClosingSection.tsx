import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { BrandMark } from '../../../components/brand/BrandMark.tsx';
import { GitHubMark } from '../../../components/brand/ExternalMarks.tsx';
import { RevealText } from '../../../components/fx/index.ts';
import { ButtonLink } from '../../../components/ui/Button.tsx';
import { SourceSoon } from '../../../components/ui/SourceSoon.tsx';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { LINKS, pagePath } from '../../../site/config.ts';
import { HOME } from '../copy.ts';

/**
 * Follow: the mark in its light, the source notice, and the three ways to hear first (GitHub, Hugging Face, email). No local
 * nebula: the page-wide one shows through (one WebGL context less), so the text sits on a calm background.
 */
export function ClosingSection() {
  const locale = useLocale();
  const t = useCopy(HOME).closing;
  return (
    <section id="follow" aria-labelledby="closing-title" className="relative isolate overflow-hidden">
      <div className="site-container home-section relative grid justify-items-center gap-8 text-center">
        <div className="reveal relative grid place-items-center">
          <span aria-hidden className="glow-backdrop absolute size-[22rem] max-w-[90vw] rounded-full opacity-80" />
          <span aria-hidden className="home-mark-halo absolute size-[12rem] rounded-full" />
          <BrandMark size={120} glow loading="lazy" className="relative" />
        </div>
        <RevealText as="h2" id="closing-title" text={t.title} on="view" className="max-w-[20ch] text-display tracking-display text-balance-cjk text-fg" />
        <p className="reveal max-w-[48ch] text-lead text-fg-secondary">{t.lead}</p>
        <SourceSoon className="reveal" />
        <div className="reveal flex flex-wrap justify-center gap-3">
          <ButtonLink href={LINKS.github} variant="primary" size="lg" icon={<GitHubMark className="size-4" />} className="home-cta">
            {t.github}
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
            {t.huggingface}
          </ButtonLink>
          <ButtonLink href={`mailto:${LINKS.email}`} variant="secondary" size="lg" icon={<Mail className="size-4" aria-hidden />}>
            {t.email}
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
