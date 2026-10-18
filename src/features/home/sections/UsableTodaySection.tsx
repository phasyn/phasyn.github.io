import { Bell, Cpu, Download, Scale, Wallet } from 'lucide-react';
import { useCopy } from '../../../i18n/locale.tsx';
import { HOME } from '../copy.ts';

const ICONS = [Download, Cpu, Wallet, Scale, Bell] as const;

/**
 * "Can I use it today?": the plain answer people look for before anything else — download, hardware (RTX 50 / RTX 30 / GB10
 * only; no RTX 40, no Mac), cost, licences and how to hear first. One card, no FX behind the text.
 */
export function UsableTodaySection() {
  const t = useCopy(HOME).usable;
  return (
    <section aria-labelledby="usable-title" className="home-section home-section-flush relative">
      <div className="site-container">
        <div className="reveal rounded-3xl border border-line bg-surface p-6 shadow-edge sm:p-10">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="home-eyebrow-line w-10" />
            {t.eyebrow}
          </p>
          <h2 id="usable-title" className="mt-4 text-headline tracking-display text-balance-cjk text-fg">
            {t.title}
          </h2>
          <dl className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
            {t.items.map((item, index) => {
              const Icon = ICONS[index] ?? Bell;
              return (
                <div key={item.label} className="grid gap-2">
                  <dt className="flex items-center gap-3 text-section font-semibold text-fg">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl border border-action/25 bg-brand-gradient-soft text-brand-cyan">
                      <Icon className="size-4" />
                    </span>
                    {item.label}
                  </dt>
                  <dd className="pl-12 text-body leading-relaxed text-fg-secondary">{item.body}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      </div>
    </section>
  );
}
