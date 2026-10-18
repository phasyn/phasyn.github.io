import { ArrowDown, CircleDashed, FlaskConical, Hammer, Lightbulb, Sparkles, Target } from 'lucide-react';
import { Chip, type ChipTone } from '../../../components/ui/Chip.tsx';
import { commonCopy } from '../../../i18n/common.ts';
import { useCopy, useLocale } from '../../../i18n/locale.tsx';
import { SectionHeading } from '../components/SectionHeading.tsx';
import { HOME, type LabStatus } from '../copy.ts';

const STATUS: Record<LabStatus, { tone: ChipTone; Icon: typeof FlaskConical }> = {
  inTesting: { tone: 'warning', Icon: FlaskConical },
  unverified: { tone: 'neutral', Icon: CircleDashed },
  coming: { tone: 'info', Icon: Sparkles },
  designGoal: { tone: 'neutral', Icon: Target },
  inDevelopment: { tone: 'brand', Icon: Hammer },
  planned: { tone: 'neutral', Icon: Lightbulb },
};

/**
 * "In the lab": everything that has not shipped, one line each, every line with its status (in testing, implemented but not
 * verified, coming, design goal, in development, planned). Replaces the roadmap cards so the page ends on what exists.
 */
export function LabSection({ className }: { className?: string }) {
  const locale = useLocale();
  const t = useCopy(HOME).lab;
  const common = commonCopy(locale);
  const label = (status: LabStatus) => (status === 'unverified' ? t.unverified : common[status]);
  return (
    <section aria-labelledby="lab-title" className={className}>
      <div>
        <SectionHeading id="lab-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} size="headline" />
        <ul className="reveal mt-8 divide-y divide-line-subtle overflow-hidden rounded-3xl border border-line-subtle bg-surface">
          {t.items.map((item) => {
            const { tone, Icon } = STATUS[item.status];
            return (
              <li key={item.title} className="grid gap-2 px-5 py-4 sm:px-6 md:grid-cols-[10.5rem_minmax(0,1fr)] md:items-baseline md:gap-5">
                <span>
                  <Chip tone={tone} icon={<Icon aria-hidden />}>
                    {label(item.status)}
                  </Chip>
                </span>
                <div className="grid gap-1">
                  <h3 className="text-section font-semibold text-balance-cjk text-fg">
                    {item.title.split(' · ').map((part, index, parts) => (
                      <span key={part} className="whitespace-nowrap">
                        {part}
                        {index < parts.length - 1 ? ' ·' : ''}
                        {index < parts.length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </h3>
                  <p className="text-body text-fg-secondary">{item.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="reveal mt-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-on-fx text-caption text-fg-secondary">{t.note}</p>
          <a href="#follow" className="group inline-flex min-h-10 items-center gap-1.5 rounded-md text-body font-medium text-action-fg no-underline hover:text-fg">
            {t.cta}
            <ArrowDown className="size-4 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-y-0.5" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}
