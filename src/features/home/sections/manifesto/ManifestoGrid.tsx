import { cn } from '../../../../lib/cn.ts';
import { BEATS, BeatText, FinalStatement, TONE_TEXT, type ManifestoCopy } from './shared.tsx';

/**
 * The manifesto as a still composition: on phones a single-column log of the five pain points; from md up five pain cards (each
 * with its HUD visual in its end state); the turn below. This is what the prerendered HTML, no-JS readers, reduced motion, phones
 * and short viewports get; nothing in it moves. Only one of the two lists is displayed, so assistive technology reads it once.
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

        <div className="mt-8 overflow-clip rounded-3xl border border-line-subtle bg-sunken/60 md:hidden">
          <p aria-hidden className="flex items-center gap-2 border-b border-line-subtle px-4 py-3">
            <span className="home-mf-caret" />
            <span className="home-pain-label">LOG</span>
          </p>
          <ol className="grid">
            {t.beats.map((beat, index) => {
              const meta = BEATS[index];
              if (!meta) return null;
              return (
                <li key={index} className="reveal grid grid-cols-[2.25rem_minmax(0,1fr)] gap-2 border-b border-line-subtle px-4 py-4 last:border-b-0">
                  <span aria-hidden className={cn('machine min-w-[2ch] pt-1 text-[12px] font-semibold whitespace-nowrap', TONE_TEXT[meta.tone])}>{`0${index + 1}`}</span>
                  <span className="grid min-w-0 gap-1.5">
                    <span aria-hidden className="machine text-[10px] tracking-[0.16em] text-fg-tertiary uppercase">
                      {meta.tag}
                    </span>
                    <span className="home-beat-text text-[1.0625rem] leading-relaxed font-semibold text-balance-cjk text-fg">
                      <BeatText text={beat.text} hot={beat.hot} tone={meta.tone} />
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <ol className="mt-10 hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-6 lg:gap-5">
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
                  <p className="home-beat-text text-[1.1875rem] leading-snug font-semibold text-balance-cjk text-fg">
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
