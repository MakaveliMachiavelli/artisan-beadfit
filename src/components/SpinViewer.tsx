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
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedPhotoUrl(url);
    }
  };

  // Enforce 3D render for all items to ensure photorealistic spin
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
          photoUrl: uploadedPhotoUrl || undefined, // Map uploaded photo onto beads
        };
      });
    } catch (e) {
      console.error("Failed to parse composition", e);
    }
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Fallback to original Bracelet3D component with some dummy props since it's just for display */}
      <div className="w-full relative">
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
      
      {/* Temporary Upload Control for Testing Option B (Texture Extraction) */}
      <div className="absolute top-2 right-2 bg-white/90 p-2 rounded shadow text-xs flex flex-col gap-1 z-10 opacity-0 hover:opacity-100 transition-opacity">
        <label className="font-bold">Test Photo-to-3D:</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileUpload}
          className="w-48 text-[10px]"
        />
      </div>
    </div>
  );
}
