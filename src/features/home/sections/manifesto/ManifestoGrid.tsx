import { cn } from '../../../../lib/cn.ts';
import { BEATS, BeatText, FinalStatement, TONE_TEXT, type ManifestoCopy } from './shared.tsx';

/**
 * The manifesto as a still composition: five pain cards (each with its HUD visual in its end state) and the turn below them.
 * This is what the prerendered HTML, no-JS readers, reduced motion and short viewports get; nothing in it moves.
 */
export function ManifestoGrid({ t }: { t: ManifestoCopy }) {
  return (
    <section aria-labelledby="manifesto-title" className="home-mf-still site-section relative overflow-hidden">
      <div className="site-container">
        <header className="home-heading grid gap-5">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="home-eyebrow-line w-10" />
            {t.eyebrow}
          </p>
          <h2 id="manifesto-title" className="text-headline tracking-display text-balance-cjk text-fg">
            {t.heading}
          </h2>
        </header>

        <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {t.beats.map((beat, index) => {
            const meta = BEATS[index];
            if (!meta) return null;
            return (
              <li key={index} className={cn('reveal min-w-0', index < 3 ? 'lg:col-span-2' : 'lg:col-span-3', index === 4 && 'md:col-span-2')}>
                <article className="home-pain-card flex h-full flex-col gap-5 rounded-3xl border border-line-subtle bg-surface p-5 sm:p-6" data-tone={meta.tone}>
                  <div aria-hidden className="flex items-center justify-between gap-3">
                    <span className="machine truncate text-[11px] tracking-[0.18em] uppercase">
                      <span className={TONE_TEXT[meta.tone]}>{`0${index + 1}`}</span>
                      <span className="text-fg-tertiary"> — {meta.tag}</span>
                    </span>
                    <meta.Icon className={cn('size-4 shrink-0', TONE_TEXT[meta.tone])} />
                  </div>
                  <div aria-hidden className="rounded-2xl border border-line-subtle bg-sunken/70 p-4 sm:p-5">
                    <meta.Visual still />
                  </div>
                  <p className="text-[1.1875rem] leading-snug font-semibold text-balance-cjk text-fg">
                    <BeatText text={beat.text} hot={beat.hot} tone={meta.tone} />
                  </p>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="home-mf-still-final relative mt-16 py-10 md:mt-24">
          <span aria-hidden className="home-mf-glow pointer-events-none absolute inset-0" />
          <FinalStatement t={t} />
        </div>
      </div>
    </section>
  );
}
