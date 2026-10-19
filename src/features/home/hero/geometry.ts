import * as THREE from 'three';

/** Rounded rectangle centred on the origin, counter-clockwise. */
export function roundedRectShape(width: number, height: number, radius: number): THREE.Shape {
  const x0 = -width / 2;
  const y0 = -height / 2;
  const x1 = width / 2;
  const y1 = height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x0 + r, y0);
  shape.lineTo(x1 - r, y0);
  shape.absarc(x1 - r, y0 + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x1, y1 - r);
  shape.absarc(x1 - r, y1 - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x0 + r, y1);
  shape.absarc(x0 + r, y1 - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x0, y0 + r);
  shape.absarc(x0 + r, y0 + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/**
 * Rounded "play" triangle pointing +x, centred on its bounding box. Corners are quadratic curves through the vertices, which
 * reads as a soft, even rounding at hero sizes.
 */
export function roundedTriangleShape(height: number, radius: number): THREE.Shape {
  const half = height / 2;
  const depth = height * 0.866; // equilateral
  const a = new THREE.Vector2(-depth / 2, half);
  const b = new THREE.Vector2(-depth / 2, -half);
  const c = new THREE.Vector2(depth / 2, 0);
  const points = [b, c, a]; // counter-clockwise
  const shape = new THREE.Shape();
  const corner = (index: number) => {
    const point = points[index]!;
    const prev = points[(index + points.length - 1) % points.length]!;
    const next = points[(index + 1) % points.length]!;
    const toPrev = prev.clone().sub(point).normalize().multiplyScalar(radius);
    const toNext = next.clone().sub(point).normalize().multiplyScalar(radius);
    return { start: point.clone().add(toPrev), control: point, end: point.clone().add(toNext) };
  };
  const first = corner(0);
  shape.moveTo(first.end.x, first.end.y);
  for (let i = 1; i <= points.length; i++) {
    const { start, control, end } = corner(i % points.length);
    shape.lineTo(start.x, start.y);
    shape.quadraticCurveTo(control.x, control.y, end.x, end.y);
  }
  return shape;
}

/**
 * Thin glass slab from a shape: extruded with a small bevel, centred on z, with UVs normalised to the shape's bounding box
 * (0–1 on the faces) so a gradient map spans each pane exactly once.
 */
export function glassSlab(shape: THREE.Shape, depth: number, bevel: number): THREE.ExtrudeGeometry {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 14,
  });
  geometry.center();
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const width = box.max.x - box.min.x || 1;
  const height = box.max.y - box.min.y || 1;
  const position = geometry.getAttribute('position');
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - box.min.x) / width, (position.getY(i) - box.min.y) / height);
  }
  uv.needsUpdate = true;
  return geometry;
}

/**
 * Hairline ring along a closed shape outline: a flat strip `width` wide, centred on the outline, with
 * `aPerimeter` (0–1 arc length) for light travelling along the edge and `aLocal` (outline position) for the brand gradient.
 */
export function hairlineGeometry(shape: THREE.Shape, width: number, divisions = 320): THREE.BufferGeometry {
  const points = shape.getSpacedPoints(divisions);
  // getSpacedPoints repeats the start point at the end of a closed outline; work on the unique points.
  const unique = points.slice(0, divisions);
  const count = unique.length;
  let area = 0;
  for (let i = 0; i < count; i++) {
    const p = unique[i]!;
    const q = unique[(i + 1) % count]!;
    area += p.x * q.y - q.x * p.y;
  }
  const outward = area >= 0 ? 1 : -1;
  const positions = new Float32Array((count + 1) * 2 * 3);
  const perimeter = new Float32Array((count + 1) * 2);
  const local = new Float32Array((count + 1) * 2 * 2);
  const half = width / 2;
  for (let i = 0; i <= count; i++) {
    const p = unique[i % count]!;
    const prev = unique[(i - 1 + count) % count]!;
    const next = unique[(i + 1) % count]!;
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const length = Math.hypot(tx, ty) || 1;
    tx /= length;
    ty /= length;
    const nx = ty * outward;
    const ny = -tx * outward;
    const base = i * 2;
    positions.set([p.x - nx * half, p.y - ny * half, 0, p.x + nx * half, p.y + ny * half, 0], base * 3);
    perimeter.set([i / count, i / count], base);
    local.set([p.x, p.y, p.x, p.y], base * 2);
  }
  const indices: number[] = [];
  for (let i = 0; i < count; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, b, c, b, d, c);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPerimeter', new THREE.BufferAttribute(perimeter, 1));
  geometry.setAttribute('aLocal', new THREE.BufferAttribute(local, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/** Flat ribbon along a curve, facing +z, with uv.x along the curve (0–1) and uv.y across it (0–1). */
export function ribbonGeometry(curve: THREE.Curve<THREE.Vector3>, width: number, segments = 220): THREE.BufferGeometry {
  const positions = new Float32Array((segments + 1) * 2 * 3);
  const uvs = new Float32Array((segments + 1) * 2 * 2);
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const side = new THREE.Vector3();
  const forward = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    curve.getPointAt(t, point);
    curve.getTangentAt(t, tangent);
    side.crossVectors(tangent, forward).normalize();
    // Taper the ends a little so the ribbon reads as light, not a strip.
    const taper = Math.sin(Math.PI * Math.min(1, Math.max(0, t))) ** 0.5;
    const half = (width / 2) * (0.35 + 0.65 * taper);
    positions.set(
      [point.x - side.x * half, point.y - side.y * half, point.z, point.x + side.x * half, point.y + side.y * half, point.z],
      i * 6,
    );
    uvs.set([t, 0, t, 1], i * 4);
  }
  const indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/** Deterministic PRNG for reproducible particle fields. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Dust particle buffers (positions, phase, size, palette index) for a fixed seed. */
export function dustGeometry(count: number, seed = 20261018): THREE.BufferGeometry {
  const random = mulberry32(seed);
  const positions = new Float32Array(count * 3);
  const phase = new Float32Array(count);
  const size = new Float32Array(count);
  const tint = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    // Denser near the frame stack, thinning out towards the edges of the hero.
    const r = Math.pow(random(), 0.7);
    const angle = random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * r * 7.5 + 1.2;
    positions[i * 3 + 1] = (random() - 0.5) * 7.2;
    positions[i * 3 + 2] = -random() * 9 + 2.2;
    phase[i] = random() * Math.PI * 2;
    size[i] = 0.35 + Math.pow(random(), 3) * 1.6;
    tint[i] = random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
  geometry.setAttribute('aTint', new THREE.BufferAttribute(tint, 1));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(1, 0, -2), 14);
  return geometry;
}
