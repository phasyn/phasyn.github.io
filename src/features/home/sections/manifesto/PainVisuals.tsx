import { TrendingDown, TrendingUp, TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { cn } from '../../../../lib/cn.ts';

/*
 * HUD visuals for the five pain points of the manifesto. They are decorative (aria-hidden by the parent): the line next to each
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

/* 01 · bad and expensive — quality falls while the price climbs. */
export function QualityPrice({ register, still }: VisualProps) {
  const ref = useDriver<HTMLDivElement>(register, setVp);
  return (
    <div ref={ref} className="home-pain grid gap-5" style={still ? undefined : ({ '--vp': 0 } as CSSProperties)}>
      {(
        [
          ['QUALITY', 'LOW', 'danger', 'home-qp-quality'],
          ['PRICE', 'HIGH', 'warning', 'home-qp-price'],
        ] as const
      ).map(([label, verdict, tone, bar]) => (
        <div key={label} className="grid gap-2">
          <div className="flex items-center justify-between gap-3">
            <Label>{label}</Label>
            <span className={cn('machine inline-flex items-center gap-1 text-[12px] font-semibold', tone === 'danger' ? 'text-danger' : 'text-warning')}>
              {tone === 'danger' ? <TrendingDown className="size-3.5" /> : <TrendingUp className="size-3.5" />}
              {verdict}
            </span>
          </div>
          <span className="home-seg-track">
            <span className={cn('home-seg-fill', bar, tone === 'danger' ? 'home-fill-danger' : 'home-fill-warning')} />
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between gap-3 border-t border-line-subtle pt-3.5">
        <Label>VALUE</Label>
        <span className="home-pain-alert machine inline-flex items-center gap-1.5 text-[13px] font-semibold text-danger">
          <X className="size-3.5" />
          POOR
        </span>
      </div>
    </div>
  );
}

const CELLS = 25;
const COST = 40;
const START = 1000;
const credits = (rolls: number) => (START - COST * rolls).toLocaleString('en-US');
const tier = (lit: number) => (lit > 12 ? 'ok' : lit > 6 ? 'low' : 'critical');

/* 02 · credits bleed you dry — every re-roll burns a cell of the meter. */
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

const pad = (value: number) => String(value).padStart(2, '0');
const mmss = (seconds: number) => `${pad(Math.floor(seconds / 60))}:${pad(Math.round(seconds % 60))}`;
const ETA_FROM = 150;
const ETA_TO = 840;

function Reel({ reelRef, length, value }: { reelRef: RefObject<HTMLSpanElement | null>; length: number; value: number }) {
  return (
    <span className="home-reel">
      <span ref={reelRef} className="home-reel-strip" style={{ '--n': value } as CSSProperties}>
        {Array.from({ length }, (_, index) => (
          <span key={index}>{index % 10}</span>
        ))}
      </span>
    </span>
  );
}

/* 03 · regenerate again and again, still slow — a slot-machine re-roll counter over a queue whose ETA keeps growing. */
export function RerollQueue({ register, still }: VisualProps) {
  const tensRef = useRef<HTMLSpanElement>(null);
  const onesRef = useRef<HTMLSpanElement>(null);
  const etaRef = useRef<HTMLSpanElement>(null);
  const ref = useDriver<HTMLDivElement>(register, (element, vp) => {
    setVp(element, vp);
    const count = 1 + Math.min(23, Math.floor(vp * 24));
    if (element.dataset.count !== String(count)) {
      element.dataset.count = String(count);
      tensRef.current?.style.setProperty('--n', String(Math.floor(count / 10)));
      onesRef.current?.style.setProperty('--n', String(count));
    }
    if (etaRef.current) etaRef.current.textContent = mmss(ETA_FROM + vp * (ETA_TO - ETA_FROM));
  });
  const count = still ? 24 : 1;
  return (
    <div ref={ref} className="home-pain home-reroll grid gap-5" style={still ? undefined : ({ '--vp': 0 } as CSSProperties)}>
      <div className="flex items-center justify-between gap-4">
        <span className="grid gap-1.5">
          <Label>RE-ROLL</Label>
          <Label className="text-fg-disabled">SAME PROMPT</Label>
        </span>
        <span className="home-slot machine">
          <span className="home-slot-x">×</span>
          <Reel reelRef={tensRef} length={10} value={Math.floor(count / 10)} />
          <Reel reelRef={onesRef} length={30} value={count} />
        </span>
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between gap-3">
          <Label>QUEUE · ETA</Label>
          <span ref={etaRef} className="machine text-[15px] font-semibold text-warning tabular-nums">
            {mmss(still ? ETA_TO : ETA_FROM)}
          </span>
        </div>
        <span className="home-eta-track">
          <span className="home-eta-fill" />
          <span className="home-eta-done" />
        </span>
        <div className="flex items-center justify-between gap-3">
          <Label>RENDERING</Label>
          <Label className="text-warning">NOT FASTER</Label>
        </div>
      </div>
    </div>
  );
}

const THUMBS = [
  { kind: 'blocks', tag: 'ARTIFACTS' },
  { kind: 'flicker', tag: 'FLICKER' },
  { kind: 'smear', tag: 'SMEAR' },
] as const;

/* 04 · sloppy products, and you pay — low-effort outputs that glitch, each with its price. */
export function GlitchThumbs({ register, still }: VisualProps) {
  const paidRef = useRef<HTMLSpanElement>(null);
  const ref = useDriver<HTMLDivElement>(register, (element, vp) => {
    const shown = Math.min(3, 1 + Math.floor(vp * 3));
    if (element.dataset.shown === String(shown)) return;
    element.dataset.shown = String(shown);
    element.style.setProperty('--shown', String(shown));
    if (paidRef.current) paidRef.current.textContent = `PAID · ${shown} / 3`;
  });
  const shown = still ? 3 : 1;
  return (
    <div ref={ref} className="home-pain home-thumbs grid gap-4" data-shown={shown} style={{ '--shown': shown } as CSSProperties}>
      <div className="grid grid-cols-3 gap-2.5">
        {THUMBS.map((thumb, index) => (
          <div key={thumb.kind} className="home-thumb" data-kind={thumb.kind} style={{ '--i': index } as CSSProperties}>
            <span className="home-thumb-scene" />
            <span className="home-thumb-fx" />
            <span className="home-thumb-tag machine">{thumb.tag}</span>
            <span className="home-thumb-cost machine">−120 CR</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-3">
        <Label>OUTPUT · LOW EFFORT</Label>
        <span ref={paidRef} className="machine text-[11px] font-semibold text-danger">
          PAID · {shown} / 3
        </span>
      </div>
    </div>
  );
}

/* 05 · local tools ignore acceleration — the needle tries, and falls back to zero. */
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
        {ticks.map((tick, index) => (
          <line key={index} {...tick} className={tick.major ? 'home-gauge-tick-major' : 'home-gauge-tick'} />
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
