import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const Background3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 0;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 2);
    let time = 0;
    scene.add(dirLight);

    // 3. Elements Group
    const elementsGroup = new THREE.Group();
    scene.add(elementsGroup);

    // Arrays to hold objects
    const shards: { mesh: THREE.Mesh; rotX: number; rotY: number; rotZ: number }[] = [];

    // Mineral Shards Material (Ultra-premium refractive glass)
    const shardMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1.0,
      ior: 1.5,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      thickness: 2.0,
      metalness: 0.1,
      clearcoat: 0.5,
    });

    // 8 Massive Icosahedrons
    const icoGeo = new THREE.IcosahedronGeometry(2, 0);
    for (let i = 0; i < 8; i++) {
      const shard = new THREE.Mesh(icoGeo, shardMaterial);
      
      shard.position.set(
        (Math.random() - 0.5) * 25, 
        (Math.random() - 0.5) * 25, 
        -10 - Math.random() * 10     
      );

      shard.scale.setScalar(0.5 + Math.random() * 1.5);
      shard.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      elementsGroup.add(shard);
      shards.push({
        mesh: shard,
        rotX: (Math.random() - 0.5) * 0.002,
        rotY: (Math.random() - 0.5) * 0.002,
        rotZ: (Math.random() - 0.5) * 0.002
      });
    }

    // 2000 Microscopic Gold Stardust Particles
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 2000;
    const dustPositions = new Float32Array(dustCount * 3);
    for(let i=0; i<dustCount * 3; i++) {
        dustPositions[i] = (Math.random() - 0.5) * 30; 
        if (i%3 === 2) {
             dustPositions[i] -= 10; // offset z
        }
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    
    const dustMaterial = new THREE.PointsMaterial({
        color: 0xc5a059,
        size: 0.05,
        transparent: true,
        opacity: 0.6
    });
    
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    elementsGroup.add(dustPoints);

    // 4. Parallax Scroll & Mouse Logic
    let targetScrollY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    
    const handleScroll = () => {
      targetScrollY = window.scrollY;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // 5. Animation Loop
    let currentScrollY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;
    let animationFrameId: number;

    const animate = () => {
      time += 0.005;
      dirLight.position.x = Math.sin(time) * 10;
      dirLight.position.z = Math.cos(time) * 10;

      // Base rotation
      shards.forEach(s => {
        s.mesh.rotation.x += s.rotX;
        s.mesh.rotation.y += s.rotY;
        s.mesh.rotation.z += s.rotZ;
      });
      
      // Dust drift
      dustPoints.rotation.y += 0.0005;

      // Lerp for scroll & mouse parallax
      currentScrollY = THREE.MathUtils.lerp(currentScrollY, targetScrollY, 0.05);
      currentMouseX = THREE.MathUtils.lerp(currentMouseX, targetMouseX, 0.05);
      currentMouseY = THREE.MathUtils.lerp(currentMouseY, targetMouseY, 0.05);
      
      // Dual-parallax effect
      elementsGroup.position.y = currentScrollY * 0.005 - currentMouseY * 0.5;
      elementsGroup.position.x = currentMouseX * 0.5;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-[-50] w-full h-full pointer-events-none" 
    />
  );
};
