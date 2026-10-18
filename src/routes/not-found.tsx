import { NotFoundPage } from '../components/layout/NotFoundPage.tsx';

export function meta() {
  return [{ title: 'Page not found — Phasyn Studio' }, { name: 'robots', content: 'noindex' }];
}

export default function NotFound() {
  return <NotFoundPage />;
}
