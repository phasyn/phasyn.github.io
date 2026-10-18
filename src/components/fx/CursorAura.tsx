import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../lib/hooks.ts';

/** Soft brand light that trails the mouse across the page (fine pointers only, never under reduced motion). */
export function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    let tx = x;
    let ty = y;
    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      element.style.opacity = '1';
    };
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      element.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-40 size-[600px] rounded-full opacity-0 mix-blend-screen transition-opacity duration-500"
      style={{ background: 'radial-gradient(closest-side, rgb(62 137 255 / 0.10), rgb(171 123 255 / 0.05) 45%, transparent 70%)' }}
    />
  );
}
