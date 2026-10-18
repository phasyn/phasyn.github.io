import { ArrowUpRight, Bell, Boxes, Cpu, Download, Scale, Wallet } from 'lucide-react';
import { useCopy } from '../../../i18n/locale.tsx';
import { HOME } from '../copy.ts';

const ICONS = [Download, Cpu, Wallet, Scale, Bell] as const;

/** Verified licence texts of the two model families the outputs on this site come from. */
const LICENSES = [
  { name: 'MiniMax H3 Community License', href: 'https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE' },
  { name: 'Qwen Research License', href: 'https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE' },
] as const;

/**
 * "Can I use it today?": the plain answer people look for before anything else — download, hardware (RTX 50 / RTX 30 / GB10
 * only; no RTX 40, no Mac), cost, licences and how to hear first. One card, no FX behind the text.
 */
export function UsableTodaySection({ className }: { className?: string }) {
  const t = useCopy(HOME).usable;
  return (
    <section aria-labelledby="usable-title" className={className}>
      <div>
        <div className="reveal rounded-3xl border border-line bg-surface p-6 shadow-edge sm:p-8">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="home-eyebrow-line w-10" />
            {t.eyebrow}
          </p>
          <h2 id="usable-title" className="mt-4 text-headline tracking-display text-balance-cjk text-fg">
            {t.title}
          </h2>
          <dl className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2 lg:grid-cols-1">
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
          <div className="mt-7 grid gap-3 border-t border-line-subtle pt-5">
            <p className="flex items-start gap-2.5 text-body leading-relaxed text-fg-secondary">
              <Boxes className="mt-0.5 size-4 shrink-0 text-action-fg" aria-hidden />
              {t.framework}
            </p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-body">
              <span className="text-fg-tertiary">{t.licenses}</span>
              {LICENSES.map((license) => (
                <a
                  key={license.href}
                  href={license.href}
                  target="_blank"
                  rel="noreferrer"
                  lang="en"
                  className="group inline-flex min-h-10 items-center gap-1 rounded-md font-medium text-action-fg no-underline hover:text-fg"
                >
                  {license.name}
                  <ArrowUpRight className="size-3.5 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                </a>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
