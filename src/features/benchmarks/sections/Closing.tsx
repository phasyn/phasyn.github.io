import { ChevronDown } from 'lucide-react';
import { SourceSoon } from '../../../components/ui/SourceSoon.tsx';
import { useBenchCopy } from '../copy.ts';
import { EXPERIMENT_ROWS } from '../data/rows.gen.ts';
import type { ExperimentId } from '../data/types.ts';
import { Section } from '../ui/Section.tsx';

export function MethodSection() {
  const copy = useBenchCopy();
  const m = copy.method;
  return (
    <Section id="method" eyebrow={m.eyebrow} title={m.title} lead={m.lead}>
      <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {m.defs.map((def) => (
          <div key={def.term} className="panel grid content-start gap-2 p-5">
            <dt className="text-section font-semibold text-fg">{def.term}</dt>
            <dd className="text-data text-pretty text-fg-secondary">{def.body}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ul className="panel grid gap-3 p-5 sm:p-6">
          {m.caveats.map((caveat) => (
            <li key={caveat} className="flex gap-3 text-data text-pretty text-fg-secondary">
              <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-warning" />
              {caveat}
            </li>
          ))}
        </ul>
        <div className="grid content-start gap-4">
          <p className="text-data text-pretty text-fg-tertiary">{m.exclusions}</p>
          <SourceSoon className="justify-self-start" />
        </div>
      </div>
    </Section>
  );
}

const EXPERIMENTS: Exclude<ExperimentId, 'today'>[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];

export function ExperimentsSection() {
  const copy = useBenchCopy();
  const e = copy.experiments;
  return (
    <Section id="experiments" eyebrow={e.eyebrow} title={e.title} lead={e.lead}>
      <ol className="grid gap-3">
        {EXPERIMENTS.map((id) => {
          const item = e.items[id];
          return (
            <li key={id}>
              <details className="disclosure group panel overflow-hidden open:border-line-strong">
                <summary className="flex cursor-pointer list-none items-start gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                  <span className="machine grid size-9 shrink-0 place-items-center rounded-lg border border-line-strong bg-sunken text-caption text-fg-secondary">{id}</span>
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="text-section font-semibold text-balance-cjk text-fg">{item.title}</span>
                    <span className="text-data text-pretty text-fg-secondary">{item.question}</span>
                    <span className="machine text-[11px] text-fg-tertiary">{EXPERIMENT_ROWS[id]?.date}</span>
                  </span>
                  <ChevronDown aria-hidden className="mt-1 size-5 shrink-0 text-fg-tertiary transition-transform group-open:rotate-180" />
                </summary>
                <div className="grid gap-5 border-t border-line-subtle px-4 py-5 sm:px-5 md:pl-[4.75rem]">
                  <p className="max-w-[72ch] text-reading text-pretty text-fg-secondary">{item.summary}</p>
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                    <div className="grid content-start gap-2">
                      <h3 className="text-caption font-semibold text-fg-tertiary">{e.findings}</h3>
                      <ul className="grid gap-2">
                        {item.findings.map((finding) => (
                          <li key={finding} className="flex gap-3 text-data text-pretty text-fg">
                            <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-brand-gradient" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid content-start gap-2">
                      <h3 className="text-caption font-semibold text-fg-tertiary">{e.caveats}</h3>
                      <ul className="grid gap-2">
                        {item.caveats.map((caveat) => (
                          <li key={caveat} className="flex gap-3 text-data text-pretty text-fg-secondary">
                            <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-warning" />
                            {caveat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {EXPERIMENT_ROWS[id]?.rows ? (
                    <a href="#speed-table" className="justify-self-start text-data no-underline hover:underline">
                      {e.rows(EXPERIMENT_ROWS[id]?.rows ?? 0)} →
                    </a>
                  ) : null}
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
