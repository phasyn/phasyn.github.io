import { BrandMark } from '../brand/BrandMark.tsx';
import { Wordmark } from '../brand/Wordmark.tsx';

// Runs before paint: skip the splash when already seen this session or when motion is reduced.
const SKIP = `(function(){try{var d=document.documentElement;if(sessionStorage.getItem('phasyn.intro')||matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('fx-intro-skip')}else{sessionStorage.setItem('phasyn.intro','1')}}catch(e){document.documentElement.classList.add('fx-intro-skip')}})();`;

/**
 * First-visit splash (≤ 1.7 s, pure CSS, non-blocking): a light burst, the mark resolving out of a blur, a scan line and
 * the wordmark, then the overlay fades away. Decorative only; content underneath is already rendered and interactive
 * once the overlay is gone (it never captures pointer events).
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
              animation: 'fx-intro-burst 1100ms var(--ease-enter) both',
            }}
          />
          <span style={{ animation: 'fx-intro-mark 900ms var(--ease-enter) 80ms both' }}>
            <BrandMark size={112} glow />
          </span>
          <span
            className="h-px w-72 origin-left bg-brand-gradient"
            style={{ animation: 'fx-intro-line 900ms var(--ease-standard) 300ms both' }}
          />
          <span style={{ animation: 'fx-intro-mark 700ms var(--ease-enter) 420ms both' }}>
            <Wordmark width={200} gradient decorative tagline />
          </span>
        </div>
      </div>
    </>
  );
}
