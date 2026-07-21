import React from 'react';
import { Sparkle } from 'lucide-react';
import { CatalogItem } from '../types';
import { GEMSTONE_DB } from '../data';

interface GemstoneSelectorPanelProps {
  gemstoneNames: string[];
  mainStone: string;
  setMainStone: (name: string) => void;
  catalog: CatalogItem[];
  mainSize: number;
  setMainSize: (size: number) => void;
  showToast: (msg: string) => void;
  sizesForActiveStone: number[];
  qualitiesForActiveStoneSize: string[];
  mainQuality: string;
  setMainQuality: (quality: string) => void;
  markup: number;
}

export const GemstoneSelectorPanel: React.FC<GemstoneSelectorPanelProps> = ({
  gemstoneNames,
  mainStone,
  setMainStone,
  catalog,
  mainSize,
  setMainSize,
  showToast,
  sizesForActiveStone,
  qualitiesForActiveStoneSize,
  mainQuality,
  setMainQuality,
  markup,
}) => {
  return (
    <div className="space-y-5">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold flex items-center gap-2">
        <Sparkle className="w-3.5 h-3.5" /> 2. Gemstone Selection
      </h3>
      
      {/* Micro Swatches */}
      <div>
        <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400 mb-3">Primary Mineral Strand</span>
        <div className="flex flex-wrap gap-2.5">
          {gemstoneNames.map((name) => {
            const dbInfo = GEMSTONE_DB[name];
            const active = mainStone === name;
            return (
              <button
                key={name}
                onClick={() => {
                  setMainStone(name);
                  // Make sure size and quality exist
                  const sizes = [...new Set(catalog.filter(i => i.type === 'stone' && i.name === name).map(i => i.size))];
                  if (!sizes.includes(mainSize)) {
                    setMainSize(sizes[0] || 8);
                  }
                  showToast(`Selected ${name}`);
                }}
                className={`relative flex items-center gap-2.5 px-3.5 py-2 border rounded-full transition-all duration-300 ${
                  active 
                    ? 'border-obsidian-900 glass-panel text-obsidian-900 font-semibold shadow-ambient scale-105' 
                    : 'hairline border-obsidian-200/50 glass-panel hover:border-obsidian-400 hover:shadow-ambient hover:scale-105 text-obsidian-700'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full shadow-inner relative flex" style={{ backgroundColor: dbInfo?.hex }}>
                  <span className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full glass-panel" />
                </span>
                <span className="text-xs font-serif">{name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Size Selector */}
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400 mb-2.5">Bead Caliber (Diameter)</span>
          <div className="flex flex-wrap gap-2">
            {sizesForActiveStone.map((sz) => {
              const isRare = sz <= 3;
              return (
                <button
                  key={sz}
                  onClick={() => setMainSize(sz)}
                  className={`flex-1 min-w-[50px] py-2 text-center rounded-sm border text-xs font-mono transition-all ${
                    mainSize === sz
                      ? 'bg-[var(--theme-primary)] text-gold-100 border-obsidian-900 shadow-sm'
                      : isRare 
                        ? 'border-amber-400 text-amber-700 bg-amber-50/30 hover:border-amber-500'
                        : 'hairline border-obsidian-200/50 glass-panel hover:border-gold-400 text-obsidian-700'
                  }`}
                >
                  <span className="block text-sm font-semibold">{sz}</span>
                  <span className="block text-[9px] uppercase opacity-70">{isRare ? 'Rare' : 'mm'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quality Selector */}
        <div>
          <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400 mb-2.5">Gemstone Lustre Quality</span>
          <div className="flex gap-2">
            {qualitiesForActiveStoneSize.map((q) => {
              const it = catalog.find(i => i.type === 'stone' && i.name === mainStone && i.size === mainSize && i.quality === q);
              const basePrice = it ? Math.round(it.cost * markup) : 0;
              return (
                <button
                  key={q}
                  onClick={() => setMainQuality(q)}
                  className={`flex-1 p-2 text-left border rounded-sm transition-all ${
                    mainQuality === q
                      ? 'bg-[var(--theme-primary)] text-gold-100 border-obsidian-900 shadow-sm'
                      : 'hairline border-obsidian-200/50 glass-panel hover:border-gold-400 text-obsidian-700'
                  }`}
                >
                  <span className="block text-xs font-semibold">{q.replace(' Grade', '')}</span>
                  <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-gold-500 mt-0.5">₱{basePrice}/bead</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
