import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Bracelet3D } from './Bracelet3D';
import { generateDefaultCatalog } from '../data';

interface SpinViewerProps {
  spinBasePath: string | null;
  spinFrameCount: number;
  composition: string | null;
  sizeMm?: number | null;
  wristMm?: number | null;
  className?: string;
}

export function SpinViewer({ 
  spinBasePath, 
  spinFrameCount, 
  composition,
  sizeMm = 8,
  wristMm = 165,
  className = "" 
}: SpinViewerProps) {
  const [currentFrame, setCurrentFrame] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload images if we have them
  useEffect(() => {
    if (spinFrameCount > 0 && spinBasePath) {
      for (let i = 1; i <= spinFrameCount; i++) {
        const img = new Image();
        img.src = `${spinBasePath}/frame-${i.toString().padStart(2, '0')}.jpg`;
      }
    }
  }, [spinBasePath, spinFrameCount]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    
    // Calculate how far we dragged
    const diffX = e.clientX - startX;
    
    // Sensitivity: how many pixels of drag = 1 frame change
    const sensitivity = 5;
    
    if (Math.abs(diffX) > sensitivity) {
      // Calculate new frame
      const frameDelta = diffX > 0 ? -1 : 1;
      
      setCurrentFrame(prev => {
        let next = prev + frameDelta;
        if (next > spinFrameCount) next = 1;
        if (next < 1) next = spinFrameCount;
        return next;
      });
      
      setStartX(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  // If we have actual 360 photography
  if (spinFrameCount > 0 && spinBasePath) {
    const frameNumber = currentFrame.toString().padStart(2, '0');
    return (
      <div 
        ref={containerRef}
        className={`relative cursor-grab active:cursor-grabbing select-none ${className}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <img 
          src={`${spinBasePath}/frame-${frameNumber}.jpg`} 
          alt="360 view"
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none opacity-50">
          <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.59-8.4l5.67-5.67"/></svg>
            Drag to spin
          </span>
        </div>
      </div>
    );
  }

  // Fallback to 3D render if no photography
  let beads: any[] = [];
  if (composition) {
    try {
      const names = JSON.parse(composition) as string[];
      const catalog = generateDefaultCatalog();
      beads = names.map((name, i) => {
        const item = catalog.find((c) => c.name === name) || catalog[0];
        return {
          id: `bead-${i}`,
          itemId: item.id,
          type: 'stone',
          name: item.name,
          quality: item.quality,
          size: sizeMm || 8,
          lengthMm: sizeMm || 8,
          hex: item.hex,
          secondaryHex: item.secondaryHex,
        };
      });
    } catch (e) {
      console.error("Failed to parse composition", e);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas camera={{ position: [0, 8, 12], fov: 45 }}>
        <color attach="background" args={['#fafafa']} />
        <Environment preset="city" />
        
        {/* Subtle auto-rotation using OrbitControls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={false}
          autoRotate={true}
          autoRotateSpeed={2}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />

        <group position={[0, -1, 0]}>
          <Bracelet3D 
            beads={beads} 
            circumference={wristMm || 165} 
            showThread={true}
          />
          <ContactShadows 
            position={[0, -0.5, 0]} 
            opacity={0.4} 
            scale={15} 
            blur={2} 
            far={4} 
          />
        </group>
      </Canvas>
    </div>
  );
}
