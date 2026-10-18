import { useEffect, useRef } from 'react';
import { cn } from '../../lib/cn.ts';
import { supportsWebGL, useHydrated, useReducedMotion } from '../../lib/hooks.ts';

/*
 * Living background: a domain-warped aurora/nebula shader in the brand light (cyan → blue → iris → violet) plus a crisp
 * 2D particle layer drifting through it. Pointer adds parallax and a soft light; scroll shifts the band and hue.
 * Rendered at a reduced internal resolution and ~30 fps, paused when offscreen or the tab is hidden; reduced motion
 * draws a single still frame. Purely decorative (aria-hidden).
 */

const VERTEX = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uScroll;
uniform float uIntensity;
out vec4 outColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
vec3 brand(float t) {
  vec3 c1 = vec3(0.286, 0.812, 1.000);
  vec3 c2 = vec3(0.243, 0.537, 1.000);
  vec3 c3 = vec3(0.447, 0.490, 1.000);
  vec3 c4 = vec3(0.671, 0.482, 1.000);
  t = clamp(t, 0.0, 1.0);
  if (t < 0.36) return mix(c1, c2, t / 0.36);
  if (t < 0.68) return mix(c2, c3, (t - 0.36) / 0.32);
  return mix(c3, c4, (t - 0.68) / 0.32);
}
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  vec2 pointer = (uPointer - 0.5) * vec2(uRes.x / uRes.y, -1.0);
  p += pointer * 0.035;
  float t = uTime * 0.03;
  vec2 q = vec2(fbm(p * 1.3 + t), fbm(p * 1.3 - t + 3.1));
  vec2 r = vec2(fbm(p * 1.7 + 2.0 * q + vec2(1.7, 9.2) + t * 1.4), fbm(p * 1.7 + 2.0 * q + vec2(8.3, 2.8) - t));
  float f = fbm(p * 1.15 + 2.3 * r);
  float sway = 0.22 * sin(p.x * 1.5 + t * 3.0) + 0.08 * sin(p.x * 3.7 - t * 5.0);
  float bandY = p.y - sway - 0.15 * (f - 0.5) + (uScroll - 0.2) * 0.5;
  float band = exp(-pow(bandY * 2.0, 2.0));
  float core = exp(-pow(bandY * 6.0 + (f - 0.5) * 2.4, 2.0));
  float wisp = smoothstep(0.28, 0.80, f);
  vec3 col = vec3(0.016, 0.026, 0.055);
  // Hue runs cyan → violet along the ribbon (x) with a little turbulence, like the brand hero art.
  vec3 light = brand(clamp(0.5 + 0.42 * p.x + 0.35 * (f - 0.5) + (uScroll - 0.5) * 0.2, 0.0, 1.0));
  col += light * wisp * band * 1.1 * uIntensity;
  col += light * core * (0.55 + 0.9 * wisp) * 1.4 * uIntensity;
  col += brand(0.85) * pow(f, 3.0) * 0.35 * uIntensity * (1.0 - band);
  float bandY2 = p.y + 0.42 + 0.18 * sin(p.x * 1.1 - t * 2.4) - 0.1 * (f - 0.5);
  col += brand(0.12) * exp(-pow(bandY2 * 5.0, 2.0)) * wisp * 0.55 * uIntensity;
  float glow = exp(-length(p - pointer * 0.9) * 2.0);
  col += brand(0.3) * glow * 0.16 * uIntensity;
  float vignette = smoothstep(1.35, 0.15, length(p * vec2(0.85, 1.0)));
  col *= mix(0.45, 1.0, vignette);
  col = 1.0 - exp(-col * 1.5);
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;
  outColor = vec4(col, 1.0);
}`;

interface Particle {
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  hue: number;
}

const HUES = ['73 207 255', '62 137 255', '114 125 255', '171 123 255'];

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export interface NebulaFieldProps {
  /** `fixed` stays behind the whole page; `absolute` fills the positioned parent. */
  position?: 'fixed' | 'absolute';
  /** Light intensity, 0–1.5. */
  intensity?: number;
  /** Number of drifting particles at 1440 px width (scaled by viewport). */
  particles?: number;
  className?: string;
}

export function NebulaField({ position = 'absolute', intensity = 1, particles = 140, className }: NebulaFieldProps) {
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const glCanvas = glRef.current;
    const dotCanvas = dotsRef.current;
    if (!hydrated || !wrap || !glCanvas || !dotCanvas) return;

    const gl = supportsWebGL() ? glCanvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' }) : null;
    const ctx = dotCanvas.getContext('2d');
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const uniforms: Record<string, WebGLUniformLocation | null> = {};

    if (gl) {
      const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
      const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
      program = gl.createProgram();
      if (program && vs && fs) {
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) program = null;
      } else program = null;
      if (program) {
        gl.useProgram(program);
        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, 'aPos');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        for (const name of ['uRes', 'uTime', 'uPointer', 'uScroll', 'uIntensity']) uniforms[name] = gl.getUniformLocation(program, name);
      }
    }

    let width = 0;
    let height = 0;
    let dots: Particle[] = [];
    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    let scroll = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const scale = Math.min(0.55, 900 / Math.max(width, height));
      glCanvas.width = Math.round(width * scale);
      glCanvas.height = Math.round(height * scale);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      dotCanvas.width = Math.round(width * dpr);
      dotCanvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round((particles * Math.min(width, 1920)) / 1440);
      dots = Array.from({ length: count }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.25 + Math.random() * 0.75,
        r: 0.4 + Math.random() * 1.3,
        phase: Math.random() * Math.PI * 2,
        hue: i % HUES.length,
      }));
    };

    const onPointer = (event: PointerEvent) => {
      pointer.tx = event.clientX / window.innerWidth;
      pointer.ty = event.clientY / window.innerHeight;
    };
    const onScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scroll = window.scrollY / max;
    };

    let frame = 0;
    let last = 0;
    let visible = true;
    const start = performance.now();

    const draw = (now: number) => {
      const time = (now - start) / 1000;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      // A fixed backdrop is brightest behind the first screen and calms down under reading content.
      const depth = position === 'fixed' ? window.scrollY / Math.max(1, window.innerHeight) : 0;
      const calm = 1 - 0.45 * Math.min(1, Math.max(0, (depth - 0.7) / 1.1));
      if (gl && program) {
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.uniform2f(uniforms.uRes ?? null, glCanvas.width, glCanvas.height);
        gl.uniform1f(uniforms.uTime ?? null, time);
        gl.uniform2f(uniforms.uPointer ?? null, pointer.x, pointer.y);
        gl.uniform1f(uniforms.uScroll ?? null, scroll);
        gl.uniform1f(uniforms.uIntensity ?? null, intensity * calm);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
        const px = (pointer.x - 0.5) * 24;
        const py = (pointer.y - 0.5) * 16;
        for (const d of dots) {
          d.y -= 0.12 * d.z;
          if (d.y < -4) {
            d.y = height + 4;
            d.x = Math.random() * width;
          }
          const twinkle = 0.45 + 0.55 * Math.sin(time * (0.8 + d.z) + d.phase);
          const x = d.x - px * d.z;
          const y = d.y - py * d.z;
          ctx.beginPath();
          ctx.fillStyle = `rgb(${HUES[d.hue]} / ${(0.25 + 0.6 * twinkle) * d.z})`;
          ctx.arc(x, y, d.r * d.z, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (!visible || document.hidden) return;
      if (now - last < 33) return;
      last = now;
      draw(now);
    };

    resize();
    onScroll();
    const observer = new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? true));
    observer.observe(wrap);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reducedMotion) {
      draw(start + 12_000);
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      frame = requestAnimationFrame(loop);
    }

    const onLost = (event: Event) => event.preventDefault();
    glCanvas.addEventListener('webglcontextlost', onLost);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      glCanvas.removeEventListener('webglcontextlost', onLost);
      if (gl) {
        if (buffer) gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    };
  }, [hydrated, reducedMotion, intensity, particles, position]);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={cn(
        position === 'fixed' ? 'fixed' : 'absolute',
        'inset-0 -z-10 overflow-hidden bg-canvas [background-image:var(--gradient-space)]',
        className,
      )}
    >
      <canvas ref={glRef} className={cn('absolute inset-0 size-full transition-opacity duration-700', hydrated ? 'opacity-100' : 'opacity-0')} />
      <canvas ref={dotsRef} className="absolute inset-0 size-full" />
    </div>
  );
}
