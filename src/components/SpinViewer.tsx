import React, { Suspense, useMemo } from 'react';
import { generateDefaultCatalog } from '../data';

const Bracelet3D = React.lazy(() => import('./Bracelet3D').then(m => ({ default: m.Bracelet3D })));

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
  composition, 
  sizeMm = 8,
  wristMm = 165,
  className = "" 
}: ImageGalleryProps) {
  const beads = useMemo(() => {
    let parsedBeads: any[] = [];
    if (composition) {
      try {
        const parsedData = JSON.parse(composition) as any[];
        const catalog = generateDefaultCatalog();
        parsedBeads = parsedData.map((itemData, i) => {
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
    return parsedBeads;
  }, [composition, sizeMm]);

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      <div className="w-full h-full relative">
        <Suspense fallback={<div className="text-gray-400">Loading 3D Engine...</div>}>
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
        </Suspense>
      </div>
    </div>
  );
}
