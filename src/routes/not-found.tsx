import { NotFoundPage } from '../components/layout/NotFoundPage.tsx';
import { COMMON } from '../i18n/common.ts';

// English in the HTML; NotFoundPage's pre-paint script switches the title to the visitor's locale.
export function meta() {
  return [{ title: `${COMMON.en.notFoundTitle} — Phasyn Studio` }, { name: 'robots', content: 'noindex' }];
}

export default function NotFound() {
  return <NotFoundPage />;
}
