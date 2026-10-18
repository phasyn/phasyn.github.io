import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { createStudioEnvironment } from './environment.ts';
import { dustGeometry, glassSlab, hairlineGeometry, ribbonGeometry, roundedRectShape, roundedTriangleShape } from './geometry.ts';
import { MAX_PARTICLES, TIERS, type QualityTier } from './quality.ts';
import { dustFragment, dustVertex, hairlineFragment, hairlineVertex, ribbonFragment, ribbonVertex } from './shaders.ts';

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
const BACKGROUND = '#070b14';

// Frames: tall rounded panes staggered up-right into depth (the logo's stem), plus a play triangle where the P's bowl sits.
const PANES = 6;
const PANE = { width: 1, height: 1.62, radius: 0.11, depth: 0.024, bevel: 0.012 };
const TRIANGLE = { height: 1.28, radius: 0.13 };
const STEP = new THREE.Vector3(0.27, 0.15, -0.44);
const TRIANGLE_LOCAL = new THREE.Vector3(1.78, 0.62, -1.15);
// Centre of the arrangement in local space, so the rig rotates around its middle.
const CENTER = new THREE.Vector3(0.92, 0.36, -1.12);
const STACK_EULER = new THREE.Euler(0.1, -0.56, 0.02);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
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

interface Assets {
  paneGeometry: THREE.BufferGeometry;
  paneHairline: THREE.BufferGeometry;
  triangleGeometry: THREE.BufferGeometry;
  triangleHairline: THREE.BufferGeometry;
  ribbonGeometry: THREE.BufferGeometry;
  dust: THREE.BufferGeometry;
  gradient: THREE.Texture;
  paneMaterials: THREE.MeshPhysicalMaterial[];
  hairlineMaterials: THREE.ShaderMaterial[];
  ribbonMaterial: THREE.ShaderMaterial;
  dustMaterial: THREE.ShaderMaterial;
  dispose: () => void;
}

function createAssets(): Assets {
  const brandUniforms = () => ({
    uC0: { value: new THREE.Color(BRAND[0]) },
    uC1: { value: new THREE.Color(BRAND[1]) },
    uC2: { value: new THREE.Color(BRAND[2]) },
    uC3: { value: new THREE.Color(BRAND[3]) },
  });
  const paneShape = roundedRectShape(PANE.width, PANE.height, PANE.radius);
  const triangleShape = roundedTriangleShape(TRIANGLE.height, TRIANGLE.radius);
  const paneGeometry = glassSlab(paneShape, PANE.depth, PANE.bevel);
  const triangleGeometry = glassSlab(triangleShape, PANE.depth, PANE.bevel);
  const paneHairline = hairlineGeometry(paneShape, 0.012);
  const triangleHairline = hairlineGeometry(triangleShape, 0.012);
  // The triangle's outline is offset from its bounding-box centre by glassSlab's centring; match it.
  triangleGeometry.computeBoundingBox();
  const triangleBox = new THREE.Box3().setFromBufferAttribute(triangleHairline.getAttribute('position') as THREE.BufferAttribute);
  const triangleCenter = triangleBox.getCenter(new THREE.Vector3());
  triangleHairline.translate(-triangleCenter.x, -triangleCenter.y, 0);

  const curve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(-6.4, -3.1, -3.8),
      new THREE.Vector3(-3.2, -1.7, -3.3),
      new THREE.Vector3(-0.4, -0.4, -3.6),
      new THREE.Vector3(2.2, 0.9, -3.1),
      new THREE.Vector3(5.6, 3.3, -4.4),
    ],
    false,
    'catmullrom',
    0.4,
  );
  const ribbon = ribbonGeometry(curve, 1.15);
  const dust = dustGeometry(MAX_PARTICLES);
  const gradient = createGradientTexture();
  const tint = new THREE.Color();

  const paneMaterials = Array.from({ length: PANES + 1 }, (_, index) => {
    const isTriangle = index === PANES;
    const shift = isTriangle ? 0.85 : index / (PANES - 1);
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e6eeff'),
      metalness: 0,
      roughness: 0.2,
      transmission: 1,
      thickness: 0.5,
      ior: 1.42,
      attenuationColor: paletteColor(0.15 + shift * 0.85, tint.clone()),
      attenuationDistance: 1.6,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      specularIntensity: 1,
      envMapIntensity: 1.4,
      emissive: new THREE.Color('#ffffff'),
      emissiveMap: gradient,
      emissiveIntensity: isTriangle ? 0.5 : 0.42 - shift * 0.18,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  });

  const hairlineMaterials = Array.from({ length: PANES + 1 }, (_, index) => {
    const isTriangle = index === PANES;
    const half = isTriangle ? new THREE.Vector2(triangleBox.max.x - triangleCenter.x, triangleBox.max.y - triangleCenter.y) : new THREE.Vector2(PANE.width / 2, PANE.height / 2);
    return new THREE.ShaderMaterial({
      vertexShader: hairlineVertex,
      fragmentShader: hairlineFragment,
      uniforms: {
        ...brandUniforms(),
        uHalf: { value: half },
        uShift: { value: isTriangle ? 0.9 : index / (PANES - 1) },
        uIntensity: { value: isTriangle ? 1.9 : 1.55 - (index / (PANES - 1)) * 0.5 },
        uPulse: { value: 3.2 },
        uHead: { value: 0 },
        uFade: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  });

  const ribbonMaterial = new THREE.ShaderMaterial({
    vertexShader: ribbonVertex,
    fragmentShader: ribbonFragment,
    uniforms: {
      ...brandUniforms(),
      uBackground: { value: new THREE.Color(BACKGROUND) },
      uTime: { value: 0 },
      uIntensity: { value: 0.85 },
    },
    depthWrite: false,
  });

  const dustMaterial = new THREE.ShaderMaterial({
    vertexShader: dustVertex,
    fragmentShader: dustFragment,
    uniforms: {
      ...brandUniforms(),
      uTime: { value: 0 },
      uPixelRatio: { value: 1 },
      uScale: { value: 46 },
      uOpacity: { value: 0.55 },
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
    ribbonGeometry: ribbon,
    dust,
    gradient,
    paneMaterials,
    hairlineMaterials,
    ribbonMaterial,
    dustMaterial,
    dispose: () => {
      for (const geometry of [paneGeometry, paneHairline, triangleGeometry, triangleHairline, ribbon, dust]) geometry.dispose();
      for (const material of [...paneMaterials, ...hairlineMaterials, ribbonMaterial, dustMaterial]) material.dispose();
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
}

/** Where the stack sits for the current viewport (world units at z = 0): right of the copy when wide, above it when tall. */
function computeLayout(viewportWidth: number, viewportHeight: number, out: Layout): Layout {
  const aspect = viewportWidth / viewportHeight;
  if (aspect > 1) {
    out.scale = Math.min(1.15, Math.max(0.72, viewportHeight / 5.1));
    out.center.set(viewportWidth * 0.235, viewportHeight * 0.02, 0);
    out.stripY = -viewportHeight * 0.3;
    out.stripZ = 0.6;
    out.stripScale = Math.min(1, Math.max(0.62, viewportWidth / 8.6));
  } else {
    out.scale = Math.min(0.95, Math.max(0.5, viewportWidth / 4.4));
    out.center.set(viewportWidth * 0.04, viewportHeight * 0.2, 0);
    out.stripY = -viewportHeight * 0.06;
    out.stripZ = 0.4;
    out.stripScale = Math.min(0.9, Math.max(0.5, viewportWidth / 3.4));
  }
  out.stripSpacing = 1.24 * out.stripScale;
  return out;
}

// Scratch objects for the frame loop (no allocation per frame).
const scratch = {
  layout: { center: new THREE.Vector3(), scale: 1, stripY: 0, stripZ: 0, stripSpacing: 1, stripScale: 1 } as Layout,
  rigQuat: new THREE.Quaternion(),
  pointerQuat: new THREE.Quaternion(),
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
  const ribbonRef = useRef<THREE.Mesh>(null);
  const motion = useRef({ progress: 0, pointerX: 0, pointerY: 0, frames: 0, readyFired: false });

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

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 20);
    const time = state.clock.elapsedTime;
    const m = motion.current;
    m.progress = damp(m.progress, clamp01(progressRef.current ?? 0), 6.5, dt);
    const pointer = pointerRef.current;
    m.pointerX = damp(m.pointerX, pointer?.x ?? 0, 2.6, dt);
    m.pointerY = damp(m.pointerY, pointer?.y ?? 0, 2.6, dt);

    const { viewport, camera } = state;
    const layout = computeLayout(viewport.width, viewport.height, scratch.layout);
    const p = m.progress;

    // Rig orientation: three-quarter view, a slow idle drift and gentle pointer parallax that fades as the frames line up.
    const settle = smoother(clamp01(p / 0.7));
    scratch.euler.set(
      STACK_EULER.x - m.pointerY * 0.07 * (1 - settle) + Math.sin(time * 0.31) * 0.012,
      STACK_EULER.y + m.pointerX * 0.11 * (1 - settle) + Math.sin(time * 0.23) * 0.035,
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

      // Stack pose.
      if (isTriangle) scratch.local.copy(TRIANGLE_LOCAL);
      else scratch.local.copy(STEP).multiplyScalar(i);
      scratch.local.sub(CENTER);
      scratch.local.z += Math.sin(time * 0.7 + i * 1.3) * 0.025;
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
      mesh.position.z -= Math.sin(e * Math.PI) * (0.55 + order * 0.2) * layout.scale;
      mesh.quaternion.slerpQuaternions(scratch.rigQuat, scratch.stripQuat, e);
      const scale = isTriangle ? layout.scale * (1 - e * 0.55) : layout.scale + (layout.stripScale * 0.92 - layout.scale) * e;
      mesh.scale.setScalar(scale);

      // Light travelling along each edge, staggered front to back; a slow sweep of inner light through the stack.
      const hairline = assets.hairlineMaterials[i]!;
      hairline.uniforms.uHead!.value = (time * 0.075 + order * 0.14) % 1;
      const sweep = ((time * 0.085) % 1) * 1.7 - 0.35;
      const glow = Math.exp(-((sweep - order / PANES) ** 2) / 0.018);
      const material = assets.paneMaterials[i]!;
      const base = isTriangle ? 0.5 : 0.42 - (i / (PANES - 1)) * 0.18;
      material.emissiveIntensity = base * (1 + glow * 0.9);
      hairline.uniforms.uFade!.value = isTriangle ? 1 - e * 0.35 : 1;
    }

    const ribbon = ribbonRef.current;
    if (ribbon) {
      ribbon.position.set(layout.center.x * 0.75, layout.center.y * 0.6 + bob * 0.5, 0);
      ribbon.scale.setScalar(Math.max(0.7, layout.scale));
    }
    assets.ribbonMaterial.uniforms.uTime!.value = time;
    assets.ribbonMaterial.uniforms.uIntensity!.value = 0.85 * (1 - 0.6 * settle);
    assets.dustMaterial.uniforms.uTime!.value = time;
    assets.dustMaterial.uniforms.uPixelRatio!.value = state.gl.getPixelRatio();

    // Camera: drifts down with the strip and answers the pointer a little.
    scratch.target.set(m.pointerX * 0.28, -p * 0.5 + m.pointerY * 0.16, 10 + p * 0.5);
    camera.position.copy(scratch.target);
    camera.lookAt(0, -p * 0.42, 0);

    if (!m.readyFired && ++m.frames >= 3) {
      m.readyFired = true;
      onReady();
    }
  });

  return (
    <>
      <mesh ref={ribbonRef} geometry={assets.ribbonGeometry} material={assets.ribbonMaterial} renderOrder={-1} frustumCulled={false} dispose={null} />
      <points geometry={assets.dust} material={assets.dustMaterial} frustumCulled={false} dispose={null} />
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
            <mesh
              geometry={isTriangle ? assets.triangleHairline : assets.paneHairline}
              material={assets.hairlineMaterials[i]}
              position={[0, 0, PANE.depth / 2 + PANE.bevel + 0.002]}
              dispose={null}
            />
          </mesh>
        );
      })}
    </>
  );
}
