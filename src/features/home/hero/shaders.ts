// GLSL for the hero scene (WebGLRenderer, ShaderMaterial). Colours arrive as linear-sRGB uniforms; every fragment shader ends
// with three's tonemapping/colorspace chunks so output is correct both into the HDR composer (no-ops there) and straight to
// the canvas on the low tier.

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
  uniform float uFade;       // overall fade
  varying float vPerimeter;
  varying vec2 vLocal;
  void main() {
    // Cyan at the top-left / front, violet at the bottom-right / back.
    float diagonal = 0.5 + 0.25 * (vLocal.x / uHalf.x - vLocal.y / uHalf.y);
    vec3 color = brandPalette(diagonal * 0.72 + uShift * 0.28);
    float d = abs(fract(vPerimeter - uHead + 0.5) - 0.5);
    float head = exp(-(d * d) / 0.0011);
    float behind = fract(uHead - vPerimeter);
    float tail = behind < 0.22 ? (1.0 - behind / 0.22) * 0.45 : 0.0;
    float light = uIntensity + uPulse * (head + tail);
    gl_FragColor = vec4(color * light * uFade, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/**
 * Light ribbon behind the frames. Opaque (so the glass transmission pass refracts it) and blended towards the scene background
 * colour at its edges, which reads as additive light on the dark canvas.
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
  uniform vec3 uBackground;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    float across = vUv.y * 2.0 - 1.0;
    float core = exp(-across * across * 26.0);
    float halo = exp(-across * across * 3.2) * 0.28;
    float flow = vUv.x * 18.0 - uTime * 0.32;
    float streak = 0.62 + 0.38 * sin(flow + 1.7 * sin(vUv.x * 6.0 + uTime * 0.15));
    float ends = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
    vec3 color = brandPalette(vUv.x);
    float light = (core * streak + halo) * ends * uIntensity;
    gl_FragColor = vec4(uBackground + color * light, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** Faint dust: soft round sprites drifting slowly, additive. */
export const dustVertex = /* glsl */ `
  ${PALETTE}
  attribute float aPhase;
  attribute float aSize;
  attribute float aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScale;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.11 + aPhase) * 0.18;
    p.y += cos(uTime * 0.09 + aPhase * 1.3) * 0.14 + sin(uTime * 0.05 + aPhase) * 0.1;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale * uPixelRatio / max(0.5, -mv.z);
    vColor = brandPalette(aTint);
    vAlpha = 0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * 0.7 + aPhase * 5.0));
  }
`;

export const dustFragment = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(vColor * a * vAlpha * uOpacity, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
