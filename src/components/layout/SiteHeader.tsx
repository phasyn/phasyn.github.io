import { Menu, X } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { cn } from '../../lib/cn.ts';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { LINKS, PAGES, pagePath } from '../../site/config.ts';
import { BrandMark } from '../brand/BrandMark.tsx';
import { GitHubMark } from '../brand/ExternalMarks.tsx';
import { Wordmark } from '../brand/Wordmark.tsx';
import { LanguageSwitcher } from './LanguageSwitcher.tsx';

/** Translucent top bar: brand, page navigation (current page marked with the brand line), language, GitHub. */
export function SiteHeader() {
  const locale = useLocale();
  const copy = commonCopy(locale);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  // Close the mobile panel on navigation and with Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="border-b border-[rgb(255_255_255_/_0.06)] bg-[rgb(7_11_20_/_0.62)] backdrop-blur-[22px] backdrop-saturate-[160%] supports-[not(backdrop-filter:blur(1px))]:bg-[rgb(7_11_20_/_0.96)]">
        <div className="site-container flex h-(--site-header-h) items-center gap-4">
          <Link to={pagePath(locale, 'home')} className="pressable flex items-center gap-2.5 text-fg no-underline" aria-label="Phasyn Studio" viewTransition>
            <BrandMark size={28} glow />
            <Wordmark width={92} short decorative />
          </Link>

          <nav aria-label={copy.navLabel} className="ml-auto hidden md:block">
            <ul className="flex items-center gap-1">
              {PAGES.map((page) => (
                <li key={page}>
                  <NavLink
                    to={pagePath(locale, page)}
                    end
                    viewTransition
                    className={({ isActive }) =>
                      cn(
                        'relative inline-flex min-h-9 items-center rounded-md px-3 text-data font-medium no-underline',
                        isActive ? 'text-fg' : 'text-fg-secondary hover:bg-raised/60 hover:text-fg',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {copy.nav[page]}
                        {isActive ? <span aria-hidden className="absolute inset-x-3 -bottom-[11px] h-px bg-brand-gradient" /> : null}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-2">
            <LanguageSwitcher className="hidden sm:flex" />
            <a
              href={LINKS.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className="pressable hidden size-9 items-center justify-center rounded-md text-fg-secondary hover:bg-raised hover:text-fg md:inline-flex"
            >
              <GitHubMark className="size-[18px]" />
            </a>
            <button
              type="button"
              className="pressable inline-flex size-10 items-center justify-center rounded-md text-fg-secondary hover:bg-raised hover:text-fg md:hidden"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={open ? copy.menuClose : copy.menuOpen}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
            </button>
          </div>
        </div>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className="material-sheet border-b border-[rgb(255_255_255_/_0.06)] md:hidden motion-safe:animate-pop-in"
      >
        <nav aria-label={copy.navLabel} className="site-container py-4">
          <ul className="grid gap-1">
            {PAGES.map((page) => (
              <li key={page}>
                <NavLink
                  to={pagePath(locale, page)}
                  end
                  className={({ isActive }) =>
                    cn(
                      'flex min-h-11 items-center rounded-lg px-3 text-section font-semibold no-underline',
                      isActive ? 'bg-brand-gradient-soft text-fg' : 'text-fg-secondary hover:bg-raised hover:text-fg',
                    )
                  }
                >
                  {copy.nav[page]}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <LanguageSwitcher full />
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-data text-fg-secondary no-underline hover:text-fg">
              <GitHubMark className="size-4" />
              GitHub
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
