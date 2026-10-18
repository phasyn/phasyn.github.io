import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { createStudioEnvironment } from './environment.ts';
import { dustGeometry, glassSlab, hairlineGeometry, ribbonGeometry, roundedRectShape, roundedTriangleShape } from './geometry.ts';
import { MAX_PARTICLES, TIERS, type QualityTier } from './quality.ts';
import { dustFragment, dustVertex, gridFragment, gridVertex, hairlineFragment, hairlineVertex, ribbonFragment, ribbonVertex } from './shaders.ts';

export interface PointerState {
  x: number;
  y: number;
}

interface FrameStackSceneProps {
  tier: QualityTier;
  /** Scroll progress through the hero, 0–1, written by the DOM owner (no React state per frame). */
  progressRef: RefObject<number>;
  /** Pointer position in −1…1, written by the DOM owner. */
  pointerRef: RefObject<PointerState>;
  /** Called once after the first frames have rendered. */
  onReady: () => void;
}

// Brand light, converted to linear working space by THREE.Color.
const BRAND = ['#49cfff', '#3e89ff', '#727dff', '#ab7bff'] as const;

// Frames: tall rounded panes staggered up-right into depth (the logo's stem), plus a play triangle where the P's bowl sits.
const PANES = 6;
const PANE = { width: 1, height: 1.62, radius: 0.11, depth: 0.024, bevel: 0.012 };
const TRIANGLE = { height: 1.28, radius: 0.13 };
const STEP = new THREE.Vector3(0.27, 0.15, -0.44);
const TRIANGLE_LOCAL = new THREE.Vector3(1.78, 0.62, -1.15);
// Centre of the arrangement in local space, so the rig rotates around its middle.
const CENTER = new THREE.Vector3(0.92, 0.36, -1.12);
const STACK_EULER = new THREE.Euler(0.1, -0.56, 0.02);
/** Seconds of the ignition sequence after the first frame. */
const INTRO = 2.6;
/**
 * As the frames land in the film strip they fill with real Phasyn Studio output (Qwen-Image 2.1 stills from Image Studio),
 * cropped to the frame's portrait shape around a focus point (0–1 across the still).
 */
const STRIP_STILLS = [
  { src: '/images/home/still-cliff.webp', focus: 0.21 },
  { src: '/images/home/still-rain.webp', focus: 0.42 },
  { src: '/images/home/still-ocean.webp', focus: 0.27 },
  { src: '/images/home/still-portrait.webp', focus: 0.6 },
  { src: '/images/home/still-cliff.webp', focus: 0.62 },
  { src: '/images/home/still-ocean.webp', focus: 0.72 },
] as const;
const STILL_ASPECT = 1152 / 672;

/** Energy streams around the stack (points relative to the stack centre, in stack-scale units). */
const STREAMS = [
  {
    points: [
      [-6.6, -3.2, -3.8],
      [-3.3, -1.8, -3.3],
      [-0.4, -0.45, -3.6],
      [2.3, 0.95, -3.1],
      [5.8, 3.4, -4.6],
    ],
    width: 1.05,
    speed: 0.34,
    hue: 0,
    intensity: 1.15,
    comet: { speed: 0.1, phase: 0, gain: 2.2 },
  },
  {
    points: [
      [-6.2, -0.9, -2.9],
      [-3.1, -2.4, -2.3],
      [0.1, -2.05, -1.6],
      [2.6, -0.55, -2.5],
      [5.9, 1.9, -4.2],
    ],
    width: 0.62,
    speed: 0.52,
    hue: 0.2,
    intensity: 0.95,
    comet: { speed: 0.13, phase: 0.42, gain: 2 },
  },
  {
    points: [
      [-2.6, 3.4, -5.4],
      [0.4, 2.55, -4.6],
      [3.1, 2.95, -5.3],
      [6.4, 1.1, -6.2],
    ],
    width: 0.34,
    speed: 0.62,
    hue: 0.42,
    intensity: 0.8,
    comet: { speed: 0.16, phase: 0.75, gain: 1.8 },
  },
] as const;

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const damp = (current: number, target: number, rate: number, dt: number) => current + (target - current) * (1 - Math.exp(-rate * dt));

function paletteColor(t: number, out: THREE.Color): THREE.Color {
  const stops = BRAND.map((hex) => new THREE.Color(hex));
  const scaled = clamp01(t) * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(scaled));
  return out.copy(stops[index]!).lerp(stops[index + 1]!, scaled - index);
}

/** 4-stop diagonal gradient (115deg) used as the glass panes' inner light. */
function createGradientTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d')!;
  const gradient = context.createLinearGradient(0, 0, size, size * 0.72);
  gradient.addColorStop(0, BRAND[0]);
  gradient.addColorStop(0.36, BRAND[1]);
  gradient.addColorStop(0.68, BRAND[2]);
  gradient.addColorStop(1, BRAND[3]);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  // Keep the middle of each pane darker than its edges: glass, not a lamp.
  const vignette = context.createRadialGradient(size * 0.55, size * 0.5, size * 0.1, size * 0.5, size * 0.5, size * 0.75);
  vignette.addColorStop(0, 'rgba(4, 7, 16, 0.62)');
  vignette.addColorStop(1, 'rgba(4, 7, 16, 0)');
  context.fillStyle = vignette;
  context.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  // Canvas y runs down, UV v runs up: flip so cyan sits at the top-left of each pane.
  texture.flipY = true;
  return texture;
}

const brandUniforms = () => ({
  uC0: { value: new THREE.Color(BRAND[0]) },
  uC1: { value: new THREE.Color(BRAND[1]) },
  uC2: { value: new THREE.Color(BRAND[2]) },
  uC3: { value: new THREE.Color(BRAND[3]) },
});

function createAssets() {
  const paneShape = roundedRectShape(PANE.width, PANE.height, PANE.radius);
  const triangleShape = roundedTriangleShape(TRIANGLE.height, TRIANGLE.radius);
  const paneGeometry = glassSlab(paneShape, PANE.depth, PANE.bevel);
  const triangleGeometry = glassSlab(triangleShape, PANE.depth, PANE.bevel);
  const paneHairline = hairlineGeometry(paneShape, 0.012);
  const triangleHairline = hairlineGeometry(triangleShape, 0.012);
  // glassSlab centres the triangle on its bounding box; centre its outline the same way.
  const triangleBox = new THREE.Box3().setFromBufferAttribute(triangleHairline.getAttribute('position') as THREE.BufferAttribute);
  const triangleCenter = triangleBox.getCenter(new THREE.Vector3());
  triangleHairline.translate(-triangleCenter.x, -triangleCenter.y, 0);

  const streams = STREAMS.map((stream) => {
    const curve = new THREE.CatmullRomCurve3(
      stream.points.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
      false,
      'catmullrom',
      0.4,
    );
    const geometry = ribbonGeometry(curve, stream.width);
    const material = new THREE.ShaderMaterial({
      vertexShader: ribbonVertex,
      fragmentShader: ribbonFragment,
      uniforms: {
        ...brandUniforms(),
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uSpeed: { value: stream.speed },
        uHue: { value: stream.hue },
        uComet: { value: 0 },
        uCometGain: { value: stream.comet.gain },
      },
      // Opaque list (refracted by the glass) + additive blending (three applies it whenever blending isn't Normal).
      blending: THREE.AdditiveBlending,
      transparent: false,
      depthWrite: false,
    });
    return { geometry, material };
  });

  // Rounded inner face for the stills, UVs normalised to 0–1.
  const insetShape = roundedRectShape(PANE.width - 0.05, PANE.height - 0.05, PANE.radius - 0.022);
  const stillGeometry = new THREE.ShapeGeometry(insetShape, 12);
  {
    const position = stillGeometry.getAttribute('position');
    const uv = stillGeometry.getAttribute('uv');
    for (let i = 0; i < position.count; i++) {
      uv.setXY(i, position.getX(i) / (PANE.width - 0.05) + 0.5, position.getY(i) / (PANE.height - 0.05) + 0.5);
    }
    uv.needsUpdate = true;
  }
  const stillMaterials = STRIP_STILLS.map(
    () => new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff'), transparent: true, opacity: 0, depthWrite: false }),
  );

  const dust = dustGeometry(MAX_PARTICLES);
  const bokeh = dustGeometry(90, 777);
  const gradient = createGradientTexture();
  const tint = new THREE.Color();

  const paneMaterials = Array.from({ length: PANES + 1 }, (_, index) => {
    const isTriangle = index === PANES;
    const shift = isTriangle ? 0.85 : index / (PANES - 1);
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e6eeff'),
      metalness: 0,
      roughness: 0.18,
      transmission: 1,
      thickness: 0.34,
      ior: 1.38,
      attenuationColor: paletteColor(0.15 + shift * 0.85, tint.clone()),
      attenuationDistance: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      specularIntensity: 1,
      envMapIntensity: 1.5,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: gradient,
      emissiveIntensity: 0,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  });

  const hairlineMaterials = Array.from({ length: PANES + 1 }, (_, index) => {
    const isTriangle = index === PANES;
    const half = isTriangle
      ? new THREE.Vector2(triangleBox.max.x - triangleCenter.x, triangleBox.max.y - triangleCenter.y)
      : new THREE.Vector2(PANE.width / 2, PANE.height / 2);
    return new THREE.ShaderMaterial({
      vertexShader: hairlineVertex,
      fragmentShader: hairlineFragment,
      uniforms: {
        ...brandUniforms(),
        uHalf: { value: half },
        uShift: { value: isTriangle ? 0.9 : index / (PANES - 1) },
        uIntensity: { value: isTriangle ? 2.1 : 1.7 - (index / (PANES - 1)) * 0.5 },
        uPulse: { value: 4.6 },
        uHead: { value: 0 },
        uFade: { value: 0 },
        uFlash: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  });

  const dustMaterial = new THREE.ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    uniforms: {
      ...brandUniforms(),
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: 52 },
      uWarp: { value: 0 },
      uOpacity: { value: 0 },
      uSoftness: { value: 0 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  // Large, defocused motes close to the lens for depth.
  const bokehMaterial = new THREE.ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    uniforms: {
      ...brandUniforms(),
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: 230 },
      uWarp: { value: 0 },
      uOpacity: { value: 0 },
      uSoftness: { value: 0.18 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const gridGeometry = new THREE.PlaneGeometry(44, 44, 1, 1);
  gridGeometry.rotateX(-Math.PI / 2);
  const gridMaterial = new THREE.ShaderMaterial({
    vertexShader: gridVertex,
    fragmentShader: gridFragment,
    uniforms: {
      ...brandUniforms(),
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uScan: { value: -10 },
      uCenter: { value: new THREE.Vector2(0, 0) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  return {
    paneGeometry,
    paneHairline,
    triangleGeometry,
    triangleHairline,
    streams,
    dust,
    bokeh,
    gradient,
    paneMaterials,
    hairlineMaterials,
    dustMaterial,
    bokehMaterial,
    gridGeometry,
    gridMaterial,
    stillGeometry,
    stillMaterials,
    dispose: () => {
      for (const geometry of [paneGeometry, paneHairline, triangleGeometry, triangleHairline, dust, bokeh, gridGeometry, stillGeometry]) geometry.dispose();
      for (const material of stillMaterials) {
        material.map?.dispose();
        material.dispose();
      }
      for (const stream of streams) {
        stream.geometry.dispose();
        stream.material.dispose();
      }
      for (const material of [...paneMaterials, ...hairlineMaterials, dustMaterial, bokehMaterial, gridMaterial]) material.dispose();
      gradient.dispose();
    },
  };
}

interface Layout {
  center: THREE.Vector3;
  scale: number;
  stripY: number;
  stripZ: number;
  stripSpacing: number;
  stripScale: number;
  wide: boolean;
}

/** Where the stack sits for the current viewport (world units at z = 0): right of the copy when wide, above it when tall. */
function computeLayout(viewportWidth: number, viewportHeight: number, out: Layout): Layout {
  const aspect = viewportWidth / viewportHeight;
  out.wide = aspect > 1;
  if (out.wide) {
    out.scale = Math.min(1.15, Math.max(0.72, viewportHeight / 5.1));
    out.center.set(viewportWidth * 0.235, viewportHeight * 0.02, 0);
    out.stripY = -viewportHeight * 0.1;
    out.stripZ = 0.6;
    out.stripScale = Math.min(1, Math.max(0.62, viewportWidth / 8.6));
  } else {
    out.scale = Math.min(0.95, Math.max(0.48, viewportWidth / 4.8));
    out.center.set(viewportWidth * 0.04, viewportHeight * 0.235, 0);
    out.stripY = -viewportHeight * 0.02;
    out.stripZ = 0.4;
    out.stripScale = Math.min(0.9, Math.max(0.5, viewportWidth / 3.4));
  }
  out.stripSpacing = 1.24 * out.stripScale;
  return out;
}

// Scratch objects for the frame loop (no allocation per frame).
const scratch = {
  layout: { center: new THREE.Vector3(), scale: 1, stripY: 0, stripZ: 0, stripSpacing: 1, stripScale: 1, wide: true } as Layout,
  rigQuat: new THREE.Quaternion(),
  euler: new THREE.Euler(),
  local: new THREE.Vector3(),
  stackPos: new THREE.Vector3(),
  stripPos: new THREE.Vector3(),
  stripQuat: new THREE.Quaternion(),
  target: new THREE.Vector3(),
};

export function FrameStackScene({ tier, progressRef, pointerRef, onReady }: FrameStackSceneProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const assets = useMemo(createAssets, []);
  const paneRefs = useRef<(THREE.Mesh | null)[]>([]);
  const streamGroup = useRef<THREE.Group>(null);
  const grid = useRef<THREE.Mesh>(null);
  const motion = useRef({ progress: 0, lastProgress: 0, warp: 0, pointerX: 0, pointerY: 0, frames: 0, readyFired: false, startTime: -1 });

  useEffect(() => () => assets.dispose(), [assets]);

  // Environment for reflections; rebuilt after a context restore (its render target has no CPU copy).
  useEffect(() => {
    let environment = createStudioEnvironment(gl);
    scene.environment = environment.texture;
    const canvas = gl.domElement;
    const onRestored = () => {
      environment.dispose();
      environment = createStudioEnvironment(gl);
      scene.environment = environment.texture;
    };
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => {
      canvas.removeEventListener('webglcontextrestored', onRestored);
      if (scene.environment === environment.texture) scene.environment = null;
      environment.dispose();
    };
  }, [gl, scene]);

  useEffect(() => {
    gl.transmissionResolutionScale = TIERS[tier].transmissionScale;
    assets.dust.setDrawRange(0, TIERS[tier].particles);
  }, [gl, tier, assets]);

  // Real stills for the film strip (decorative; a failed load just leaves the glass empty).
  useEffect(() => {
    let cancelled = false;
    const loader = new THREE.TextureLoader();
    const crop = PANE.width / PANE.height / STILL_ASPECT;
    const cache = new Map<string, Promise<THREE.Texture>>();
    STRIP_STILLS.forEach((still, index) => {
      let source = cache.get(still.src);
      if (!source) {
        source = loader.loadAsync(still.src);
        cache.set(still.src, source);
      }
      source
        .then((base) => {
          if (cancelled) return;
          const texture = base.clone();
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.repeat.set(crop, 1);
          texture.offset.set(Math.min(1 - crop, Math.max(0, still.focus - crop / 2)), 0);
          texture.anisotropy = 4;
          texture.needsUpdate = true;
          const material = assets.stillMaterials[index]!;
          material.map = texture;
          material.needsUpdate = true;
        })
        .catch(() => {});
    });
    return () => {
      cancelled = true;
      void Promise.allSettled(cache.values()).then((results) => {
        for (const result of results) if (result.status === 'fulfilled') result.value.dispose();
      });
    };
  }, [assets]);

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20);
    const time = state.clock.elapsedTime;
    const m = motion.current;
    if (m.startTime < 0) m.startTime = time;
    // Ignition: 0 → 1 over INTRO seconds after the first frame (the frames light up front to back, the streams flare in).
    const intro = clamp01((time - m.startTime) / INTRO);

    m.progress = damp(m.progress, clamp01(progressRef.current ?? 0), 6.5, dt);
    const velocity = (m.progress - m.lastProgress) / Math.max(dt, 1e-3);
    m.lastProgress = m.progress;
    m.warp = damp(m.warp, Math.max(-1.5, Math.min(1.5, velocity)) * 1.6, 5, dt);
    const pointer = pointerRef.current;
    m.pointerX = damp(m.pointerX, pointer?.x ?? 0, 2.6, dt);
    m.pointerY = damp(m.pointerY, pointer?.y ?? 0, 2.6, dt);

    const { viewport, camera } = state;
    const layout = computeLayout(viewport.width, viewport.height, scratch.layout);
    const p = m.progress;
    // Scroll story: push in towards the stack while the frames phase apart, then pull back and look down at the strip.
    const push = smoother(clamp01(p / 0.42));
    const settle = smoother(clamp01((p - 0.36) / 0.5));
    const arrive = 1 - easeOut(intro * 1.15);

    // Rig orientation: three-quarter view, a slow idle drift and pointer parallax that fades as the frames line up.
    const free = 1 - smoother(clamp01(p / 0.7));
    scratch.euler.set(
      STACK_EULER.x - m.pointerY * 0.09 * free + Math.sin(time * 0.31) * 0.014,
      STACK_EULER.y + m.pointerX * 0.16 * free + Math.sin(time * 0.23) * 0.04 - push * (1 - settle) * 0.22 - arrive * 0.35,
      STACK_EULER.z,
    );
    scratch.rigQuat.setFromEuler(scratch.euler);
    const bob = Math.sin(time * 0.5) * 0.045;

    for (let i = 0; i <= PANES; i++) {
      const mesh = paneRefs.current[i];
      if (!mesh) continue;
      const isTriangle = i === PANES;
      const order = isTriangle ? 2.2 : i;
      const e = smoother(clamp01((p - order * 0.045) / 0.6));
      // Ignition of this frame: front first, then back; the triangle last.
      const lit = easeOut((intro - 0.12 - (isTriangle ? 0.62 : order * 0.085)) / 0.22);

      // Stack pose (frames slide forward into place during the ignition).
      if (isTriangle) scratch.local.copy(TRIANGLE_LOCAL);
      else scratch.local.copy(STEP).multiplyScalar(i);
      scratch.local.sub(CENTER);
      scratch.local.z += Math.sin(time * 0.7 + i * 1.3) * 0.025 - (1 - lit) * (1.4 + order * 0.25);
      scratch.local.multiplyScalar(layout.scale).applyQuaternion(scratch.rigQuat);
      scratch.stackPos.copy(layout.center).add(scratch.local);
      scratch.stackPos.y += bob;

      // Film-strip pose: a gentle arc of frames; the triangle becomes the play mark above the middle.
      if (isTriangle) {
        scratch.stripPos.set(0, layout.stripY + 1.25 * layout.stripScale, layout.stripZ + 0.5);
        scratch.euler.set(-0.08, 0, 0);
      } else {
        const x = (i - (PANES - 1) / 2) * layout.stripSpacing;
        scratch.stripPos.set(x, layout.stripY, layout.stripZ - 0.07 * x * x);
        scratch.euler.set(-0.14, -x * 0.07, 0);
      }
      scratch.stripQuat.setFromEuler(scratch.euler);

      mesh.position.lerpVectors(scratch.stackPos, scratch.stripPos, e);
      // Phase apart: frames spread out in depth mid-transition, then settle.
      mesh.position.z -= Math.sin(e * Math.PI) * (0.7 + order * 0.24) * layout.scale;
      mesh.quaternion.slerpQuaternions(scratch.rigQuat, scratch.stripQuat, e);
      const scale = isTriangle ? layout.scale * (1 - e * 0.55) : layout.scale + (layout.stripScale * 0.92 - layout.scale) * e;
      mesh.scale.setScalar(scale * (0.92 + 0.08 * lit));

      // Light travelling along each edge, staggered front to back; a slow sweep of inner light through the stack.
      const hairline = assets.hairlineMaterials[i]!;
      hairline.uniforms.uHead!.value = (time * 0.075 + order * 0.14) % 1;
      hairline.uniforms.uFade!.value = lit * (isTriangle ? 1 - e * 0.35 : 1);
      hairline.uniforms.uFlash!.value = Math.max(0, 1 - Math.abs(lit - 0.75) * 4) * 1.6 + e * 0.35;
      if (!isTriangle) {
        const still = assets.stillMaterials[i]!;
        still.opacity = still.map ? 0.94 * smoother(clamp01((e - 0.5) / 0.42)) : 0;
      }
      const sweep = ((time * 0.085) % 1) * 1.7 - 0.35;
      const glow = Math.exp(-((sweep - order / PANES) ** 2) / 0.018);
      const material = assets.paneMaterials[i]!;
      const base = isTriangle ? 0.5 : 0.42 - (i / (PANES - 1)) * 0.18;
      material.emissiveIntensity = base * (1 + glow * 1.1) * lit;
    }

    // Energy streams follow the stack, flare in during the ignition and quieten as the strip forms.
    const streams = streamGroup.current;
    if (streams) {
      streams.position.set(layout.center.x * 0.75, layout.center.y * 0.6 + bob * 0.5, 0);
      streams.scale.setScalar(Math.max(0.7, layout.scale));
      streams.rotation.z = -push * (1 - settle) * 0.05;
    }
    const flare = easeOut((intro - 0.05) / 0.35);
    const flash = Math.max(0, 1 - Math.abs(intro - 0.3) * 3.5);
    assets.streams.forEach((stream, index) => {
      const spec = STREAMS[index]!;
      const uniforms = stream.material.uniforms;
      uniforms.uTime!.value = time;
      uniforms.uIntensity!.value = spec.intensity * flare * (1 + flash * 0.8) * (1 - 0.55 * settle) * (1 + Math.abs(m.warp) * 0.25);
      uniforms.uComet!.value = (time * spec.comet.speed + spec.comet.phase) % 1.25 - 0.1;
    });

    // Holographic stage under the frames.
    const stage = grid.current;
    if (stage) {
      stage.position.set(layout.center.x * 0.6, layout.wide ? -2.35 : -1.25, -2);
    }
    const gridUniforms = assets.gridMaterial.uniforms;
    gridUniforms.uTime!.value = time;
    gridUniforms.uScan!.value = ((time * 1.4) % 26) - 20;
    gridUniforms.uCenter!.value.set(layout.center.x * 0.6, -2);
    gridUniforms.uIntensity!.value = easeOut((intro - 0.2) / 0.6) * (1 - 0.5 * settle) * (layout.wide ? 1 : 0.6);

    for (const material of [assets.dustMaterial, assets.bokehMaterial]) {
      material.uniforms.uTime!.value = time;
      material.uniforms.uPixelRatio!.value = state.gl.getPixelRatio();
      material.uniforms.uWarp!.value = m.warp;
    }
    assets.dustMaterial.uniforms.uOpacity!.value = 0.62 * easeOut(intro / 0.6);
    assets.bokehMaterial.uniforms.uOpacity!.value = 0.16 * easeOut((intro - 0.3) / 0.6);

    // Camera: arrives from a little farther out, pushes in with the scroll, then drifts down with the strip.
    const ox = m.pointerX * 0.3 + push * (1 - settle) * 0.9;
    const oy = settle * 0.4 + m.pointerY * 0.18;
    const oz = 10 - push * (1 - settle) * 1.5 + settle * 0.85 + arrive * 2.4;
    camera.position.set(ox, oy, oz);
    scratch.target.set(layout.center.x * 0.22 * push * (1 - settle), -settle * 0.5, 0);
    camera.lookAt(scratch.target);

    if (!m.readyFired && ++m.frames >= 3) {
      m.readyFired = true;
      onReady();
    }
  });

  return (
    <>
      <group ref={streamGroup}>
        {assets.streams.map((stream, index) => (
          <mesh key={index} geometry={stream.geometry} material={stream.material} renderOrder={-2 + index} frustumCulled={false} dispose={null} />
        ))}
      </group>
      <mesh ref={grid} geometry={assets.gridGeometry} material={assets.gridMaterial} frustumCulled={false} dispose={null} />
      <points geometry={assets.dust} material={assets.dustMaterial} frustumCulled={false} dispose={null} />
      <points geometry={assets.bokeh} material={assets.bokehMaterial} position={[0, 0, 4.5]} scale={[0.9, 0.8, 0.3]} frustumCulled={false} dispose={null} />
      {Array.from({ length: PANES + 1 }, (_, i) => {
        const isTriangle = i === PANES;
        return (
          <mesh
            key={i}
            ref={(node) => {
              paneRefs.current[i] = node;
            }}
            geometry={isTriangle ? assets.triangleGeometry : assets.paneGeometry}
            material={assets.paneMaterials[i]}
            dispose={null}
          >
            {isTriangle ? null : (
              <mesh geometry={assets.stillGeometry} material={assets.stillMaterials[i]} position={[0, 0, PANE.depth / 2 + PANE.bevel + 0.001]} renderOrder={1} dispose={null} />
            )}
            <mesh
              geometry={isTriangle ? assets.triangleHairline : assets.paneHairline}
              material={assets.hairlineMaterials[i]}
              position={[0, 0, PANE.depth / 2 + PANE.bevel + 0.002]}
              renderOrder={2}
              dispose={null}
            />
          </mesh>
        );
      })}
    </>
  );
}
