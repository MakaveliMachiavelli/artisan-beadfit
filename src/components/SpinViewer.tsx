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
  const [currentIndex, setCurrentIndex] = useState(1);

  // Preload images
  useEffect(() => {
    if (spinFrameCount > 0 && spinBasePath) {
      for (let i = 1; i <= spinFrameCount; i++) {
        const img = new Image();
        img.src = `${spinBasePath}/frame-${i.toString().padStart(2, '0')}.jpg`;
      }
    }
  }, [spinBasePath, spinFrameCount]);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev >= spinFrameCount ? 1 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev <= 1 ? spinFrameCount : prev - 1));
  };

  // If we have photography (2-5 images)
  if (spinFrameCount > 0 && spinBasePath) {
    const frameNumber = currentIndex.toString().padStart(2, '0');
    return (
      <div className={`relative group ${className}`}>
        <img 
          src={`${spinBasePath}/frame-${frameNumber}.jpg`} 
          alt={`Product view ${currentIndex}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Navigation Arrows (visible on hover) */}
        {spinFrameCount > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[var(--color-obsidian-900)] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[var(--color-obsidian-900)] p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              {Array.from({ length: spinFrameCount }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    currentIndex === idx + 1 ? 'bg-[var(--color-obsidian-900)]' : 'bg-white/60 border border-[var(--color-obsidian-200)]'
                  }`}
                />
              ))}
            </div>
          </>
        )}
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
