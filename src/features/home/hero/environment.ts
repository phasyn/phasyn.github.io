import * as THREE from 'three';

/**
 * Procedural studio environment for glass reflections, built from emissive light cards (the same idea as drei's
 * <Environment><Lightformer/></Environment>, without pulling HDR/EXR loaders into the bundle). Rendered once through PMREM; no
 * network assets. Key softbox top-left, a cyan strip on the left, a violet strip on the right, a blue rim behind, deep navy
 * everywhere else (the brand's shadows are navy, never grey).
 */
export function createStudioEnvironment(renderer: THREE.WebGLRenderer): { texture: THREE.Texture; dispose: () => void } {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0b1a3a').multiplyScalar(0.55);
  const plane = new THREE.PlaneGeometry(1, 1);
  const materials: THREE.Material[] = [];
  const card = (hex: string, intensity: number, position: [number, number, number], scale: [number, number]) => {
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(intensity), side: THREE.DoubleSide, toneMapped: false });
    materials.push(material);
    const mesh = new THREE.Mesh(plane, material);
    mesh.position.set(...position);
    mesh.scale.set(scale[0], scale[1], 1);
    mesh.lookAt(0, 0, 0);
    scene.add(mesh);
  };
  card('#ffffff', 2.6, [-4.5, 5, 5.5], [7, 3.2]);
  card('#49cfff', 3.4, [-7.5, 0.4, 2], [0.7, 9]);
  card('#ab7bff', 2.8, [7.5, -0.6, -0.5], [0.8, 9]);
  card('#3e89ff', 1.8, [0, 7.5, -5], [12, 0.8]);
  card('#727dff', 0.7, [0, -6.5, 3], [12, 3]);
  card('#ffffff', 1.2, [6, 4, 6], [1.6, 1.6]);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const target = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  plane.dispose();
  for (const material of materials) material.dispose();

  return {
    texture: target.texture,
    dispose: () => target.dispose(),
  };
}
