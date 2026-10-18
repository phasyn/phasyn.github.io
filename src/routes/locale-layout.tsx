import { Outlet, useParams } from 'react-router';
import { CursorAura, IntroSplash, NebulaField } from '../components/fx/index.ts';
import { SiteFooter } from '../components/layout/SiteFooter.tsx';
import { SiteHeader } from '../components/layout/SiteHeader.tsx';
import { NotFoundPage } from '../components/layout/NotFoundPage.tsx';
import { commonCopy } from '../i18n/common.ts';
import { LocaleProvider } from '../i18n/locale.tsx';
import { isLocale } from '../site/config.ts';

export default function LocaleLayout() {
  const { lang } = useParams();
  if (!isLocale(lang)) return <NotFoundPage />;
  return (
    <LocaleProvider locale={lang}>
      <IntroSplash />
      <NebulaField position="fixed" intensity={0.85} />
      <CursorAura />
      <a
        href="#main-content"
        className="sr-only z-[60] rounded-md bg-overlay px-3 py-2 text-fg focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        {commonCopy(lang).skipToContent}
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <SiteFooter />
    </LocaleProvider>
  );
}
