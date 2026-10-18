import { ArrowRight, Film, Info } from 'lucide-react';
import { Link } from 'react-router';
import { RevealText } from '../../components/fx/index.ts';
import { ButtonLink } from '../../components/ui/Button.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { useLocale } from '../../i18n/locale.tsx';
import { pagePath } from '../../site/config.ts';
import { SHOWCASE } from './copy.ts';
import { FILMS, RESULTS, filmMix, rawAudio } from './data.ts';

/** −28 style minus for loudness values (as the lead's note writes them). */
function lufs(value: number): string {
  return `${value < 0 ? '−' : ''}${Math.abs(Math.round(value))}`;
}

/** Honest notes: what these results are, licences, what the web copies changed, and how the times were measured. */
export function Notes() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].notes;
  const audio = rawAudio(RESULTS);
  const rates = audio?.rates.map((rate) => `${rate / 1000} kHz`).join(' / ');
  const mix = filmMix(FILMS);
  const items = [
    ...copy.items,
    ...(audio ? [copy.loudness(lufs(audio.loudest), lufs(audio.quietest), rates ?? '')] : []),
    ...(FILMS.length && mix !== undefined ? [copy.films(lufs(mix))] : []),
    copy.glyphs,
  ];
  return (
    <section id="notes" aria-labelledby="notes-title" className="site-container pb-[clamp(3rem,2rem+4vw,6rem)]">
      <div className="grid gap-6 rounded-2xl border border-line bg-surface p-5 shadow-edge md:p-8">
        <h2 id="notes-title" className="flex items-center gap-3 text-section font-semibold text-fg">
          <Info aria-hidden className="size-4 text-brand-cyan" />
          {copy.title}
        </h2>
        <ul className="grid gap-3 md:grid-cols-2 md:gap-x-10">
          {items.map((text) => (
            <li key={text} className="flex gap-3 text-body text-fg-secondary">
              <span aria-hidden className="mt-[0.7em] size-1 shrink-0 rounded-full bg-brand-cyan" />
              <span className="[text-wrap:pretty]">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Closing CTA: source notice (coming soon) plus the Tour, Benchmarks and the intro film on Home. */
export function Closing() {
  const locale = useLocale();
  const copy = SHOWCASE[locale].closing;
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden border-t border-line-subtle">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(55%_70%_at_50%_100%,rgb(62_137_255_/_0.18),transparent_70%),radial-gradient(40%_50%_at_70%_80%,rgb(171_123_255_/_0.12),transparent_70%)]" />
      <div className="site-container grid justify-items-center gap-6 py-[clamp(5rem,3rem+7vw,9rem)] text-center">
        <SourceSoon />
        <RevealText as="h2" id="closing-title" text={copy.title} on="view" className="max-w-[20ch] text-display tracking-display text-balance-cjk text-fg" />
        <p className="reveal max-w-[44ch] text-lead text-balance-cjk text-fg-secondary">{copy.lead}</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to={pagePath(locale, 'tour')} variant="primary" size="lg" className="fx-orbit-border">
            {copy.tour}
            <ArrowRight aria-hidden />
          </ButtonLink>
          <ButtonLink to={pagePath(locale, 'benchmarks')} variant="secondary" size="lg">
            {copy.benchmarks}
          </ButtonLink>
        </div>
        <Link to={`${pagePath(locale, 'home')}#film`} className="pressable inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-caption font-semibold text-fg-secondary no-underline hover:bg-raised/60 hover:text-fg" viewTransition>
          <Film aria-hidden className="size-4" />
          {copy.film}
        </Link>
      </div>
    </section>
  );
}
