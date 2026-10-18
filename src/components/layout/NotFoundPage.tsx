import { BrandMark } from '../brand/BrandMark.tsx';
import { HTML_LANG, LOCALES, pagePath } from '../../site/config.ts';
import { COMMON } from '../../i18n/common.ts';

/** Shared by the catch-all route and invalid locales, so the static 404.html hydrates unchanged. */
export function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas p-6">
      <div className="grid max-w-xl justify-items-center gap-6 text-center">
        <BrandMark size={64} glow />
        <p className="eyebrow text-fg-tertiary" lang="en">
          404 · Phasyn Studio
        </p>
        <div className="grid gap-4">
          {LOCALES.map((locale) => (
            <section key={locale} lang={HTML_LANG[locale]} className="grid gap-1">
              <h1 className="text-section font-semibold text-fg">{COMMON[locale].notFoundTitle}</h1>
              <p className="text-body text-fg-secondary">
                {COMMON[locale].notFoundBody} <a href={pagePath(locale, 'home')}>{COMMON[locale].notFoundBack}</a>
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
