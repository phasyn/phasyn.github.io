import { ArrowRight, BarChart3, BookOpen, Info, Terminal } from 'lucide-react';
import { Link } from 'react-router';
import { DecodeText, HudFrame, NebulaField, RevealText, SpotlightCard } from '../../components/fx/index.ts';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { pagePath } from '../../site/config.ts';
import type { TourCopy } from './copy.ts';
import { RichText } from './RichText.tsx';
import { COUNTS } from './runs.ts';
import { ScreenViewer } from './screens/ScreenViewer.tsx';

/** Seam between sections: a hairline that opens and a light that sweeps along it while it scrolls past (mirrors Home's). */
export function TourSeam() {
  return (
    <div aria-hidden className="site-container">
      <div className="tour-seam">
        <span className="tour-seam-line" />
        <span className="tour-seam-light" />
      </div>
    </div>
  );
}

/** The agent skill: the real terminal capture and two lines on what it is (phasynctl + optional MCP server, verified in code). */
export function AgentSection({ t }: { t: TourCopy }) {
  return (
    <section id="agent" aria-labelledby="agent-title" className="tour-heading relative scroll-mt-[calc(var(--site-header-h)+1rem)] pt-[clamp(5rem,3rem+9vw,10rem)] pb-[clamp(2rem,1rem+3vw,4rem)]">
      <div className="site-container grid items-center gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="grid content-center justify-items-start gap-5">
          <p aria-hidden lang="en" className="eyebrow flex items-center gap-3 text-brand-cyan">
            <span className="tour-eyebrow-line w-10" />
            <DecodeText text={t.agent.eyebrow} />
          </p>
          <h2 id="agent-title" tabIndex={-1} aria-label={t.agent.title} className="text-headline tracking-display text-balance-cjk text-fg outline-none">
            <RevealText text={t.agent.title} on="view" />
          </h2>
          <p className="reveal max-w-[44ch] text-lead text-balance-cjk text-fg-secondary">
            <RichText text={t.agent.body} />
          </p>
          <ul aria-hidden lang="en" className="reveal flex flex-wrap gap-2">
            <li className="inline-flex h-8 items-center gap-2 rounded-full border border-line-strong bg-raised/80 px-3 font-mono text-[12px] text-fg">
              <Terminal className="size-3.5 text-brand-cyan" aria-hidden />
              phasynctl
            </li>
            <li className="inline-flex h-8 items-center gap-2 rounded-full border border-line-strong bg-raised/80 px-3 font-mono text-[12px] text-fg">
              MCP · {COUNTS.mcpTools} tools
            </li>
          </ul>
        </div>
        <figure className="reveal grid gap-3">
          <HudFrame label="REAL CAPTURE · TERMINAL" orbit innerClassName="rounded-[1.15rem]">
            <ScreenViewer
              capture="terminal-phasynctl"
              alt={t.screens.captures['terminal-phasynctl']}
              drift
              pending={{ title: t.screens.pendingTitle, body: t.screens.pendingBody }}
            />
          </HudFrame>
          <figcaption className="text-caption text-fg-tertiary">{t.screens.captures['terminal-phasynctl']}</figcaption>
        </figure>
      </div>
    </section>
  );
}

/** The one honest block: what the recordings are, and what this tour leaves out on purpose. */
export function NotesSection({ t }: { t: TourCopy }) {
  return (
    <section aria-labelledby="notes-title" className="site-container py-16 md:py-24">
      <div className="reveal mx-auto grid max-w-[54rem] gap-5 rounded-3xl border border-line bg-surface p-6 shadow-edge sm:p-8">
        <h2 id="notes-title" className="flex items-center gap-3 text-section font-semibold text-fg">
          <Info className="size-4 text-info" aria-hidden />
          {t.notes.title}
        </h2>
        <ul className="grid gap-3">
          {t.notes.items.map((item) => (
            <li key={item} className="flex gap-3 text-body text-fg-secondary [text-wrap:pretty]">
              <span aria-hidden className="mt-2.5 size-1 shrink-0 rounded-full bg-fg-tertiary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Closing: where to go next (Benchmarks, About) and the source notice. */
export function ClosingSection({ t }: { t: TourCopy }) {
  const locale = useLocale();
  const common = commonCopy(locale);
  const cards = [
    { to: pagePath(locale, 'benchmarks'), title: common.nav.benchmarks, body: t.closing.benchmarks.body, cta: t.closing.benchmarks.cta, Icon: BarChart3, tag: 'BENCHMARKS' },
    { to: pagePath(locale, 'about'), title: common.nav.about, body: t.closing.about.body, cta: t.closing.about.cta, Icon: BookOpen, tag: 'ABOUT' },
  ];
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden">
      <NebulaField position="absolute" intensity={1} particles={110} className="-z-10 [mask-image:linear-gradient(180deg,transparent,#000_25%,#000_80%,transparent)]" />
      <div className="site-container site-section grid justify-items-center gap-8 text-center">
        <RevealText as="h2" id="closing-title" text={t.closing.title} on="view" className="max-w-[20ch] text-display tracking-display text-balance-cjk text-fg" />
        <p className="reveal max-w-[44ch] text-lead text-balance-cjk text-fg-secondary">{t.closing.lead}</p>
        <ul className="grid w-full max-w-[52rem] gap-4 text-left sm:grid-cols-2">
          {cards.map(({ to, title, body, cta, Icon, tag }) => (
            <li key={to} className="reveal min-w-0">
              <SpotlightCard tilt={4} className="h-full rounded-3xl border-line-subtle">
                <Link to={to} viewTransition className="group grid h-full content-start gap-3 p-6 no-underline sm:p-7">
                  <span className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl border border-action/25 bg-brand-gradient-soft text-brand-cyan">
                      <Icon className="size-[18px]" aria-hidden />
                    </span>
                    <span aria-hidden lang="en" className="eyebrow text-[10px] text-fg-tertiary">
                      {tag}
                    </span>
                  </span>
                  <span className="text-[1.375rem] leading-tight font-semibold text-fg">{title}</span>
                  <span className="text-body text-fg-secondary [text-wrap:pretty]">{body}</span>
                  <span className="mt-1 inline-flex items-center gap-1.5 text-body font-medium text-action-fg group-hover:text-fg">
                    {cta}
                    <ArrowRight className="size-4 transition-transform duration-(--duration-spring-snappy) ease-(--ease-spring-snappy) group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </Link>
              </SpotlightCard>
            </li>
          ))}
        </ul>
        <SourceSoon className="reveal" />
      </div>
    </section>
  );
}
