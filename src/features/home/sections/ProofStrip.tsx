import { useCopy } from '../../../i18n/locale.tsx';
import { HOME } from '../copy.ts';

/**
 * Four plain proof numbers right under the hero (replacing the component-code ticker): a still, a clip with sound, the
 * two-machine / three-GPU render and the DiT variants that ran. Final values only — nothing counts up.
 */
export function ProofStrip() {
  const t = useCopy(HOME).proof;
  return (
    <section aria-label={t.label} className="relative z-10 border-y border-line-subtle bg-sunken/80">
      <div className="site-container py-7 md:py-9">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-7 md:grid-cols-4">
          {t.items.map((item) => (
            <div key={item.label} className="reveal grid content-start gap-2">
              <dt className="order-2 max-w-[24ch] text-data text-fg-secondary">{item.label}</dt>
              <dd className="machine order-1 text-[clamp(1.875rem,1.3rem+1.7vw,2.75rem)] leading-none font-semibold whitespace-nowrap text-fg tabular-nums">
                {item.value}
                {item.unit ? <span className="ml-1 text-[0.5em] font-medium text-fg-tertiary">{item.unit}</span> : null}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-[96ch] text-caption leading-relaxed text-fg-tertiary">{t.footnote}</p>
      </div>
    </section>
  );
}
