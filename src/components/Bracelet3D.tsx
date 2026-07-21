import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BeadInstance, CatalogItem } from '../types';
import { GEMSTONE_DB } from '../data';
import { RotateCw, Maximize2, Sparkles, HelpCircle, Info } from 'lucide-react';

interface Bracelet3DProps {
  beads: BeadInstance[];
  activeCharm: any | null;
  selectedBeadIndex: number | null;
  setSelectedBeadIndex: (idx: number | null) => void;
  blueprintRadius: number; // inner fit radius / center radius
  wristMm: number;
  ease: number;
}

// Procedural texture generators for ultra-high-fidelity gemstone materials
function createLetterTexture(letter: string, style: string): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Background
  if (style === 'black-white') {
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff';
  } else if (style === 'gold-metal') {
    // Gold metal base is handled by material, but let's give it a slight gradient
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#ffffff'; // White text
  } else {
    // white-gold
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#d97706'; // Gold text
  }

  // Draw Letter
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 160px "Inter", sans-serif';
  
  // In a cylinder mapping, the texture wraps horizontally.
  // To make the letter face outward perfectly, we may need to draw it multiple times
  // or at a specific X offset depending on how UVs map.
  // Usually, X=128, Y=128 is center. Let's draw it 4 times around the cylinder so it's always visible
  
  ctx.fillText(letter, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  if (style !== 'black-white') {
    texture.repeat.set(4, 1);
  }
  return texture;
}

function createGemstoneTexture(name: string, baseHex: string, secondaryHex?: string, index: number = 0): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Texture();

  // Draw background gradient
  const grad = ctx.createRadialGradient(256, 256, 0, 256, 256, 360);
  grad.addColorStop(0, secondaryHex || '#ffffff');
  grad.addColorStop(0.7, baseHex);
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export const Bracelet3D: React.FC<Bracelet3DProps> = ({
  beads,
  activeCharm,
  selectedBeadIndex,
  setSelectedBeadIndex,
  blueprintRadius,
  wristMm,
  ease,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const beadsGroupRef = useRef<THREE.Group | null>(null);
  const cordMeshRef = useRef<THREE.Mesh | null>(null);

  const [hoveredBeadName, setHoveredBeadName] = useState<string | null>(null);
  const [isExploded, setIsExploded] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState<boolean>(true);

  // Initial Scene Setup
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f2f2f4'); // Light studio grey
    sceneRef.current = scene;


    const width = containerRef.current.clientWidth || 380;
    const height = containerRef.current.clientHeight || 380;
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 14, 20); // Looking down elegantly
    cameraRef.current = camera;

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Remove any previous canvases
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.1; // Don't look completely flat underneath
    controls.minDistance = 10;
    controls.maxDistance = 45;
    controlsRef.current = controls;

    // 4. RICH LIGHTING DESIGN
    // Soft global illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Single warm directional light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    // 5. STUDIO ENVIRONMENT GRID & GROUND SHADOW RECIEVER
    const groundGeo = new THREE.PlaneGeometry(100, 100);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.15 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -2.5; // sit nicely below the bracelet
    ground.receiveShadow = true;
    scene.add(ground);

    // 6. GROUPS
    const beadsGroup = new THREE.Group();
    scene.add(beadsGroup);
    beadsGroupRef.current = beadsGroup;

    // Raycaster for mouse interaction / clicking beads
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beadsGroup.children, true);

      if (intersects.length > 0) {
        // Find top-level bead mesh userData
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && !parent.userData.beadIndex === undefined) {
          parent = parent.parent;
        }
        if (parent && parent.userData && typeof parent.userData.beadIndex === 'number') {
          setSelectedBeadIndex(parent.userData.beadIndex);
        }
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      if (!renderer.domElement) return;
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(beadsGroup.children, true);

      if (intersects.length > 0) {
        let parent: THREE.Object3D | null = intersects[0].object;
        while (parent && parent.userData.beadIndex === undefined) {
          parent = parent.parent;
        }
        if (parent && parent.userData && parent.userData.name) {
          setHoveredBeadName(parent.userData.name);
          // clamp to keep tooltip inside
          const x = Math.min(event.clientX - rect.left + 15, rect.width - 240);
          const y = Math.min(event.clientY - rect.top + 15, rect.height - 150);
          setTooltipPos({ x, y });
          return;
        }
      }
      setHoveredBeadName(null);
    };

    renderer.domElement.addEventListener('click', handleCanvasClick);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);

    // 7. ANIMATION LOOP
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Smooth slow studio auto-rotation
      if (autoRotate && beadsGroupRef.current) {
        beadsGroupRef.current.rotation.y += 0.003;
      }
      
      // Magnetic Kinetic Lerping
      if (beadsGroupRef.current) {
          beadsGroupRef.current.children.forEach(child => {
             if (child.userData.targetPos) {
                 child.position.lerp(child.userData.targetPos, 0.08); // Butter smooth spring
             }
          });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 8. RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (rendererRef.current && cameraRef.current) {
          rendererRef.current.setSize(width, height);
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('click', handleCanvasClick);
        rendererRef.current.domElement.removeEventListener('pointermove', handlePointerMove);
      }
      resizeObserver.disconnect();
    };
  }, [setSelectedBeadIndex, autoRotate]);

  // Handle Updates when Beads, Charm, or Selection Changes
  useEffect(() => {
    const scene = sceneRef.current;
    const beadsGroup = beadsGroupRef.current;
    if (!scene || !beadsGroup) return;

    const prevPositions = new Map();
    beadsGroup.children.forEach(child => {
      if (child.userData.id) prevPositions.set(child.userData.id, child.position.clone());
    });

    // Clear old meshes
    while (beadsGroup.children.length > 0) {
      const obj = beadsGroup.children[0];
      beadsGroup.remove(obj);
    }

    // 1. Calculate the Natural Closed Circumference (C_beads)
    let C_beads = 0;
    beads.forEach(b => {
      C_beads += b.type === 'stone' ? b.size * 0.1 : b.size * 0.03;
    });

    // 2. Dynamic 3D Loop Radius (R)
    // ALWAYS force a perfect closed circle, zero gap.
    let baseRadius = C_beads / (2 * Math.PI);
    
    // We make sure it doesn't go below a reasonable size for empty states
    baseRadius = Math.max(baseRadius, 1.5);

    // 3. TARGET WRIST LOOP (Fixed physical wrist constraint - Ghost Wrist)
    const targetWristCircumference = (wristMm + ease) * 0.1; // 1 unit = 10mm
    const R_wrist_target = targetWristCircumference / (2 * Math.PI);
    
    // Calculate the error delta (in 3D units, 1 unit = 10mm)
    const fitError = (baseRadius * 2 * Math.PI) - targetWristCircumference;
    let wristColor = 0x0c6b4f; // Perfect Fit (Green)
    
    if (fitError < -0.15) { // < -1.5mm
      wristColor = 0xbc4a30; // Too Tight (Red)
    } else if (fitError > 0.15) { // > 1.5mm
      wristColor = 0x2c6ca6; // Too Loose (Blue)
    }

    // A rigid Ghost Wrist cylinder
    const wristRingGeo = new THREE.CylinderGeometry(R_wrist_target, R_wrist_target, 4.0, 64, 1, false);
    const wristRingMat = new THREE.MeshPhysicalMaterial({
      color: wristColor,
      transparent: true,
      opacity: 0.25, // highly transparent
      transmission: 0.8, // frosted glass look
      roughness: 0.4,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const wristRingMesh = new THREE.Mesh(wristRingGeo, wristRingMat);
    // Cylinder by default is oriented along Y axis. Beads orbit around it in X-Z plane.
    beadsGroup.add(wristRingMesh);

    // 4. Precise Angle-Based Bead Positioning
    let currentAngle = 0;

    beads.forEach((b, idx) => {
      // Calculate physical thickness of this bead in 3D units
      let thickness = b.type === 'stone' ? b.size * 0.1 : b.size * 0.03;
      if (b.type === 'stone' && b.name.includes('Heart')) {
          thickness = b.size * 0.11;
      } else if (b.type === 'stone' && b.name.includes('Cube')) {
          thickness = b.size * 0.085;
      }
      if (b.type === 'stone' && b.name.includes('Heart')) {
          thickness = b.size * 0.12; // A bit wider for heart?
      }

      // Angular step to place the next bead touching the current one
      let val = thickness / (2 * baseRadius);
      if (val > 1) val = 1; // safety clamp
      const angleStep = 2 * Math.asin(val);

      // Position in 3D Space
      const angle = currentAngle + angleStep / 2;
      const x = baseRadius * Math.cos(angle);
      const z = baseRadius * Math.sin(angle);
      const y = 0.01;

      // Advance angle for the next bead
      currentAngle += angleStep;

      // Material assignment with custom-designed photorealistic values
      let material: THREE.Material;
      const isSelected = selectedBeadIndex === idx;

      // Color adjustments
      const color1 = b.hex;
      const color2 = b?.secondaryHex || b?.hex;


      if (b.type === 'letter') {
        const style = (b as any).letterStyle || 'white-gold';
        const tex = createLetterTexture((b as any).letter || '', style);
        const isGold = style === 'gold-metal';
        material = new THREE.MeshPhysicalMaterial({
          map: tex,
          color: new THREE.Color(isGold ? '#fbbf24' : '#ffffff'),
          roughness: isGold ? 0.2 : 0.1,
          metalness: isGold ? 1.0 : 0.05,
          clearcoat: isGold ? 0.0 : 1.0,
          clearcoatRoughness: 0.1,
        });
      } else if (b.type === 'stone') {
        const proceduralTex = createGemstoneTexture(b.name, color1, color2, idx);
        
        let roughness = 0.15;
        let transmission = 0.0;
        let thickness = 0.0;
        let metalness = 0.1;
        let clearcoat = 0.8;
        let clearcoatRoughness = 0.1;
        let sheenColor = new THREE.Color('#ffffff');
        let sheen = 0.0;

        if (b.name === 'Rose Quartz' || b.name === 'Carnelian') {
          transmission = b.name === 'Rose Quartz' || b.name === 'Carnelian' ? 0.55 : 0.88;
          thickness = 1.5;
        } else if (b.name === 'Pearl') {
          transmission = 0.1;
          sheen = 0.8;
          sheenColor = new THREE.Color('#ffe4e6'); 
        } else if (b.name === 'Onyx') {
          roughness = 0.08;
        }

        material = new THREE.MeshPhysicalMaterial({
          map: proceduralTex,
          color: new THREE.Color('#ffffff'), 
          emissive: new THREE.Color(0x000000),
          roughness: roughness,
          metalness: metalness,
          clearcoat: clearcoat,
          clearcoatRoughness: clearcoatRoughness,
          transmission: transmission,
          thickness: thickness,
          sheen: sheen,
          sheenColor: sheenColor,
          side: THREE.DoubleSide,
        });
      } else {
        const isGold = b.name.includes('Gold') || b.hex === '#f59e0b';
        material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(isGold ? '#f59e0b' : '#cbd5e1'),
          emissive: new THREE.Color(0x000000),
          roughness: 0.2,
          metalness: 1.0,
        });
      }

      // Create a gorgeous high-poly sphere for gemstones
      const segments = b.type === 'stone' ? 32 : 16;
      let geometry: THREE.BufferGeometry;

      if (b.type === 'letter') {
        const style = (b as any).letterStyle || 'white-gold';
        if (style === 'black-white') {
          // Block bead
          const s = b.size * 0.05;
          geometry = new THREE.BoxGeometry(s, s, s);
          const tangentAngle = angle + Math.PI / 2;
          geometry.rotateY(-tangentAngle);
        } else {
          // Rondelle (cylinder)
          const outerRad = b.size * 0.05;
          const depth = b.size * 0.05; // 7mm width
          geometry = new THREE.CylinderGeometry(outerRad, outerRad, depth, segments);
          geometry.rotateX(Math.PI / 2);
          
          // Tangent alignment
          const tangentAngle = angle + Math.PI / 2;
          geometry.rotateY(-tangentAngle);
        }
      } else if (b.type === 'stone') {
        if (false) { } else {
          // High-fidelity gemstone sphere
          geometry = new THREE.SphereGeometry(b.size * 0.05, segments, segments);
        }
      } else {
        // Cylinder spacer ring with detailed bevels
        const outerRad = b.size * 0.045;
        const depth = b.size * 0.03;
        geometry = new THREE.CylinderGeometry(outerRad, outerRad, depth, segments);
        // Rotate cylinder to thread onto the torus nicely
        geometry.rotateX(Math.PI / 2);
        // Align tangent to the circular bracelet ring
        const tangentAngle = angle + Math.PI / 2;
        geometry.rotateY(-tangentAngle);
      }

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Group container to support selection indicators or scale hover
      const beadGroup = new THREE.Group();
      
      const prevPos = prevPositions.get(b.id);
      if (prevPos) {
          beadGroup.position.copy(prevPos);
      } else {
          // Magnetic Kinetic fly-in from above
          beadGroup.position.set(x, y + 8, z); 
      }
      
      mesh.position.set(0, 0, 0); // local center
      beadGroup.add(mesh);

      // Add elegant selection glow ring in 3D!
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(b.size * 0.062, b.size * 0.068, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: '#b08d57',
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
        });
        const selectionRing = new THREE.Mesh(ringGeo, ringMat);
        selectionRing.rotation.x = Math.PI / 2; // Flat horizontal ring
        beadGroup.add(selectionRing);

        // Add soft light source to make selected gemstone glisten!
        const selectionLight = new THREE.PointLight('#dfbc7c', 1.5, 3);
        selectionLight.position.set(0, 0.5, 0);
        beadGroup.add(selectionLight);
      }

      let targetX = x;
      let targetZ = z;
      if (isExploded) {
          // Cinematic Exploded View - pull beads outward along their radial vectors
          targetX = (baseRadius + 2.0) * Math.cos(angle);
          targetZ = (baseRadius + 2.0) * Math.sin(angle);
      }
      
      beadGroup.userData = { 
          id: b.id, 
          beadIndex: idx, 
          name: b.name, 
          targetPos: new THREE.Vector3(targetX, y, targetZ) 
      };
      beadsGroup.add(beadGroup);
    });

    // 2. RENDER THE ELASTIC THREAD STRING
    // Draw a subtle translucent torus running through the exact core of all beads
    const threadRadius = baseRadius;
    const threadThickness = 0.03;
    const cordGeo = new THREE.TorusGeometry(threadRadius, threadThickness, 8, 48);
    const cordMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#e2e8f0'), // silver/neutral nylon elastic
      roughness: 0.7,
      metalness: 0.1,
      clearcoat: 0.3,
      clearcoatRoughness: 0.4,
      transmission: 0.4, // slight translucency
      thickness: 0.05,
    });
    const cordMesh = new THREE.Mesh(cordGeo, cordMat);
    cordMesh.rotation.x = Math.PI / 2; // Lie flat in scene
    beadsGroup.add(cordMesh);
    cordMeshRef.current = cordMesh;

    // 3. ATTACH THE HANGING CHARM AT THE BOTTOM
    if (activeCharm) {
      // Attached exactly at the bottom of the circular ring (angle = Math.PI)
      const charmAngle = Math.PI / 2; // Match the 12 o'clock bottom of the design
      const cx = baseRadius * Math.cos(charmAngle);
      const cz = baseRadius * Math.sin(charmAngle);

      const charmGroup = new THREE.Group();
      charmGroup.position.set(cx, -0.3, cz); // slightly below the center hole of the bead

      // Add connector loops
      const loopGeo = new THREE.TorusGeometry(0.18, 0.03, 8, 24);
      const loopMat = new THREE.MeshPhysicalMaterial({
        color: '#ffc107',
        roughness: 0.1,
        metalness: 1.0,
      });
      const topLoop = new THREE.Mesh(loopGeo, loopMat);
      topLoop.rotation.y = Math.PI / 2;
      charmGroup.add(topLoop);

      // Main charm geometry - create a beautiful faceted crystal/medallion
      const charmRadius = activeCharm.size * 0.048;
      const charmBodyGeo = new THREE.IcosahedronGeometry(charmRadius, 1);
      const charmBodyMat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(activeCharm.hex),
        roughness: 0.08,
        metalness: activeCharm.name.includes('Gold') || activeCharm.name.includes('Silver') ? 1.0 : 0.2,
        clearcoat: 1.0,
        transmission: activeCharm.secondaryHex ? 0.6 : 0.0,
        thickness: 0.5,
      });
      const charmBody = new THREE.Mesh(charmBodyGeo, charmBodyMat);
      charmBody.position.y = -0.38; // hang down
      charmBody.castShadow = true;
      charmGroup.add(charmBody);

      beadsGroup.add(charmGroup);
    }

  }, [beads, activeCharm, selectedBeadIndex, isExploded]);

  return (
    <div className="relative w-full h-full bg-[#f2f2f4]">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* 3D Analysis View Player UI matching the photo */}
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-3 z-10 pointer-events-none">
        <span className="text-[11px] font-sans text-gray-500 tracking-wide">3D Analysis View</span>
        <div className="flex items-center bg-white/80 backdrop-blur-md rounded-full px-4 py-2.5 shadow-sm border border-gray-200/50 gap-4 pointer-events-auto">
          <button 
             onClick={() => setAutoRotate(!autoRotate)}
             className="text-gray-600 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center w-5 h-5"
          >
            {autoRotate ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            <span className="text-[10px] text-gray-400 font-sans tracking-tight">360&deg;</span>
            <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden relative ml-1">
              <div className="absolute left-0 top-0 h-full bg-gray-400 w-1/3 rounded-full" />
              <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-gray-300 rounded-full shadow-sm" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
