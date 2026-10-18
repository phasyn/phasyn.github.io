import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';
import { sliceChars } from './playback.ts';
import './mock.css';

export type TerminalLineKind = 'user' | 'command' | 'agent' | 'muted' | 'success';

export interface TerminalLine {
  kind: TerminalLineKind;
  /** Line text. Commands are shown verbatim; never put IPs, hostnames, user@host prompts or absolute paths here. */
  text: string;
}

export interface TerminalProps {
  lines: TerminalLine[];
  /** Window title shown in the terminal bar (e.g. "agent"). */
  title?: string;
  /** Play the script while true; once finished it stays complete. */
  run?: boolean;
  /** From `useMockPlayback().armed`; when false every line is shown statically. */
  armed?: boolean;
  /** Typing speed for `user` and `command` lines (characters per second). */
  cps?: number;
  /** Extra content in the bar (e.g. the illustrative badge). */
  badge?: ReactNode;
  className?: string;
}

const PREFIX: Record<TerminalLineKind, { mark: string; className: string; markClass: string }> = {
  user: { mark: '›', className: 'text-fg', markClass: 'text-fg-tertiary' },
  command: { mark: '$', className: 'text-fg', markClass: 'text-brand-cyan' },
  agent: { mark: '●', className: 'text-fg-secondary', markClass: 'text-action-fg' },
  muted: { mark: '·', className: 'text-fg-tertiary', markClass: 'text-fg-tertiary' },
  success: { mark: '✓', className: 'text-success', markClass: 'text-success' },
};

const TYPED: ReadonlySet<TerminalLineKind> = new Set(['user', 'command']);
const DONE = { line: Number.POSITIVE_INFINITY, chars: Number.POSITIVE_INFINITY };

/**
 * Illustrative terminal for agent sessions: user prompts and commands type out, agent replies appear line by line, then the
 * transcript stays complete (no loop). Solid `sunken` surface, mono text, no glow. The full transcript is always in the DOM for
 * assistive tech and no-JS readers; only the visual reveal is staged.
 */
export function Terminal({ lines, title = 'agent', run = false, armed = false, cps = 38, badge, className }: TerminalProps) {
  const [step, setStep] = useState(DONE);

  useEffect(() => {
    if (!armed) {
      setStep(DONE);
      return;
    }
    setStep({ line: 0, chars: 0 });
    if (!run) return;
    let line = 0;
    let chars = 0;
    let timer = 0;
    const advance = () => {
      const current = lines[line];
      if (!current) {
        setStep(DONE);
        return;
      }
      if (TYPED.has(current.kind)) {
        const total = Array.from(current.text).length;
        if (chars < total) {
          chars += 1;
          setStep({ line, chars });
          timer = window.setTimeout(advance, 1000 / cps);
          return;
        }
        line += 1;
        chars = 0;
        setStep({ line, chars });
        timer = window.setTimeout(advance, 420);
        return;
      }
      line += 1;
      chars = 0;
      setStep({ line, chars });
      timer = window.setTimeout(advance, TYPED.has(lines[line]?.kind ?? 'agent') ? 700 : 520);
    };
    timer = window.setTimeout(advance, 450);
    return () => window.clearTimeout(timer);
  }, [armed, run, lines, cps]);

  return (
    <div lang="en" className={cn('flex min-w-0 flex-col overflow-hidden rounded-xl border border-[rgb(255_255_255_/_0.08)] bg-sunken shadow-window', className)}>
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-line-subtle bg-rail px-3.5">
        <span aria-hidden className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
          <span className="size-2.5 rounded-full bg-line-strong" />
        </span>
        <span className="machine min-w-0 truncate text-[12px] text-fg-tertiary">{title}</span>
        <span className="ml-auto flex shrink-0 items-center gap-2">{badge}</span>
      </div>
      <ol className="grid content-start gap-1.5 p-4 font-mono text-[12.5px] leading-5">
        {lines.map((entry, index) => {
          const prefix = PREFIX[entry.kind];
          const hidden = index > step.line || (index === step.line && TYPED.has(entry.kind) && step.chars === 0);
          const partial = index === step.line && TYPED.has(entry.kind) && step.chars > 0;
          const text = partial ? sliceChars(entry.text, step.chars) : entry.text;
          return (
            <li
              key={index}
              {...(hidden ? { 'data-hidden': '' } : {})}
              className={cn('mock-line flex min-w-0 gap-2.5', prefix.className, entry.kind === 'user' && index > 0 && 'mt-2')}
            >
              <span aria-hidden className={cn('w-3 shrink-0 text-center select-none', prefix.markClass)}>
                {prefix.mark}
              </span>
              <span className="min-w-0 break-words whitespace-pre-wrap">
                <span className="sr-only">{entry.text}</span>
                <span aria-hidden>{text}</span>
                {partial ? <span aria-hidden className="mock-caret ml-px inline-block h-[1.05em] w-[0.5em] translate-y-[0.16em] bg-brand-cyan/80" /> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
