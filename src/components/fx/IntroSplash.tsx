import { BrandMark } from '../brand/BrandMark.tsx';
import { Wordmark } from '../brand/Wordmark.tsx';

/** Hold before the overlay fades; equals `--fx-intro-delay` in site.css (hero entrances start here). */
const HOLD_MS = 700;
/** Whole splash, fade included (`fx-intro-out` in site.css). */
const TOTAL_MS = 1000;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/*
 * Runs before paint (FE-04). Skips the splash under reduced motion and when it was seen in the last 7 days (localStorage
 * timestamp; sessionStorage when localStorage is blocked; skipped outright when storage is unavailable, so it never
 * replays on every page). Otherwise the first pointer, key, wheel or touch input during the hold skips it: the overlay fades
 * in 160 ms, `--fx-intro-delay` drops to 0 so hero entrances start now, and an `fx-intro-skip` event tells scripts.
 */
const SKIP = `(function(){var d=document.documentElement,K='phasyn.intro',seen=1;try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){try{var t=+localStorage.getItem(K);seen=t>0&&Date.now()-t<${WEEK_MS};if(!seen)localStorage.setItem(K,String(Date.now()))}catch(e){seen=!!sessionStorage.getItem(K);if(!seen)sessionStorage.setItem(K,'1')}}}catch(e){seen=1}if(seen){d.classList.add('fx-intro-skip');return}var T=['pointerdown','keydown','wheel','touchstart'],t0=performance.now();function off(){T.forEach(function(n){removeEventListener(n,skip,true)})}function skip(){off();if(performance.now()-t0<${HOLD_MS}){d.classList.add('fx-intro-skip','fx-intro-leaving');dispatchEvent(new Event('fx-intro-skip'))}}T.forEach(function(n){addEventListener(n,skip,{capture:true,passive:true})});setTimeout(off,${TOTAL_MS})})();`;

/**
 * First-visit splash (1 s, pure CSS, non-blocking): a light burst, the mark resolving out of a blur, a scan line and the
 * wordmark, then the overlay fades away. Decorative only; content underneath is already rendered and interactive (the
 * overlay never captures pointer events), and any input during the hold dismisses it.
 */
export function IntroSplash() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SKIP }} />
      <div aria-hidden className="fx-intro">
        <div className="relative grid justify-items-center gap-6">
          <span
            className="absolute top-1/2 left-1/2 -mt-[160px] -ml-[160px] size-[320px] rounded-full"
            style={{
              background: 'radial-gradient(closest-side, rgb(73 207 255 / 0.55), rgb(114 125 255 / 0.25) 45%, transparent 70%)',
              animation: 'fx-intro-burst 650ms var(--ease-enter) both',
            }}
          />
          <span style={{ animation: 'fx-intro-mark 530ms var(--ease-enter) 50ms both' }}>
            <BrandMark size={112} glow />
          </span>
          <span
            className="h-px w-72 origin-left bg-brand-gradient"
            style={{ animation: 'fx-intro-line 530ms var(--ease-standard) 180ms both' }}
          />
          <span style={{ animation: 'fx-intro-mark 410ms var(--ease-enter) 250ms both' }}>
            <Wordmark width={200} gradient decorative tagline />
          </span>
        </div>
      </div>
    </>
  );
}
