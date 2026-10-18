import { useEffect, useRef } from 'react';
import { useReducedMotion } from '../../lib/hooks.ts';

/**
 * Soft brand light that trails the mouse across the page (fine pointers only, never under reduced motion). The frame loop
 * runs only while the light is catching up with the pointer: it stops once settled and restarts on the next move (FE-05).
 */
export function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion || !window.matchMedia('(pointer: fine)').matches) return;
    let frame = 0;
    let shown = false;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 3;
    let tx = x;
    let ty = y;
    const place = () => {
      element.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
    };
    const loop = () => {
      const dx = tx - x;
      const dy = ty - y;
      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        x = tx;
        y = ty;
        place();
        frame = 0;
        return;
      }
      x += dx * 0.14;
      y += dy * 0.14;
      place();
      frame = requestAnimationFrame(loop);
    };
    const onMove = (event: PointerEvent) => {
      tx = event.clientX;
      ty = event.clientY;
      if (!shown) {
        shown = true;
        element.style.opacity = '1';
      }
      if (!frame) frame = requestAnimationFrame(loop);
    };
    place();
    window.addEventListener('pointermove', onMove, { passive: true });
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
