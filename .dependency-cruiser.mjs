// Module boundaries of the site, checked by `pnpm lint` (dependency-cruiser). Every rule is an error.
//
//   app shell (root.tsx, routes.ts, entry.server.tsx) → routes/ → features/<page>/ → components/ → lib/ → i18n/ → site/
//
// Pages never import each other; shared code never imports a page or a route; site/ (locales, pages, URLs, captures) has
// no dependencies. Node scripts reach into src/ only for site/ (which holds the showcase works' types and data).

/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: 'no-circular',
      comment: 'Modules must not depend on each other in a cycle.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'features-not-to-features',
      comment: 'A page (src/features/<page>) never imports another page; shared code lives in components, lib or i18n.',
      severity: 'error',
      from: { path: '(^src/features/)([^/]+)/' },
      to: { path: '^$1', pathNot: '$1$2/' },
    },
    {
      name: 'shared-not-to-pages',
      comment: 'Shared code (components, lib, i18n, site) never depends on a page, a route or the app shell.',
      severity: 'error',
      from: { path: '^src/(components|lib|i18n|site)/' },
      to: { path: ['^src/(features|routes)/', '^src/(root|routes|entry\\.server)\\.tsx?$'] },
    },
    {
      name: 'pages-not-to-routes',
      comment: 'Route modules render pages; pages never import route modules or the app shell.',
      severity: 'error',
      from: { path: '^src/features/' },
      to: { path: ['^src/routes/', '^src/(root|routes|entry\\.server)\\.tsx?$'] },
    },
    {
      name: 'lib-i18n-site-not-to-components',
      comment: 'Helpers, copy and site config sit below the components.',
      severity: 'error',
      from: { path: '^src/(lib|i18n|site)/' },
      to: { path: '^src/components/' },
    },
    {
      name: 'i18n-site-not-to-lib',
      comment: 'Copy and site config sit below the helpers.',
      severity: 'error',
      from: { path: '^src/(i18n|site)/' },
      to: { path: '^src/lib/' },
    },
    {
      name: 'site-is-a-leaf',
      comment: 'src/site is imported by the build config and Node scripts: no React and no other src module.',
      severity: 'error',
      from: { path: '^src/site/' },
      to: { path: ['^src/(?!site/)', 'node_modules/'] },
    },
    {
      name: 'component-base-areas',
      comment: 'brand and ui are the base component areas: they never import fx, layout or media.',
      severity: 'error',
      from: { path: '^src/components/(brand|ui)/' },
      to: { path: '^src/components/(fx|layout|media)/' },
    },
    {
      name: 'src-not-to-scripts',
      comment: 'The site never imports the Node build and preview scripts.',
      severity: 'error',
      from: { path: '^src/' },
      to: { path: '^scripts/' },
    },
    {
      name: 'scripts-reach-site-only',
      comment:
        'Node scripts use src/site (incl. the works types in src/site/works.ts), nothing that needs React or the browser.',
      severity: 'error',
      from: { path: '^scripts/' },
      to: { path: '^src/', pathNot: ['^src/site/'] },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    // React Router's generated route types (./+types/*) exist only after typegen.
    exclude: { path: '\\+types/' },
  },
};
