import { PerformanceMonitor } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useState, type RefObject } from 'react';
import { FrameStackScene, type PointerState } from './FrameStackScene.tsx';
import { higherTier, initialTier, lowerTier, TIERS, type QualityTier } from './quality.ts';

export interface HeroCanvasProps {
  /** False while any pause reason holds (offscreen, hidden tab, user pause, lost context): no frames are rendered. */
  running: boolean;
  progressRef: RefObject<number>;
  pointerRef: RefObject<PointerState>;
  onReady: () => void;
  onContextLost: () => void;
  onContextRestored: () => void;
  className?: string;
}

function readDeviceHints() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  return {
    cores: nav.hardwareConcurrency,
    memoryGB: nav.deviceMemory,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    width: window.innerWidth,
    saveData: nav.connection?.saveData,
  };
}

/** Forwards WebGL context loss/restore to the DOM owner, which swaps to the poster meanwhile. */
function ContextWatcher({ onLost, onRestored }: { onLost: () => void; onRestored: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    // three's renderer already calls preventDefault() on loss so the browser may restore the context.
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl, onLost, onRestored]);
  return null;
}

/**
 * The hero's WebGL canvas (lazy chunk). One R3F loop; `frameloop="never"` while paused. Quality tiers adapt with drei's
 * PerformanceMonitor (hysteresis, settles after repeated flip-flops). R3F disposes the scene graph, the renderer and forces
 * context loss on unmount; the scene disposes the resources it built itself.
 */
export default function HeroCanvas({ running, progressRef, pointerRef, onReady, onContextLost, onContextRestored, className }: HeroCanvasProps) {
  const [tier, setTier] = useState<QualityTier>(() => initialTier(readDeviceHints()));
  const settings = TIERS[tier];
  return (
    <Canvas
      className={className}
      aria-hidden
      dpr={[1, settings.dprMax]}
      frameloop={running ? 'always' : 'never'}
      gl={{ antialias: false, alpha: false, stencil: false, depth: true, powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0, 10] }}
      style={{ pointerEvents: 'none' }}
      data-hero-tier={tier}
    >
      <color attach="background" args={['#070b14']} />
      <ContextWatcher onLost={onContextLost} onRestored={onContextRestored} />
      <PerformanceMonitor
        ms={250}
        iterations={12}
        threshold={0.75}
        flipflops={3}
        onDecline={() => setTier(lowerTier)}
        onIncline={() => setTier(higherTier)}
        onFallback={() => setTier((current) => (current === 'high' ? 'balanced' : current))}
      />
      <FrameStackScene tier={tier} progressRef={progressRef} pointerRef={pointerRef} onReady={onReady} />
      <EffectComposer multisampling={settings.multisampling} enableNormalPass={false}>
        {settings.bloom ? <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.22} intensity={0.85} radius={0.72} levels={settings.bloomLevels} /> : <></>}
        <Vignette offset={0.22} darkness={0.5} />
        <ToneMapping mode={ToneMappingMode.NEUTRAL} />
      </EffectComposer>
    </Canvas>
  );
}
