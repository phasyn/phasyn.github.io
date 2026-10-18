import type { ReactNode } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from 'react-router';
import { HTML_LANG, localeFromPath } from './site/config.ts';
import './styles/app.css';

// First paint is already the brand canvas colour; there is no light theme (DESIGN_GUIDE §3.1).
export function Layout({ children }: { children: ReactNode }) {
  const locale = localeFromPath(useLocation().pathname);
  return (
    <html lang={locale ? HTML_LANG[locale] : 'en'} data-theme="noir" style={{ backgroundColor: '#070b14', colorScheme: 'dark' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#070b14" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/brand/icon-32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/brand/icon-180.png" />
        <link rel="manifest" href="/brand/manifest.json" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return <Outlet />;
}
