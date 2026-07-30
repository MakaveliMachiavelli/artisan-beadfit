import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BeadInstance } from '../types';
import { GEMSTONE_DB } from '../data';
import { Maximize2, Minimize2 } from 'lucide-react';
import { buildStoneMaterial, disposeStone, BuiltStone } from './gemstoneMaterials';

interface Bracelet3DProps {
  beads: BeadInstance[];
  activeCharm: any | null;
  selectedBeadIndex: number | null;
  setSelectedBeadIndex: (idx: number | null) => void;
  blueprintRadius: number; // inner fit radius / center radius
  wristMm: number;
  ease: number;
  presentationMode?: boolean; // disables interaction, stands bracelet up, white background
}

type Quality = 'high' | 'low';

/** Letter-bead face texture. Cheap enough to build per unique letter+style. */
function createLetterTexture(letter: string, style: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  if (style === 'black-white') {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
  } else if (style === 'gold-metal') {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#d97706';
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 160px "Inter", sans-serif';
  ctx.fillText(letter, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (style !== 'black-white') {
    texture.repeat.set(4, 1);
  }
  return texture;
}

/** Physical thickness of a bead along the strand, in scene units (1 = 10mm). */
function beadThickness(b: BeadInstance): number {
  if (b.type !== 'stone') return b.size * 0.03;
  if (b.name.includes('Heart')) return b.size * 0.12;
  if (b.name.includes('Cube')) return b.size * 0.085;
  return b.size * 0.1;
}

export const Bracelet3D: React.FC<Bracelet3DProps> = ({
  beads,
  activeCharm,
  selectedBeadIndex,
  setSelectedBeadIndex,
  wristMm,
  ease,
  presentationMode = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const beadsGroupRef = useRef<THREE.Group | null>(null);
  const turntableGroupRef = useRef<THREE.Group | null>(null);

  // Per-instance caches. These hold GPU resources owned by THIS renderer's
  // context, so they must not be shared across mounts.
  const stoneCacheRef = useRef<Map<string, BuiltStone>>(new Map());
  const geometryCacheRef = useRef<Map<string, THREE.BufferGeometry>>(new Map());
  const miscMaterialsRef = useRef<Set<THREE.Material>>(new Set());
  const miscTexturesRef = useRef<Set<THREE.Texture>>(new Set());
  const selectionRef = useRef<THREE.Group | null>(null);

  // Read by the animation loop so toggling never rebuilds the scene.
  const autoRotateRef = useRef(true);
  const explodedRef = useRef(false);
  const qualityRef = useRef<Quality>('high');

  const [autoRotate, setAutoRotate] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [quality, setQuality] = useState<Quality>('high');
  const [fps, setFps] = useState<number | null>(null);
  const [hoveredBead, setHoveredBead] = useState<{ name: string; size: number } | null>(null);
  const [sceneError, setSceneError] = useState<string | null>(null);

  autoRotateRef.current = autoRotate;
  explodedRef.current = isExploded;
  qualityRef.current = quality;

  /** Cached geometry lookup. Orientation is applied to the mesh, never baked
   *  into the geometry, so identical beads share one buffer. */
  const getGeometry = useCallback((key: string, make: () => THREE.BufferGeometry) => {
    const cache = geometryCacheRef.current;
    let geo = cache.get(key);
    if (!geo) {
      geo = make();
      cache.set(key, geo);
    }
    return geo;
  }, []);

  const getStone = useCallback((b: BeadInstance) => {
    const cache = stoneCacheRef.current;
    const key = `${b.name}|${b.hex}|${b.secondaryHex || ''}|${qualityRef.current}`;
    let built = cache.get(key);
    if (!built) {
      built = buildStoneMaterial(b.name, b.hex, b.secondaryHex, qualityRef.current === 'high');
      cache.set(key, built);
    }
    return built;
  }, []);

  // --- 1. SCENE SETUP (runs once; nothing in the UI rebuilds it) ---
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (err: any) {
      setSceneError(err?.message || 'WebGL is unavailable in this browser.');
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(presentationMode ? '#ffffff' : '#f2f2f4');
    sceneRef.current = scene;

    const width = container.clientWidth || 380;
    const height = container.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    if (presentationMode) {
      // Look straight at the standing bracelet, slightly above center
      // Camera at Z:20 keeps the whole bracelet in frame while making it large
      camera.position.set(0, 2, 20);
      camera.lookAt(0, 0, 0);
    } else {
      camera.position.set(0, 18, 22);
    }
    cameraRef.current = camera;

    renderer.setSize(width, height);
    // Capped at 1.5 rather than 2: on integrated GPUs this scene is
    // fill-rate bound, and the extra pixels buy very little at this size.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // PCFSoftShadowMap is deprecated in r185
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Image-based lighting. Without an environment map, transmission,
    // clearcoat and metalness have nothing to reflect and every gemstone
    // renders flat — this is what makes the material work visible at all.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRT.texture;
    pmrem.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controls.minDistance = 10;
    controls.maxDistance = presentationMode ? 100 : 45;
    
    if (presentationMode) {
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableRotate = false;
    }
    
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    // 1024 rather than 2048: the shadow is a soft contact pool under the
    // bracelet, so the extra resolution is not visible at this camera distance.
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // Rim light picks out the silhouette of dark stones like Onyx.
    const rimLight = new THREE.DirectionalLight(0xdfe8ff, 0.5);
    rimLight.position.set(-6, 4, -8);
    scene.add(rimLight);

    // Floor (hide in presentation mode)
    const groundGeo = new THREE.PlaneGeometry(300, 300);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.visible = !presentationMode;
    scene.add(ground);

    // If presentationMode, stand the bracelet upright like on a display
    // PI/2 = fully vertical, minus a small angle tilts the top backward
    const turntableGroup = new THREE.Group();
    scene.add(turntableGroup);
    turntableGroupRef.current = turntableGroup;

    const tiltGroup = new THREE.Group();
    if (presentationMode) {
      // Stand up, but tilted 45° back so we look down into the loop
      tiltGroup.rotation.x = Math.PI / 4; 
    }
    turntableGroup.add(tiltGroup);

    const beadsGroup = new THREE.Group();
    tiltGroup.add(beadsGroup);
    beadsGroupRef.current = beadsGroup;

    // Dev-only handle. requestAnimationFrame is paused in background/headless
    // tabs, which makes the on-screen FPS badge unmeasurable there; this lets
    // a synchronous render loop time the real per-frame cost instead.
    if (import.meta.env.DEV) {
      (window as any).__beadfit3D = { renderer, scene, camera, beadsGroup, THREE };
    }

    // --- pointer interaction ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    /** Walk up to the bead group that carries userData.beadIndex.
     *  The original code wrote `!parent.userData.beadIndex === undefined`,
     *  which is always false, so this walk never ran and clicking a bead
     *  silently did nothing. */
    const findBeadGroup = (obj: THREE.Object3D | null): THREE.Object3D | null => {
      let node: THREE.Object3D | null = obj;
      while (node && node.userData.beadIndex === undefined) {
        node = node.parent;
      }
      return node;
    };

    const pick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(beadsGroup.children, true);
      return hits.length > 0 ? findBeadGroup(hits[0].object) : null;
    };

    // Distinguish a click from an orbit drag, otherwise every rotate would
    // also reselect a bead.
    let downAt = { x: 0, y: 0 };
    const handlePointerDown = (e: MouseEvent) => {
      downAt = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (event: MouseEvent) => {
      const moved = Math.hypot(event.clientX - downAt.x, event.clientY - downAt.y);
      if (moved > 5) return;
      const group = pick(event);
      if (group && typeof group.userData.beadIndex === 'number') {
        setSelectedBeadIndex(group.userData.beadIndex);
      }
    };

    let lastHoverName: string | null = null;
    const handlePointerMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const group = pick(event);

      if (group && group.userData.name) {
        // Position is written straight to the DOM so moving the cursor does
        // not re-render React on every frame.
        const x = Math.min(event.clientX - rect.left + 16, rect.width - 210);
        const y = Math.min(event.clientY - rect.top + 16, rect.height - 90);
        if (tooltipRef.current) {
          tooltipRef.current.style.transform = `translate(${Math.max(8, x)}px, ${Math.max(8, y)}px)`;
        }
        if (group.userData.name !== lastHoverName) {
          lastHoverName = group.userData.name;
          setHoveredBead({ name: group.userData.name, size: group.userData.size });
        }
        renderer.domElement.style.cursor = 'pointer';
        return;
      }

      if (lastHoverName !== null) {
        lastHoverName = null;
        setHoveredBead(null);
      }
      renderer.domElement.style.cursor = '';
    };

    const handlePointerLeave = () => {
      lastHoverName = null;
      setHoveredBead(null);
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    // --- animation loop + frame-rate measurement ---
    let animationFrameId = 0;
    let frames = 0;
    let windowStart = performance.now();
    let slowWindows = 0;
    let windowsElapsed = 0;
    // Startup (chunk load, texture generation, first shader compiles) is
    // genuinely slow and is not representative of steady-state cost. Without
    // this guard the quality downgrade fires on every page load.
    const WARMUP_WINDOWS = 3;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      if (autoRotateRef.current) {
        if (presentationMode && turntableGroupRef.current) {
          turntableGroupRef.current.rotation.y += 0.004;
        } else {
          beadsGroup.rotation.y += 0.003;
        }
      }

      // Springy settle toward each bead's target position.
      for (const child of beadsGroup.children) {
        const target = child.userData.targetPos as THREE.Vector3 | undefined;
        if (target) child.position.lerp(target, 0.08);
      }

      renderer.render(scene, camera);

      // Measure real frame rate over ~1s windows.
      frames++;
      const now = performance.now();
      const elapsed = now - windowStart;
      if (elapsed >= 1000) {
        // A window much longer than 1s means the loop was suspended (tab
        // backgrounded, machine slept). requestAnimationFrame stops firing
        // there, so the ratio is meaningless — discard it rather than let it
        // read as a catastrophic frame rate and trip the downgrade.
        if (elapsed > 2000) {
          frames = 0;
          windowStart = now;
          slowWindows = 0;
          return;
        }

        const measured = (frames * 1000) / elapsed;
        setFps(Math.round(measured));
        frames = 0;
        windowStart = now;
        windowsElapsed++;

        if (qualityRef.current === 'high' && windowsElapsed > WARMUP_WINDOWS) {
          // Two consecutive bad seconds before downgrading, so a one-off
          // hitch (tab refocus, chunk load) doesn't trip it.
          slowWindows = measured < 30 ? slowWindows + 1 : 0;
          if (slowWindows >= 2) {
            slowWindows = 0;
            setQuality('low');
          }
        }
      }
    };
    animate();

    const applySize = (w: number, h: number) => {
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        applySize(w, h);
      }
    });
    resizeObserver.observe(container);

    /* Fallback for environments where ResizeObserver never delivers (some
       embedded/automation webviews). Without it the canvas keeps whatever size
       it had at mount and gets cropped by the container's overflow-hidden —
       on a phone-width viewport that means a bracelet cut off mid-strand. */
    const handleWindowResize = () => applySize(container.clientWidth, container.clientHeight);
    window.addEventListener('resize', handleWindowResize);

    // --- teardown: dispose everything, including the WebGL context ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      controls.dispose();

      stoneCacheRef.current.forEach(disposeStone);
      stoneCacheRef.current.clear();
      geometryCacheRef.current.forEach((g) => g.dispose());
      geometryCacheRef.current.clear();
      miscMaterialsRef.current.forEach((m) => m.dispose());
      miscMaterialsRef.current.clear();
      miscTexturesRef.current.forEach((t) => t.dispose());
      miscTexturesRef.current.clear();

      groundGeo.dispose();
      groundMat.dispose();
      envRT.dispose();
      scene.environment = null;

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      rendererRef.current = null;
      sceneRef.current = null;
      beadsGroupRef.current = null;
    };
    // setSelectedBeadIndex comes from useState and is stable; the scene must
    // never be rebuilt by a UI toggle, so nothing else belongs here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 2. BUILD BEADS (does not run on selection or explode toggles) ---
  useEffect(() => {
    const beadsGroup = beadsGroupRef.current;
    if (!beadsGroup) return;

    // Remember positions so unchanged beads don't replay the fly-in.
    const prevPositions = new Map<string, THREE.Vector3>();
    for (const child of beadsGroup.children) {
      if (child.userData.id) prevPositions.set(child.userData.id, child.position.clone());
    }

    // Dispose anything not owned by a cache before dropping it.
    const cachedGeo = new Set(geometryCacheRef.current.values());
    const cachedMat = new Set<THREE.Material>();
    stoneCacheRef.current.forEach((s) => cachedMat.add(s.material));
    miscMaterialsRef.current.forEach((m) => cachedMat.add(m));

    while (beadsGroup.children.length > 0) {
      const obj = beadsGroup.children[0];
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (mesh.geometry && !cachedGeo.has(mesh.geometry)) mesh.geometry.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const m of mats) if (m && !cachedMat.has(m)) m.dispose();
      });
      beadsGroup.remove(obj);
    }
    selectionRef.current = null;

    // Natural closed circumference of the strand.
    let circumference = 0;
    for (const b of beads) circumference += beadThickness(b);
    const baseRadius = Math.max(circumference / (2 * Math.PI), 1.5);

    // Ghost wrist: the physical constraint the design has to clear.
    const targetWristCircumference = (wristMm + ease) * 0.1;
    const rWrist = targetWristCircumference / (2 * Math.PI);
    const fitError = baseRadius * 2 * Math.PI - targetWristCircumference;
    let wristColor = 0x0c6b4f;
    if (fitError < -0.15) wristColor = 0xbc4a30;
    else if (fitError > 0.15) wristColor = 0x2c6ca6;

    const wristGeo = new THREE.CylinderGeometry(rWrist, rWrist, 4.0, 64, 1, false);
    // Plain transparency, not transmission: a transmissive ghost ring would
    // force the extra transmission pass on every frame even when no
    // translucent stone is on screen.
    const wristMat = new THREE.MeshPhysicalMaterial({
      color: wristColor,
      transparent: true,
      opacity: 0.16,
      roughness: 0.45,
      metalness: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const wristMesh = new THREE.Mesh(wristGeo, wristMat);
    wristMesh.visible = !presentationMode;
    beadsGroup.add(wristMesh);

    // Place beads by angle so neighbours touch exactly.
    let currentAngle = 0;
    beads.forEach((b, idx) => {
      const thickness = beadThickness(b);
      const angleStep = 2 * Math.asin(Math.min(thickness / (2 * baseRadius), 1));
      const angle = currentAngle + angleStep / 2;
      currentAngle += angleStep;

      const x = baseRadius * Math.cos(angle);
      const z = baseRadius * Math.sin(angle);
      const y = 0.01;
      const tangent = angle + Math.PI / 2;

      let material: THREE.Material;
      let geometry: THREE.BufferGeometry;
      const mesh = new THREE.Mesh();

      if (b.type === 'letter') {
        const style = (b as any).letterStyle || 'white-gold';
        const letter = (b as any).letter || '';
        const tex = createLetterTexture(letter, style);
        miscTexturesRef.current.add(tex);
        const isGold = style === 'gold-metal';
        material = new THREE.MeshPhysicalMaterial({
          map: tex,
          color: new THREE.Color(isGold ? '#fbbf24' : '#ffffff'),
          roughness: isGold ? 0.2 : 0.12,
          metalness: isGold ? 1.0 : 0.05,
          clearcoat: isGold ? 0.0 : 1.0,
          clearcoatRoughness: 0.1,
          envMapIntensity: 1.2,
        });
        miscMaterialsRef.current.add(material);

        if (style === 'black-white') {
          const s = b.size * 0.05;
          geometry = getGeometry(`box|${s}`, () => new THREE.BoxGeometry(s, s, s));
          mesh.rotation.y = -tangent;
        } else {
          const r = b.size * 0.05;
          geometry = getGeometry(`cyl|${r}|${r}|24`, () =>
            new THREE.CylinderGeometry(r, r, r, 24)
          );
          mesh.rotation.order = 'YXZ';
          mesh.rotation.set(Math.PI / 2, -tangent, 0);
        }
      } else if (b.type === 'stone') {
        material = getStone(b).material;
        const r = b.size * 0.05;
        geometry = getGeometry(`sphere|${r}|32`, () => new THREE.SphereGeometry(r, 32, 32));
      } else {
        const isGold = b.name.includes('Gold') || b.hex === '#f59e0b';
        material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(isGold ? '#f59e0b' : '#cbd5e1'),
          roughness: 0.18,
          metalness: 1.0,
          envMapIntensity: 1.4,
        });
        miscMaterialsRef.current.add(material);
        const outer = b.size * 0.045;
        const depth = b.size * 0.03;
        geometry = getGeometry(`cyl|${outer}|${depth}|16`, () =>
          new THREE.CylinderGeometry(outer, outer, depth, 16)
        );
        mesh.rotation.order = 'YXZ';
        mesh.rotation.set(Math.PI / 2, -tangent, 0);
      }

      mesh.geometry = geometry;
      mesh.material = material;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const beadGroup = new THREE.Group();
      const prev = prevPositions.get(b.id);
      if (prev) {
        beadGroup.position.copy(prev);
      } else {
        beadGroup.position.set(x, y + 8, z); // fly in from above
      }
      beadGroup.add(mesh);

      beadGroup.userData = {
        id: b.id,
        beadIndex: idx,
        name: b.name,
        size: b.size,
        angle,
        baseRadius,
        homePos: new THREE.Vector3(x, y, z),
        targetPos: new THREE.Vector3(x, y, z),
      };
      beadsGroup.add(beadGroup);
    });

    // Elastic cord through the bead cores.
    const cordGeo = new THREE.TorusGeometry(baseRadius, 0.03, 8, 48);
    const cordMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e2e8f0'),
      roughness: 0.6,
      metalness: 0.05,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
    });
    const cordMesh = new THREE.Mesh(cordGeo, cordMat);
    cordMesh.rotation.x = Math.PI / 2;
    beadsGroup.add(cordMesh);

    // Hanging charm.
    if (activeCharm) {
      const charmAngle = Math.PI / 2;
      const charmGroup = new THREE.Group();
      charmGroup.position.set(
        baseRadius * Math.cos(charmAngle),
        -0.3,
        baseRadius * Math.sin(charmAngle)
      );

      const loopGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 24);
      const loopMat = new THREE.MeshPhysicalMaterial({
        color: '#ffc107',
        roughness: 0.12,
        metalness: 1.0,
        envMapIntensity: 1.4,
      });
      const topLoop = new THREE.Mesh(loopGeo, loopMat);
      topLoop.rotation.y = Math.PI / 2;
      charmGroup.add(topLoop);

      const charmRadius = activeCharm.size * 0.048;
      const charmBodyGeo = new THREE.IcosahedronGeometry(charmRadius, 1);
      const isMetalCharm =
        activeCharm.name.includes('Gold') || activeCharm.name.includes('Silver');
      const charmBodyMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(activeCharm.hex),
        roughness: 0.08,
        metalness: isMetalCharm ? 1.0 : 0.15,
        clearcoat: 1.0,
        envMapIntensity: 1.3,
        ...(activeCharm.secondaryHex && qualityRef.current === 'high'
          ? { transmission: 0.6, thickness: 0.5 }
          : {}),
      });
      const charmBody = new THREE.Mesh(charmBodyGeo, charmBodyMat);
      charmBody.position.y = -0.38;
      charmBody.castShadow = true;
      charmGroup.add(charmBody);
      beadsGroup.add(charmGroup);
    }
  }, [beads, activeCharm, wristMm, ease, quality, getGeometry, getStone]);

  // --- 3. SELECTION (no bead rebuild, so clicking never flickers) ---
  useEffect(() => {
    const beadsGroup = beadsGroupRef.current;
    if (!beadsGroup) return;

    if (selectionRef.current) {
      const old = selectionRef.current;
      old.parent?.remove(old);
      old.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mm) => mm?.dispose());
        }
      });
      selectionRef.current = null;
    }

    if (selectedBeadIndex === null) return;

    const target = beadsGroup.children.find(
      (c) => c.userData.beadIndex === selectedBeadIndex
    );
    if (!target) return;

    const size = (target.userData.size as number) || 8;
    const marker = new THREE.Group();

    const ringGeo = new THREE.RingGeometry(size * 0.062, size * 0.068, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: '#b08d57',
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    marker.add(ring);

    const light = new THREE.PointLight('#dfbc7c', 1.5, 3);
    light.position.set(0, 0.5, 0);
    marker.add(light);

    target.add(marker);
    selectionRef.current = marker;
  }, [selectedBeadIndex, beads]);

  // --- 4. EXPLODED VIEW (retargets in place; no rebuild) ---
  useEffect(() => {
    const beadsGroup = beadsGroupRef.current;
    if (!beadsGroup) return;
    for (const child of beadsGroup.children) {
      const home = child.userData.homePos as THREE.Vector3 | undefined;
      if (!home) continue;
      const angle = child.userData.angle as number;
      const radius = child.userData.baseRadius as number;
      child.userData.targetPos = isExploded
        ? new THREE.Vector3((radius + 2) * Math.cos(angle), home.y, (radius + 2) * Math.sin(angle))
        : home.clone();
    }
  }, [isExploded, beads, activeCharm]);

  const hoverInfo = hoveredBead ? GEMSTONE_DB[hoveredBead.name] : null;

  if (sceneError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--color-surface-sunken)] p-8 text-center">
        <div>
          <p className="font-serif text-subheading font-semibold text-[var(--color-text-primary)]">
            3D preview unavailable
          </p>
          <p className="numeral mt-1.5 text-small text-[var(--color-text-muted)]">{sceneError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[var(--color-surface-sunken)]">
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Hover tooltip. State existed in the original component but was never
          rendered; position is written directly to this node to avoid a React
          re-render on every pointer move. */}
      <div
        ref={tooltipRef}
        className={`absolute top-0 left-0 z-20 pointer-events-none transition-opacity duration-150 ${
          hoveredBead ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {hoveredBead && (
          <div className="max-w-[220px] rounded-[var(--radius-md)] border border-[var(--color-line)] bg-white/95 px-3 py-2.5 shadow-[var(--shadow-e3)] backdrop-blur-md">
            <p className="font-serif text-subheading font-semibold leading-tight text-[var(--color-text-primary)]">
              {hoveredBead.name}
            </p>
            <p className="numeral mt-0.5 text-micro text-[var(--color-text-muted)]">
              {hoveredBead.size}mm
              {hoverInfo ? ` · Mohs ${hoverInfo.mohsHardness}` : ''}
            </p>
            {hoverInfo && (
              <p className="mt-1.5 text-small leading-snug text-[var(--color-text-secondary)]">
                {hoverInfo.meaning}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Measured frame rate — hidden in presentation mode */}
      {!presentationMode && (
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        {fps !== null && (
          <span className="numeral pointer-events-none rounded-full border border-[var(--color-line)] bg-white/80 px-2.5 py-1 text-micro font-medium text-[var(--color-text-muted)] backdrop-blur-sm">
            {fps} FPS
          </span>
        )}
        {quality === 'low' && (
          <button
            onClick={() => setQuality('high')}
            className="u-interactive rounded-full border border-[color-mix(in_srgb,var(--color-warning-fg)_28%,transparent)] bg-[var(--color-warning-bg)] px-2.5 py-1 text-micro font-semibold text-[var(--color-warning-fg)]"
            title="Frame rate stayed below 30 FPS, so gemstone transmission was disabled. Click to restore full quality."
          >
            Performance mode
          </button>
        )}
      </div>
      )}

      {/* Viewport controls.
          The previous cluster also contained a "360°" track with a hardcoded
          `w-1/3` fill and a dot at `left-1/3` — it was bound to no state and
          responded to no input, so it read as a scrubber while doing nothing.
          Removed rather than restyled; a control that cannot be operated is
          worse than no control. Hit areas raised from 20px to 36px. */}
      {/* Viewport controls — hidden in presentation mode */}
      {!presentationMode && (
      <div className="pointer-events-none absolute bottom-5 right-5 z-10 flex flex-col items-end gap-2">
        <span className="label-micro rounded-full bg-white/70 px-2 py-0.5 backdrop-blur-sm">
          Drag to orbit · tap a bead to edit
        </span>
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white/85 p-1 shadow-[var(--shadow-e2)] backdrop-blur-md">
          <button
            onClick={() => setAutoRotate((v) => !v)}
            title={autoRotate ? 'Pause rotation' : 'Resume rotation'}
            aria-label={autoRotate ? 'Pause rotation' : 'Resume rotation'}
            aria-pressed={autoRotate}
            className="u-interactive u-press grid h-9 w-9 place-items-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-obsidian-100)] hover:text-[var(--color-text-primary)]"
          >
            {autoRotate ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
            )}
          </button>

          {/* Exploded view. The state existed with no control to drive it. */}
          <button
            onClick={() => setIsExploded((v) => !v)}
            title={isExploded ? 'Collapse strand' : 'Explode strand'}
            aria-label={isExploded ? 'Collapse strand' : 'Explode strand'}
            aria-pressed={isExploded}
            className={`u-interactive u-press grid h-9 w-9 place-items-center rounded-full ${
              isExploded
                ? 'bg-[var(--theme-primary)] text-[var(--color-text-onDark)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-obsidian-100)] hover:text-[var(--color-text-primary)]'
            }`}
          >
            {isExploded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
