import { Menu, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
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
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the mobile panel on navigation.
  useEffect(() => setOpen(false), [pathname]);

  // While the panel is open (FE-14): Escape closes it and returns focus to the toggle, the page behind does not scroll,
  // and widening past the mobile breakpoint closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      toggleRef.current?.focus();
    };
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    const wide = window.matchMedia('(min-width: 52.5rem)');
    const onWide = () => wide.matches && setOpen(false);
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
      root.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="relative border-b border-[rgb(255_255_255_/_0.06)] bg-[rgb(7_11_20_/_0.55)] backdrop-blur-[22px] backdrop-saturate-[160%] supports-[not(backdrop-filter:blur(1px))]:bg-[rgb(7_11_20_/_0.96)]">
        <span aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-px overflow-hidden">
          <span className="block h-full w-1/3 bg-[linear-gradient(90deg,transparent,var(--color-brand-cyan),var(--color-brand-violet),transparent)] motion-safe:animate-[fx-pulse-line_6s_var(--ease-standard)_infinite] motion-reduce:hidden" />
        </span>
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
              ref={toggleRef}
              type="button"
              className="pressable inline-flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-raised hover:text-fg md:hidden"
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
        // The page behind is scroll-locked while open, so a panel taller than a landscape phone scrolls by itself.
        className="material-sheet max-h-[calc(100dvh-var(--site-header-h))] overflow-y-auto overscroll-contain border-b border-[rgb(255_255_255_/_0.06)] md:hidden motion-safe:animate-pop-in"
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
            {/* From 480 px the bar's own switcher is visible: one header language landmark at a time. */}
            <LanguageSwitcher full className="sm:hidden" />
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 text-data text-fg-secondary no-underline hover:text-fg">
              <GitHubMark className="size-4" />
              GitHub
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
