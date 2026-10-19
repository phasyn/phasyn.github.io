import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../../lib/cn.ts';

const GAP = 8;
const EDGE = 12;

/*
 * A small explanation popover (material-popover) for chips and column headers: opens on hover and keyboard focus, toggles on
 * tap, closes on Escape, blur or scroll. Rendered into <body> with fixed positioning so table scrollers never clip it, and
 * clamped to the viewport. The same text is always reachable without it (row details, captions), so it never gates content.
 */
export function Hint({ content, children, className }: { content: ReactNode; children: ReactNode; className?: string }) {
  const id = useId();
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return;
    }
    const trigger = triggerRef.current?.getBoundingClientRect();
    const tip = tipRef.current?.getBoundingClientRect();
    if (!trigger || !tip) return;
    const above = trigger.top > tip.height + GAP + EDGE;
    const left = Math.min(Math.max(trigger.left + trigger.width / 2 - tip.width / 2, EDGE), window.innerWidth - tip.width - EDGE);
    const top = above ? trigger.top - tip.height - GAP : trigger.bottom + GAP;
    setStyle({ left, top });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('scroll', close, { passive: true, capture: true });
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, { capture: true });
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={open ? id : undefined}
        className={cn('cursor-help rounded-full outline-offset-2', className)}
        onPointerEnter={(event: PointerEvent) => {
          if (event.pointerType === 'mouse') setOpen(true);
        }}
        onPointerLeave={(event: PointerEvent) => {
          if (event.pointerType === 'mouse') setOpen(false);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(event: MouseEvent) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
      >
        {children}
      </span>
      {open
        ? createPortal(
            <span
              ref={tipRef}
              id={id}
              role="tooltip"
              className="overlay-surface material-popover pointer-events-none fixed top-0 left-0 z-[70] block w-max max-w-[min(20rem,calc(100vw-1.5rem))] px-3 py-2 text-caption text-fg-secondary motion-safe:animate-pop-in"
              style={style ? { left: style.left, top: style.top } : { visibility: 'hidden' }}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </>
  );
}
