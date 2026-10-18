// GLSL for the hero scene (WebGLRenderer, ShaderMaterial). Colours arrive as linear-sRGB uniforms; every fragment shader ends
// with three's tonemapping/colorspace chunks so output is correct both into the HDR composer (no-ops there) and straight to
// the canvas. Values above 1 are intentional: the composer's luminance-thresholded bloom turns them into glow.

const PALETTE = /* glsl */ `
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  // The brand light: cyan 0, blue .36, iris .68, violet 1.
  vec3 brandPalette(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c = mix(uC0, uC1, smoothstep(0.0, 0.36, t));
    c = mix(c, uC2, smoothstep(0.36, 0.68, t));
    return mix(c, uC3, smoothstep(0.68, 1.0, t));
  }
`;

/** Glowing hairline edge with a light pulse travelling along the perimeter. Additive. */
export const hairlineVertex = /* glsl */ `
  attribute float aPerimeter;
  attribute vec2 aLocal;
  varying float vPerimeter;
  varying vec2 vLocal;
  void main() {
    vPerimeter = aPerimeter;
    vLocal = aLocal;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const hairlineFragment = /* glsl */ `
  ${PALETTE}
  uniform vec2 uHalf;        // half size of the outline, for the diagonal gradient
  uniform float uShift;      // where this frame sits in the stack (0 front … 1 back)
  uniform float uIntensity;  // base brightness (HDR; > 1 blooms)
  uniform float uPulse;      // pulse brightness
  uniform float uHead;       // pulse position along the perimeter (0–1)
  uniform float uFade;       // overall fade (ignition, settle)
  uniform float uFlash;      // extra brightness while the frame ignites
  varying float vPerimeter;
  varying vec2 vLocal;
  void main() {
    // Cyan at the top-left / front, violet at the bottom-right / back.
    float diagonal = 0.5 + 0.25 * (vLocal.x / uHalf.x - vLocal.y / uHalf.y);
    vec3 color = brandPalette(diagonal * 0.72 + uShift * 0.28);
    float d = abs(fract(vPerimeter - uHead + 0.5) - 0.5);
    float head = exp(-(d * d) / 0.0009);
    float behind = fract(uHead - vPerimeter);
    float trail = 1.0 - behind / 0.26;
    float tail = behind < 0.26 ? trail * trail * 0.6 : 0.0;
    float light = uIntensity * (1.0 + uFlash) + uPulse * (head + tail);
    gl_FragColor = vec4(color * light * uFade, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Energy stream: a flowing band of light with a bright comet travelling along it. Drawn in the opaque list (so the glass
 * transmission pass refracts it) but with additive blending, so crossing streams add up instead of overwriting each other.
 */
export const ribbonVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ribbonFragment = /* glsl */ `
  ${PALETTE}
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSpeed;
  uniform float uHue;        // palette offset along the stream
  uniform float uComet;      // comet head position (0–1)
  uniform float uCometGain;
  varying vec2 vUv;
  void main() {
    float across = vUv.y * 2.0 - 1.0;
    float core = exp(-across * across * 34.0);
    float inner = exp(-across * across * 10.0) * 0.38;
    float halo = exp(-across * across * 3.2) * 0.09;
    float flow = vUv.x * 22.0 - uTime * uSpeed;
    float streak = 0.55 + 0.45 * sin(flow + 1.9 * sin(vUv.x * 7.0 + uTime * 0.2));
    // max(): float error can push the base a hair below 0, and pow() of a negative base is NaN (which the transmission
    // buffer's mip chain would smear into dark blocks).
    float filament = pow(max(0.0, 0.5 + 0.5 * sin(vUv.x * 61.0 - uTime * uSpeed * 2.3 + across * 3.0)), 6.0) * 0.5;
    // smoothstep needs edge0 < edge1 (reversed edges are undefined and can return NaN on some GPUs).
    float ends = smoothstep(0.02, 0.3, vUv.x) * (1.0 - smoothstep(0.72, 1.0, vUv.x));
    float c = vUv.x - uComet;
    float comet = exp(-c * c / 0.0016) + (c < 0.0 ? exp(c / 0.08) * 0.35 : 0.0);
    vec3 color = brandPalette(vUv.x * 0.85 + uHue);
    float light = (core * (streak + filament) + inner * streak + halo) * ends * uIntensity;
    light += comet * (core * 3.2 + inner) * uCometGain * ends;
    gl_FragColor = vec4(color * light, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Dust: soft round sprites drifting slowly, additive. Scroll velocity pulls them upward (a short "warp" while the page
 * moves); `uNear` switches to large defocused bokeh for the layer near the camera.
 */
export const dustVertex = /* glsl */ `
  ${PALETTE}
  attribute float aPhase;
  attribute float aSize;
  attribute float aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform float uWarp;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.11 + aPhase) * 0.18;
    p.y += cos(uTime * 0.09 + aPhase * 1.3) * 0.14 + sin(uTime * 0.05 + aPhase) * 0.1;
    p.y += uWarp * (0.6 + aSize * 0.5);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale * uPixelRatio / max(0.5, -mv.z);
    vColor = brandPalette(aTint);
    vAlpha = 0.28 + 0.72 * (0.5 + 0.5 * sin(uTime * 0.7 + aPhase * 5.0));
  }
`;

export const dustFragment = /* glsl */ `
  uniform float uOpacity;
  uniform float uSoftness;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = 1.0 - smoothstep(uSoftness, 0.5, d);
    a *= a;
    gl_FragColor = vec4(vColor * a * vAlpha * uOpacity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Holographic stage: a perspective grid that fades with distance and towards the copy on the left, with a scan band rolling
 * towards the viewer. Additive, anti-aliased with fwidth.
 */
export const gridVertex = /* glsl */ `
  varying vec2 vWorld;
  varying float vDepth;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xz;
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

export const gridFragment = /* glsl */ `
  ${PALETTE}
  uniform float uTime;
  uniform float uIntensity;
  uniform float uScan;
  uniform vec2 uCenter;
  varying vec2 vWorld;
  varying float vDepth;
  float gridLine(vec2 coord) {
    vec2 g = abs(fract(coord - 0.5) - 0.5) / max(fwidth(coord), vec2(1e-4));
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    vec2 local = vWorld - uCenter;
    float fine = gridLine(local * 1.6);
    float major = gridLine(local * 0.4);
    vec2 spread = local * vec2(0.17, 0.26);
    float fade = exp(-dot(spread, spread));
    float left = smoothstep(-7.0, -1.5, local.x);
    float scan = (local.y - uScan) * 1.4;
    float band = exp(-scan * scan);
    vec3 color = brandPalette(0.3 + 0.12 * local.x);
    float light = (fine * 0.22 + major * 0.55) * fade * left * (0.55 + 1.8 * band);
    gl_FragColor = vec4(color * light * uIntensity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
