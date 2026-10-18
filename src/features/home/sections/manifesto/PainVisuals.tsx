import { TriangleAlert } from 'lucide-react';
import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { cn } from '../../../../lib/cn.ts';

/*
 * HUD visuals for the pain points of the manifesto. They are decorative (aria-hidden by the parent): the line next to each
 * one carries the meaning. The numbers are a game HUD dramatising the author's words — no service is named and nothing here is a
 * measurement. In the pinned scene the parent drives each visual with its beat progress `vp` (0 → 1) through `register`; in
 * the static grid (`still`) every visual renders its end state and nothing moves.
 */

export type Updater = (vp: number) => void;
export type Register = (update: Updater) => void;

export interface VisualProps {
  register?: Register;
  still?: boolean;
}

/** Calls `apply` with the element and the beat progress whenever the scene scrolls. */
function useDriver<T extends HTMLElement>(register: Register | undefined, apply: (element: T, vp: number) => void): RefObject<T | null> {
  const ref = useRef<T>(null);
  const applyRef = useRef(apply);
  useEffect(() => {
    applyRef.current = apply;
  });
  useEffect(() => {
    register?.((vp) => {
      const element = ref.current;
      if (element) applyRef.current(element, vp);
    });
  }, [register]);
  return ref;
}

const setVp = (element: HTMLElement, vp: number) => element.style.setProperty('--vp', vp.toFixed(3));

function Label({ children, className }: { children: string; className?: string }) {
  return <span className={cn('home-pain-label', className)}>{children}</span>;
}

const CELLS = 25;
const COST = 40;
const START = 1000;
const credits = (rolls: number) => (START - COST * rolls).toLocaleString('en-US');
const tier = (lit: number) => (lit > 12 ? 'ok' : lit > 6 ? 'low' : 'critical');

/* Beat 1 · bad, expensive, sold by the credit — every re-roll burns a cell of the meter. */
export function CreditMeter({ register, still }: VisualProps) {
  const valueRef = useRef<HTMLSpanElement>(null);
  const rollsRef = useRef<HTMLSpanElement>(null);
  const damageRef = useRef<HTMLDivElement>(null);
  const ref = useDriver<HTMLDivElement>(register, (element, vp) => {
    const rolls = Math.min(CELLS - 1, Math.floor(vp * CELLS));
    const previous = Number(element.dataset.rolls ?? 0);
    if (previous === rolls) return;
    element.dataset.rolls = String(rolls);
    const lit = CELLS - rolls;
    element.style.setProperty('--lit', String(lit));
    element.dataset.tier = tier(lit);
    if (valueRef.current) valueRef.current.textContent = credits(rolls);
    if (rollsRef.current) rollsRef.current.textContent = String(rolls);
    const layer = damageRef.current;
    if (layer && rolls > previous && layer.childElementCount < 6) {
      const hit = document.createElement('span');
      hit.className = 'home-damage machine';
      hit.textContent = `−${COST * (rolls - previous)}`;
      hit.style.left = `${(lit / CELLS) * 100}%`;
      hit.addEventListener('animationend', () => hit.remove(), { once: true });
      layer.append(hit);
    }
  });
  const rolls = still ? CELLS - 1 : 0;
  const lit = CELLS - rolls;
  return (
    <div ref={ref} className="home-pain home-credits grid gap-4" data-tier={tier(lit)} data-rolls={rolls} style={{ '--lit': lit } as CSSProperties}>
      <div className="flex items-end justify-between gap-4">
        <span className="grid gap-1.5">
          <Label>CREDITS</Label>
          <span className="machine flex items-baseline gap-1.5 leading-none font-semibold">
            <span ref={valueRef} className="home-credits-value text-[clamp(2rem,1.5rem+1.8vw,3rem)] tabular-nums">
              {credits(rolls)}
            </span>
            <span className="text-[13px] text-fg-tertiary">/ 1,000</span>
          </span>
        </span>
        <span className="grid justify-items-end gap-1.5">
          <Label>RE-ROLLS</Label>
          <span className="machine text-[clamp(1.25rem,1rem+0.8vw,1.625rem)] leading-none font-semibold text-fg tabular-nums">
            ×<span ref={rollsRef}>{rolls}</span>
          </span>
        </span>
      </div>
      <div className="relative">
        <div className="grid grid-cols-[repeat(25,minmax(0,1fr))] gap-[3px]">
          {Array.from({ length: CELLS }, (_, index) => (
            <span key={index} className="home-credit-cell" style={{ '--i': index } as CSSProperties} />
          ))}
        </div>
        <div ref={damageRef} className="pointer-events-none absolute inset-x-0 bottom-full h-10" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label>40 CR / RE-ROLL</Label>
        <span className="home-low machine inline-flex items-center gap-1 text-[11px] font-semibold text-danger">
          <TriangleAlert className="size-3.5" />
          LOW CREDITS
        </span>
      </div>
    </div>
  );
}

/* Beat 2 · local tools ignore acceleration — the needle tries, and falls back to zero. */
export function AccelGauge({ register, still }: VisualProps) {
  const ref = useDriver<HTMLDivElement>(register, setVp);
  const ticks = Array.from({ length: 9 }, (_, index) => {
    const angle = Math.PI - (index / 8) * Math.PI;
    const inner = index % 2 === 0 ? 70 : 76;
    return { x1: 120 + Math.cos(angle) * inner, y1: 124 - Math.sin(angle) * inner, x2: 120 + Math.cos(angle) * 84, y2: 124 - Math.sin(angle) * 84, major: index % 2 === 0 };
  });
  return (
    <div ref={ref} className="home-pain home-gauge grid justify-items-center gap-2" style={still ? undefined : ({ '--vp': 0 } as CSSProperties)}>
      <svg viewBox="0 0 240 142" className="w-full max-w-[19rem] overflow-visible">
        <path d="M 30 124 A 90 90 0 0 1 210 124" className="home-gauge-track" pathLength={100} />
        <path d="M 30 124 A 90 90 0 0 1 210 124" className="home-gauge-potential" pathLength={100} />
        {ticks.map(({ major, ...line }, index) => (
          <line key={index} {...line} className={major ? 'home-gauge-tick-major' : 'home-gauge-tick'} />
        ))}
        <g className="home-gauge-needle">
          <line x1="120" y1="124" x2="42" y2="124" />
        </g>
        <circle cx="120" cy="124" r="6.5" className="home-gauge-hub" />
        <text x="30" y="141" textAnchor="middle" className="home-gauge-text">
          0
        </text>
        <text x="210" y="141" textAnchor="middle" className="home-gauge-text">
          MAX
        </text>
      </svg>
      <div className="-mt-1 grid justify-items-center gap-1">
        <Label>ACCELERATION</Label>
        <span className="home-pain-alert machine text-[clamp(1.5rem,1.15rem+1.2vw,2.125rem)] leading-none font-semibold text-warning">NONE</span>
      </div>
      <div className="mt-2 flex w-full items-center justify-between gap-3 border-t border-line-subtle pt-3">
        <Label>LOCAL TOOLS · BOOST</Label>
        <span className="flex gap-1">
          {[0, 1, 2, 3].map((pip) => (
            <span key={pip} className="h-2 w-4 rounded-[2px] border border-line-strong bg-sunken" />
          ))}
        </span>
      </div>
    </div>
  );
}
