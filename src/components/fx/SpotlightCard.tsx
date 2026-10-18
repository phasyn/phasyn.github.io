import { useRef, type PointerEvent, type ReactNode } from 'react';
import { cn } from '../../lib/cn.ts';

interface SpotlightCardProps {
  children: ReactNode;
  /** Max tilt in degrees (0 disables tilt). */
  tilt?: number;
  className?: string;
}

/**
 * Card with a light that follows the pointer, a glare, and a gentle 3D tilt (fine pointers only; nothing moves under
 * reduced motion — the CSS media query zeroes the transform).
 */
export function SpotlightCard({ children, tilt = 6, className }: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const element = ref.current;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.style.setProperty('--sx', `${x * 100}%`);
      element.style.setProperty('--sy', `${y * 100}%`);
      element.style.setProperty('--rx', `${(0.5 - y) * tilt}deg`);
      element.style.setProperty('--ry', `${(x - 0.5) * tilt}deg`);
      element.dataset.hot = 'true';
    });
  };

  const onLeave = () => {
    const element = ref.current;
    if (!element) return;
    cancelAnimationFrame(frame.current);
    element.style.setProperty('--rx', '0deg');
    element.style.setProperty('--ry', '0deg');
    delete element.dataset.hot;
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        'group/spot relative isolate overflow-hidden rounded-2xl border border-line bg-surface shadow-raised',
        'transition-[transform,border-color,box-shadow] duration-(--duration-spring-snappy) ease-(--ease-spring-snappy)',
        'motion-safe:[transform:perspective(900px)_rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))]',
        'data-[hot]:border-action/50 data-[hot]:shadow-glow-sm',
        className,
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-(--duration-base) group-data-[hot]/spot:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--sx, 50%) var(--sy, 50%), rgb(62 137 255 / 0.18), rgb(171 123 255 / 0.08) 40%, transparent 70%)' }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-0 mix-blend-screen transition-opacity duration-(--duration-base) group-data-[hot]/spot:opacity-100"
        style={{ background: 'radial-gradient(160px circle at var(--sx, 50%) var(--sy, 50%), rgb(255 255 255 / 0.10), transparent 70%)' }}
      />
      {children}
    </div>
  );
}
