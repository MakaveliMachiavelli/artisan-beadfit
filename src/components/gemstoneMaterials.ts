import * as THREE from 'three';

/**
 * Per-gemstone material identity for the 3D preview.
 *
 * The visual spec for each stone is the SVG overlay already written in
 * Blueprint2D.tsx (pyrite flecks on Lapis, spiderweb matrix on Turquoise,
 * chatoyant bands on Tiger Eye, and so on). This module reproduces that same
 * detail as procedural texture maps plus the MeshPhysicalMaterial properties
 * that actually carry the light response, so the 2D blueprint and the 3D view
 * describe the same stone.
 *
 * Everything here is generated once per (stone, quality, tier) and cached by
 * the caller. Textures are canvas-based, so there are no external assets.
 */

const TEX_SIZE = 512;

/** Deterministic PRNG so a given stone looks identical on every rebuild. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Ctx = CanvasRenderingContext2D;
type Rand = () => number;

function makeCanvas(): { canvas: HTMLCanvasElement; ctx: Ctx } {
  const canvas = document.createElement('canvas');
  canvas.width = TEX_SIZE;
  canvas.height = TEX_SIZE;
  return { canvas, ctx: canvas.getContext('2d')! };
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(canvas);
  // Colour maps must be tagged sRGB or every stone renders washed out; data
  // maps (bump/roughness/metalness) must stay linear.
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

// --- drawing primitives shared by the stone painters ---

function softBlobs(ctx: Ctx, rand: Rand, color: string, count: number, minR: number, maxR: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  for (let i = 0; i < count; i++) {
    const x = rand() * TEX_SIZE;
    const y = rand() * TEX_SIZE;
    const r = minR + rand() * (maxR - minR);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

function speckles(ctx: Ctx, rand: Rand, color: string, count: number, maxSize: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const x = rand() * TEX_SIZE;
    const y = rand() * TEX_SIZE;
    const s = 0.6 + rand() * maxSize;
    ctx.beginPath();
    ctx.ellipse(x, y, s, s * (0.5 + rand() * 0.8), rand() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Wandering vein network — used for Turquoise matrix and Jade veining. */
function veins(ctx: Ctx, rand: Rand, color: string, count: number, width: number, alpha: number, wander = 90) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.lineWidth = width * (0.4 + rand() * 1.2);
    let x = rand() * TEX_SIZE;
    let y = rand() * TEX_SIZE;
    ctx.moveTo(x, y);
    const segs = 3 + Math.floor(rand() * 4);
    for (let s = 0; s < segs; s++) {
      const cx = x + (rand() - 0.5) * wander * 2;
      const cy = y + (rand() - 0.5) * wander * 2;
      x += (rand() - 0.5) * wander * 2.4;
      y += (rand() - 0.5) * wander * 2.4;
      ctx.quadraticCurveTo(cx, cy, x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/** Straight angular streaks — Amethyst fractures, Citrine facet edges. */
function fractures(ctx: Ctx, rand: Rand, color: string, count: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.lineWidth = 0.5 + rand() * 1.8;
    let x = rand() * TEX_SIZE;
    let y = rand() * TEX_SIZE;
    ctx.moveTo(x, y);
    const segs = 2 + Math.floor(rand() * 3);
    for (let s = 0; s < segs; s++) {
      x += (rand() - 0.5) * 190;
      y += (rand() - 0.5) * 190;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Fibre bands running down the texture's V axis. On a sphere UV this produces
 * parallel bands around the bead — the structure that makes Tiger Eye's
 * chatoyance read as a moving highlight rather than a static stripe.
 */
function fibreBands(ctx: Ctx, rand: Rand, dark: string, light: string, count: number) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const y = rand() * TEX_SIZE;
    const h = 2 + rand() * 14;
    ctx.globalAlpha = 0.12 + rand() * 0.4;
    ctx.fillStyle = rand() > 0.5 ? light : dark;
    ctx.fillRect(0, y, TEX_SIZE, h);
  }
  ctx.restore();
}

/** Concentric arcs — Carnelian's organic growth banding. */
function growthBands(ctx: Ctx, rand: Rand, color: string, count: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  const ox = TEX_SIZE * (0.2 + rand() * 0.6);
  const oy = TEX_SIZE * (0.2 + rand() * 0.6);
  for (let i = 0; i < count; i++) {
    ctx.beginPath();
    ctx.lineWidth = 2 + rand() * 9;
    ctx.arc(ox, oy, 20 + i * (TEX_SIZE / count) * 0.6 + rand() * 12, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

export interface StoneMaps {
  map: THREE.Texture;
  bumpMap?: THREE.Texture;
  roughnessMap?: THREE.Texture;
  metalnessMap?: THREE.Texture;
}

/** Tunable light-response per stone, merged over DEFAULTS. */
interface StoneProfile {
  roughness: number;
  metalness: number;
  clearcoat: number;
  clearcoatRoughness: number;
  transmission: number;
  thickness: number;
  ior: number;
  sheen: number;
  sheenColor: string;
  sheenRoughness: number;
  iridescence: number;
  iridescenceIOR: number;
  anisotropy: number;
  anisotropyRotation: number;
  attenuationColor: string;
  attenuationDistance: number;
  envMapIntensity: number;
  bumpScale: number;
}

const DEFAULTS: StoneProfile = {
  roughness: 0.3,
  metalness: 0.0,
  clearcoat: 0.6,
  clearcoatRoughness: 0.1,
  transmission: 0.0,
  thickness: 0.0,
  ior: 1.5,
  sheen: 0.0,
  sheenColor: '#ffffff',
  sheenRoughness: 0.4,
  iridescence: 0.0,
  iridescenceIOR: 1.3,
  anisotropy: 0.0,
  anisotropyRotation: 0.0,
  attenuationColor: '#ffffff',
  attenuationDistance: Infinity,
  envMapIntensity: 1.0,
  bumpScale: 0.04,
};

/**
 * Light response per stone. Translucent stones use real `transmission`;
 * opaque stones stay at 0 so they never pay for the transmission pass.
 */
const PROFILES: Record<string, Partial<StoneProfile>> = {
  // --- translucent ---
  'Rose Quartz': {
    // Cloudy, not glassy: milky internal scatter is what distinguishes rose
    // quartz from clear quartz, so roughness stays high despite transmission.
    transmission: 0.55, thickness: 3.2, roughness: 0.32, ior: 1.54,
    clearcoat: 0.9, clearcoatRoughness: 0.08,
    attenuationColor: '#f8a8bd', attenuationDistance: 2.4, envMapIntensity: 1.1,
  },
  'Carnelian': {
    transmission: 0.6, thickness: 2.6, roughness: 0.16, ior: 1.54,
    clearcoat: 1.0, clearcoatRoughness: 0.05,
    attenuationColor: '#c0431a', attenuationDistance: 1.4, envMapIntensity: 1.15,
  },
  'Amethyst': {
    transmission: 0.72, thickness: 3.4, roughness: 0.07, ior: 1.55,
    clearcoat: 1.0, clearcoatRoughness: 0.03,
    attenuationColor: '#6d43b8', attenuationDistance: 1.6, envMapIntensity: 1.3,
  },
  'Citrine': {
    transmission: 0.66, thickness: 2.8, roughness: 0.07, ior: 1.55,
    clearcoat: 1.0, clearcoatRoughness: 0.04,
    attenuationColor: '#d99b1f', attenuationDistance: 1.7, envMapIntensity: 1.3,
  },
  'Jade': {
    // Nephrite reads waxy: some light gets through, but the surface is a soft
    // lustre rather than a mirror.
    transmission: 0.34, thickness: 2.6, roughness: 0.34, ior: 1.6,
    clearcoat: 0.5, clearcoatRoughness: 0.22,
    attenuationColor: '#2f7f5c', attenuationDistance: 1.9, envMapIntensity: 0.95,
  },

  // --- opaque ---
  'Onyx': {
    // Polished black chalcedony: the read is almost entirely the specular
    // highlight, so roughness goes very low and clearcoat to full.
    roughness: 0.045, metalness: 0.0, clearcoat: 1.0, clearcoatRoughness: 0.015,
    envMapIntensity: 1.5, bumpScale: 0.012,
  },
  'Turquoise': {
    roughness: 0.44, clearcoat: 0.35, clearcoatRoughness: 0.3,
    envMapIntensity: 0.85, bumpScale: 0.14,
  },
  'Lapis Lazuli': {
    roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.12,
    envMapIntensity: 1.05, bumpScale: 0.05,
  },
  'Tiger Eye': {
    // Chatoyance = anisotropic specular aligned across the fibre direction.
    roughness: 0.24, anisotropy: 1.0, anisotropyRotation: Math.PI / 2,
    clearcoat: 0.75, clearcoatRoughness: 0.08,
    envMapIntensity: 1.45, bumpScale: 0.03,
  },
  'Pearl': {
    // Nacre: soft sheen plus thin-film iridescence, never a hard highlight.
    roughness: 0.14, clearcoat: 1.0, clearcoatRoughness: 0.06,
    sheen: 1.0, sheenColor: '#ffe4ec', sheenRoughness: 0.32,
    iridescence: 0.55, iridescenceIOR: 1.32,
    envMapIntensity: 1.25, bumpScale: 0.008,
  },
  'Coral Jade': {
    roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.24,
    envMapIntensity: 0.9, bumpScale: 0.09,
  },
};

/** Paints colour + bump (+ optional roughness/metalness) for one stone. */
function paintStone(name: string, hex: string, hex2: string): StoneMaps {
  const rand = mulberry32(hashString(name));
  const { canvas: colorCv, ctx } = makeCanvas();
  const { canvas: bumpCv, ctx: bump } = makeCanvas();

  // Base colour fill. Deliberately NOT a radial gradient into black — the old
  // implementation did that, which baked a fake shaded rim into the texture and
  // fought the actual lighting. Shading is the renderer's job now.
  ctx.fillStyle = hex;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  // Mid-grey bump base = flat surface.
  bump.fillStyle = '#808080';
  bump.fillRect(0, 0, TEX_SIZE, TEX_SIZE);

  let roughnessMap: THREE.Texture | undefined;
  let metalnessMap: THREE.Texture | undefined;

  switch (name) {
    case 'Lapis Lazuli': {
      // Deep blue with lighter mineral mottling and gold pyrite flecks.
      softBlobs(ctx, rand, hex2, 26, 40, 130, 0.5);
      softBlobs(ctx, rand, '#0a1c42', 18, 30, 110, 0.45);
      speckles(ctx, rand, '#ffffff', 90, 1.4, 0.1);
      // Pyrite: gold in colour, and metallic in the metalness map so it
      // catches light as metal rather than painted-on yellow.
      const { canvas: metalCv, ctx: metal } = makeCanvas();
      metal.fillStyle = '#000000';
      metal.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
      const fleckRand = mulberry32(hashString(name + 'pyrite'));
      speckles(ctx, fleckRand, '#ffd964', 70, 2.6, 0.95);
      const fleckRand2 = mulberry32(hashString(name + 'pyrite'));
      speckles(metal, fleckRand2, '#ffffff', 70, 2.6, 1.0);
      const fleckRand3 = mulberry32(hashString(name + 'pyrite'));
      speckles(bump, fleckRand3, '#c8c8c8', 70, 2.6, 1.0);
      metalnessMap = toTexture(metalCv, false);
      break;
    }

    case 'Turquoise': {
      // Spiderweb matrix: dark limonite veins sitting in surface grooves.
      softBlobs(ctx, rand, hex2, 30, 40, 130, 0.55);
      softBlobs(ctx, rand, '#14807f', 20, 30, 100, 0.4);
      const vr = mulberry32(hashString(name + 'matrix'));
      veins(ctx, vr, '#33210e', 26, 3.4, 0.8, 80);
      const vr2 = mulberry32(hashString(name + 'matrix'));
      veins(ctx, vr2, '#1a1206', 26, 2.2, 0.75, 80);
      // Same vein paths darken the bump map, so veins read as recessed.
      const vr3 = mulberry32(hashString(name + 'matrix'));
      veins(bump, vr3, '#2a2a2a', 26, 3.4, 0.9, 80);
      speckles(ctx, rand, '#0d3b3d', 60, 1.6, 0.3);
      break;
    }

    case 'Tiger Eye': {
      // Parallel fibre bands = the structure behind chatoyance.
      fibreBands(ctx, rand, '#4a2a0d', hex2, 150);
      const br = mulberry32(hashString(name + 'fibre'));
      fibreBands(bump, br, '#5a5a5a', '#a8a8a8', 150);
      softBlobs(ctx, rand, '#e0a94a', 12, 50, 160, 0.28);
      softBlobs(ctx, rand, '#3a2109', 10, 40, 130, 0.3);
      break;
    }

    case 'Amethyst': {
      softBlobs(ctx, rand, hex2, 22, 60, 190, 0.6);
      softBlobs(ctx, rand, '#2a1a4f', 14, 40, 140, 0.45);
      const fr = mulberry32(hashString(name + 'frac'));
      fractures(ctx, fr, '#ffffff', 22, 0.22);
      const fr2 = mulberry32(hashString(name + 'frac'));
      fractures(bump, fr2, '#b4b4b4', 22, 0.5);
      break;
    }

    case 'Citrine': {
      softBlobs(ctx, rand, hex2, 24, 60, 190, 0.65);
      softBlobs(ctx, rand, '#8a5f10', 10, 40, 130, 0.3);
      const fr = mulberry32(hashString(name + 'facet'));
      fractures(ctx, fr, '#fff3cd', 20, 0.28);
      const fr2 = mulberry32(hashString(name + 'facet'));
      fractures(bump, fr2, '#bebebe', 20, 0.45);
      break;
    }

    case 'Carnelian': {
      growthBands(ctx, rand, hex2, 12, 0.38);
      const gb = mulberry32(hashString(name));
      growthBands(ctx, gb, '#7a1f0f', 9, 0.3);
      softBlobs(ctx, rand, '#e0813a', 14, 50, 150, 0.3);
      const gb2 = mulberry32(hashString(name));
      growthBands(bump, gb2, '#9a9a9a', 12, 0.4);
      break;
    }

    case 'Rose Quartz': {
      // Milky internal cloud rather than distinct inclusions.
      softBlobs(ctx, rand, '#ffffff', 30, 70, 210, 0.42);
      softBlobs(ctx, rand, hex2, 20, 50, 170, 0.5);
      softBlobs(ctx, rand, '#e79aae', 12, 40, 130, 0.25);
      break;
    }

    case 'Jade': {
      softBlobs(ctx, rand, hex2, 26, 50, 170, 0.55);
      softBlobs(ctx, rand, '#0f3325', 16, 40, 140, 0.4);
      const vr = mulberry32(hashString(name + 'vein'));
      veins(ctx, vr, '#6fcf97', 14, 3.0, 0.22, 110);
      const vr2 = mulberry32(hashString(name + 'vein'));
      veins(bump, vr2, '#8e8e8e', 14, 3.0, 0.3, 110);
      break;
    }

    case 'Onyx': {
      // Nearly uniform; only faint banding keeps it from looking like plastic.
      softBlobs(ctx, rand, hex2, 14, 60, 200, 0.32);
      softBlobs(ctx, rand, '#000000', 10, 50, 160, 0.4);
      speckles(bump, rand, '#8a8a8a', 40, 1.2, 0.3);
      break;
    }

    case 'Pearl': {
      // Nacre growth rings, very low contrast.
      softBlobs(ctx, rand, hex2, 30, 70, 220, 0.6);
      softBlobs(ctx, rand, '#e2d6c4', 16, 50, 170, 0.35);
      const gb = mulberry32(hashString(name + 'nacre'));
      growthBands(ctx, gb, '#fff6ea', 16, 0.16);
      speckles(bump, rand, '#8c8c8c', 30, 1.0, 0.2);
      break;
    }

    case 'Coral Jade':
    default: {
      // Fossil coral: irregular mottling with fine pitting.
      softBlobs(ctx, rand, hex2, 30, 40, 140, 0.55);
      softBlobs(ctx, rand, '#f4ead6', 20, 40, 130, 0.4);
      speckles(ctx, rand, '#8d7460', 120, 2.2, 0.35);
      const sr = mulberry32(hashString(name + 'pit'));
      speckles(bump, sr, '#4a4a4a', 120, 2.2, 0.6);
      break;
    }
  }

  return {
    map: toTexture(colorCv, true),
    bumpMap: toTexture(bumpCv, false),
    roughnessMap,
    metalnessMap,
  };
}

export interface BuiltStone {
  material: THREE.MeshPhysicalMaterial;
  maps: StoneMaps;
}

/**
 * Builds the material for one gemstone.
 *
 * `allowTransmission` is the performance lever: transmission forces Three.js to
 * render an extra full-scene pass, so the caller drops it to an opaque
 * approximation when measured frame rate is poor.
 */
export function buildStoneMaterial(
  name: string,
  hex: string,
  secondaryHex: string | undefined,
  allowTransmission: boolean
): BuiltStone {
  const hex2 = secondaryHex || hex;
  const maps = paintStone(name, hex, hex2);
  const p = { ...DEFAULTS, ...(PROFILES[name] || {}) };

  const usesTransmission = allowTransmission && p.transmission > 0;

  // Only pass map slots that actually exist — Three.js warns when a material
  // parameter is present but undefined.
  const optionalMaps: Record<string, THREE.Texture> = {};
  if (maps.bumpMap) optionalMaps.bumpMap = maps.bumpMap;
  if (maps.roughnessMap) optionalMaps.roughnessMap = maps.roughnessMap;
  if (maps.metalnessMap) optionalMaps.metalnessMap = maps.metalnessMap;

  const material = new THREE.MeshPhysicalMaterial({
    map: maps.map,
    ...optionalMaps,
    bumpScale: p.bumpScale,
    roughness: p.roughness,
    // Without a metalness map, pyrite-free stones stay dielectric.
    metalness: maps.metalnessMap ? 1.0 : p.metalness,
    clearcoat: p.clearcoat,
    clearcoatRoughness: p.clearcoatRoughness,
    ior: p.ior,
    sheen: p.sheen,
    sheenColor: new THREE.Color(p.sheenColor),
    sheenRoughness: p.sheenRoughness,
    iridescence: p.iridescence,
    iridescenceIOR: p.iridescenceIOR,
    anisotropy: p.anisotropy,
    anisotropyRotation: p.anisotropyRotation,
    envMapIntensity: p.envMapIntensity,
    // Opaque stones render single-sided; only transmissive ones need both
    // faces, and the old code paid double fragment cost on every bead.
    side: usesTransmission ? THREE.DoubleSide : THREE.FrontSide,
  });

  if (usesTransmission) {
    material.transmission = p.transmission;
    material.thickness = p.thickness;
    if (p.attenuationDistance !== Infinity) {
      material.attenuationColor = new THREE.Color(p.attenuationColor);
      material.attenuationDistance = p.attenuationDistance;
    }
  } else if (p.transmission > 0) {
    // Performance fallback for a stone that wants transmission but can't have
    // it: lift the base colour slightly so it doesn't read as flat paint.
    material.roughness = Math.max(0.05, p.roughness * 0.8);
    material.envMapIntensity = p.envMapIntensity * 1.25;
  }

  return { material, maps };
}

export function disposeStone(built: BuiltStone) {
  built.maps.map.dispose();
  built.maps.bumpMap?.dispose();
  built.maps.roughnessMap?.dispose();
  built.maps.metalnessMap?.dispose();
  built.material.dispose();
}

/** True when the stone would use a transmission pass at high quality. */
export function stoneUsesTransmission(name: string): boolean {
  return (PROFILES[name]?.transmission ?? 0) > 0;
}

/**
 * Builds a material from an uploaded photo synchronously using TextureLoader.
 * The texture will be blank until the image loads.
 */
export function buildPhotoStoneMaterial(imageSrc: string): BuiltStone {
  const loader = new THREE.TextureLoader();
  const map = loader.load(imageSrc, (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  });

  const material = new THREE.MeshPhysicalMaterial({
    map,
    roughness: 0.15, // Nice glossy finish
    clearcoat: 0.8,
    clearcoatRoughness: 0.05,
    envMapIntensity: 1.2,
    side: THREE.FrontSide,
  });

  return { material, maps: { map } };
}
