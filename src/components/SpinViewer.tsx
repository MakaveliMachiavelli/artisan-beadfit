import React, { useState, useEffect } from 'react';
import { Bracelet3D } from './Bracelet3D';
import { generateDefaultCatalog } from '../data';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
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
}: ImageGalleryProps) {
  // If we have photography (a single top-down image works best)
  if (spinFrameCount > 0 && spinBasePath) {
    return (
      <div 
        className={`relative w-full h-full flex items-center justify-center bg-white ${className}`}
        style={{ perspective: '1000px' }}
      >
        <div 
          className="w-[110%] h-[110%]"
          style={{ 
            transform: 'rotateX(45deg)', 
            transformStyle: 'preserve-3d' 
          }}
        >
          {/* We just use the first frame for the spinner */}
          <img 
            src={`${spinBasePath}/frame-01.jpg`} 
            alt="Product view"
            className="w-full h-full object-contain mix-blend-multiply"
            style={{
              animation: 'spin 12s linear infinite'
            }}
          />
        </div>
      </div>
    );
  }

  // Fallback to 3D render if no photography yet
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
      {/* Fallback to original Bracelet3D component with some dummy props since it's just for display */}
      <Bracelet3D 
        beads={beads}
        activeCharm={null}
        selectedBeadIndex={null}
        setSelectedBeadIndex={() => {}}
        blueprintRadius={25}
        wristMm={wristMm || 165}
        ease={10}
        presentationMode={true}
      />
    </div>
  );
}
