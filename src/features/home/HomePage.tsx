import { commonCopy } from '../../i18n/common.ts';
import { useLocale } from '../../i18n/locale.tsx';
import { SourceSoon } from '../../components/ui/SourceSoon.tsx';
import { CountUp, DataTicker, DecodeText, HudFrame, RevealText, SpotlightCard } from '../../components/fx/index.ts';

// Placeholder until the home page lands; doubles as a visual check of the shared FX kit.
export function HomePage() {
  const copy = commonCopy(useLocale());
  return (
    <>
      <section className="site-container grid min-h-[86dvh] content-center gap-6 pt-(--site-header-h)">
        <p className="eyebrow text-brand-cyan" lang="en">
          <DecodeText text="PHASE · FRAME · SYNTHESIS" afterIntro />
        </p>
        <RevealText as="h1" on="load" text={copy.footerTagline} className="text-hero tracking-display text-balance-cjk text-fg" />
        <SourceSoon className="justify-self-start" />
      </section>
      <DataTicker
        label="Measured today"
        items={[
          { label: 'TE · te-gb10', value: '1.3 s', device: 'gb10' },
          { label: 'DiT · dit-5080', value: '32.0 s', device: 'rtx5080' },
          { label: 'Video VAE · vae-5080', value: '22.4 s', device: 'rtx5080' },
          { label: 'Audio VAE · audio-3060', value: '0.9 s', device: 'rtx3060' },
          { label: 'Mux · CPU', value: '0.3 s', device: 'cpu' },
        ]}
      />
      <section className="site-container site-section grid gap-10 md:grid-cols-2">
        <HudFrame label="LIVE · RTX 5080" scan orbit>
          <img src="/brand/backgrounds/hero.webp" alt="" className="aspect-video w-full object-cover" />
        </HudFrame>
        <SpotlightCard className="grid content-center gap-3 p-8">
          <p className="eyebrow text-fg-tertiary" lang="en">
            DiT · FL2VA
          </p>
          <p className="text-display font-semibold text-fg">
            <CountUp value={32.0} decimals={1} /> s
          </p>
          <RevealText as="p" text={copy.footerMadeBy} className="text-lead text-fg-secondary" />
        </SpotlightCard>
      </section>
    </>
  );
}
