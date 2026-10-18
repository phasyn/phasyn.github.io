import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';
import { sliceChars, useTypewriter } from './playback.ts';
import './mock.css';

/** H3 reference mentions as the prompt editor renders them (never translated). */
const MENTION_SPLIT = /(@(?:Image|Video|Audio)\d+)/;
const IS_MENTION = /^@(?:Image|Video|Audio)\d+$/;

export interface PromptBoxProps {
  /** The full prompt. `@Image1` / `@Video1` / `@Audio1` mentions render as reference chips. */
  text: string;
  /** Type the prompt out while true (see `useTypewriter`); false shows it complete or, once armed, waits off screen. */
  run?: boolean;
  /** From `useMockPlayback().armed`; when false the full prompt is shown statically. */
  armed?: boolean;
  /** Characters per second while typing. */
  cps?: number;
  /** Content under the text (counters, advisor badge…). */
  footer?: ReactNode;
  className?: string;
}

/**
 * Illustrative prompt editor field: sunken input, reference mentions as chips, a typing effect with a caret.
 * The typed text is decorative (`aria-hidden`); the complete prompt is always present for assistive tech.
 */
export function PromptBox({ text, run = false, armed = false, cps = 32, footer, className }: PromptBoxProps) {
  const count = useTypewriter(text, { run, armed, cps });
  const shown = sliceChars(text, count);
  const typing = armed && count < Array.from(text).length;
  return (
    <div className={cn('rounded-md border border-line-control/70 bg-sunken', className)}>
      <p className="sr-only">{text}</p>
      <p aria-hidden className="min-h-[4.5rem] px-3 py-2.5 text-data leading-[1.6] break-words text-fg">
        {shown.split(MENTION_SPLIT).map((part, index) =>
          IS_MENTION.test(part) ? (
            <span key={index} className="machine mx-px rounded-sm bg-brand-soft px-1 py-px text-[0.92em] text-action-fg">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          ),
        )}
        {typing ? <span className="mock-caret ml-px inline-block h-[1.1em] w-px translate-y-[0.18em] bg-brand-cyan" /> : null}
      </p>
      {footer ? <div className="flex items-center gap-2 border-t border-line-subtle px-3 py-1.5 text-caption text-fg-tertiary">{footer}</div> : null}
    </div>
  );
}
