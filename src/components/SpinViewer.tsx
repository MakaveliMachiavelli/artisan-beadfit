import React from 'react';
import { Bracelet3D } from './Bracelet3D';
import { generateDefaultCatalog } from '../data';

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
  // Enforce 3D render for all items to ensure photorealistic spin
  let beads: any[] = [];
  
  if (composition) {
    try {
      const parsedData = JSON.parse(composition) as any[];
      const catalog = generateDefaultCatalog();
      beads = parsedData.map((itemData, i) => {
        // Check if it's a new custom object or old string name
        if (typeof itemData === 'object' && itemData !== null) {
          return {
            id: `bead-${i}`,
            itemId: 'custom-photo-bead',
            type: 'stone',
            name: 'Custom Extracted Bead',
            quality: 'AAA',
            size: sizeMm || 8,
            lengthMm: sizeMm || 8,
            hex: itemData.hex,
            secondaryHex: itemData.secondaryHex,
            shape: itemData.shape || 'Round',
          };
        } else {
          // Old behavior for string names
          const item = catalog.find((c) => c.name === itemData) || catalog[0];
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
            shape: 'Round',
          };
        }
      });
    } catch (e) {
      console.error("Failed to parse composition", e);
    }
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="w-full h-full relative">
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
    </div>
  );
}
