import { Mail } from 'lucide-react';
import { Link } from 'react-router';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { LINKS, PAGES, pagePath } from '../../site/config.ts';
import { BrandMark } from '../brand/BrandMark.tsx';
import { GitHubMark } from '../brand/ExternalMarks.tsx';
import { Wordmark } from '../brand/Wordmark.tsx';
import { SourceSoon } from '../ui/SourceSoon.tsx';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';

export function SiteFooter() {
  const locale = useLocale();
  const copy = commonCopy(locale);
  return (
    <footer className="relative border-t border-line-subtle bg-rail">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-40" />
      <div className="site-container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid content-start gap-5">
          <div className="flex items-center gap-3">
            <BrandMark size={40} glow loading="lazy" />
            <Wordmark width={128} tagline decorative />
          </div>
          <p className="max-w-[40ch] text-body text-balance-cjk text-fg-secondary">{copy.footerMadeBy}</p>
          <SourceSoon className="justify-self-start" />
        </div>

        <nav aria-label={copy.navLabel} className="grid content-start gap-3">
          <h2 className="text-caption font-semibold text-fg-tertiary">Phasyn Studio</h2>
          <ul className="grid gap-2">
            {PAGES.map((page) => (
              <li key={page}>
                <Link to={pagePath(locale, page)} className="text-body text-fg-secondary no-underline hover:text-fg" viewTransition>
                  {copy.nav[page]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid content-start gap-3">
          <h2 className="text-caption font-semibold text-fg-tertiary">{copy.footerLinks}</h2>
          <ul className="grid gap-2">
            <li>
              <a href={LINKS.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-body text-fg-secondary no-underline hover:text-fg">
                <GitHubMark className="size-4" />
                GitHub · phasyn
              </a>
            </li>
            <li>
              <a href={LINKS.huggingface} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-body text-fg-secondary no-underline hover:text-fg">
                <span aria-hidden className="inline-grid size-4 place-items-center rounded-sm bg-raised text-[9px] font-bold text-fg">HF</span>
                Hugging Face · phasyn
              </a>
            </li>
            <li>
              <a href={`mailto:${LINKS.email}`} className="inline-flex items-center gap-2 text-body text-fg-secondary no-underline hover:text-fg">
                <Mail className="size-4" aria-hidden />
                <span className="sr-only">{copy.emailLabel}: </span>
                {LINKS.email}
              </a>
            </li>
          </ul>
          <LanguageSwitcher full className="mt-3 justify-self-start" />
        </div>
      </div>
      <div className="site-container grid gap-2 border-t border-line-subtle py-6 text-caption text-fg-tertiary">
        <p className="max-w-[110ch]">{copy.footerLicense}</p>
        <p className="max-w-[110ch]">{copy.footerModels}</p>
        <p className="max-w-[110ch]">{copy.footerCredits}</p>
        <p className="mt-2 font-medium text-fg-secondary">
          © 2026 DennySORA · {copy.personalProject}
        </p>
      </div>
    </footer>
  );
}
