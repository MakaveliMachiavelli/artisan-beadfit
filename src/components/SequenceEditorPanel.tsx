import React from 'react';
import { Sparkles, Award, Sparkle, Plus, Minus } from 'lucide-react';
import { CatalogItem } from '../types';

interface SequenceEditorPanelProps {
  availableSpacers: CatalogItem[];
  activeSpacerId: string;
  setActiveSpacerId: (id: string) => void;
  availableCharms: CatalogItem[];
  selectedCharmId: string;
  setSelectedCharmId: (id: string) => void;
  markup: number;
  applyGoldenRatioAutoStyle: () => void;
  autoFitBracelet: () => void;
  beadsCount: number;
  designLength: number;
  handleAddBead: () => void;
  handleRemoveBead: () => void;
}

export const SequenceEditorPanel: React.FC<SequenceEditorPanelProps> = ({
  availableSpacers,
  activeSpacerId,
  setActiveSpacerId,
  availableCharms,
  selectedCharmId,
  setSelectedCharmId,
  markup,
  applyGoldenRatioAutoStyle,
  autoFitBracelet,
  beadsCount,
  designLength,
  handleAddBead,
  handleRemoveBead,
}) => {
  return (
    <>
      {/* Symmetrical Accents and Spacer Selector */}
      <div className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" /> 3. Architectural Accent Spacers
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableSpacers.slice(0, 6).map((sp) => {
            const active = activeSpacerId === sp.id;
            const spPrice = Math.round(sp.cost * markup);
            return (
              <button
                key={sp.id}
                onClick={() => setActiveSpacerId(sp.id)}
                className={`flex items-center justify-between p-3 border rounded-sm text-left transition-all duration-300 ${
                  active 
                    ? 'border-gold-500 glass-panel shadow-sm' 
                    : 'hairline border-obsidian-200/50 glass-panel hover:border-gold-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full shadow-inner border border-black/10" style={{ backgroundColor: sp.hex }} />
                  <div>
                    <span className="block text-xs font-medium text-[var(--theme-primary)]">{sp.name}</span>
                    <span className="block text-[10px] font-mono uppercase tracking-[0.15em] text-obsidian-400">{sp.size}mm · {sp.material}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-obsidian-600 font-semibold">₱{spPrice}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="hairline border-obsidian-200/50/30" />
      
      {/* Luxury Focal Pendant / Charm Selector */}
      <div className="space-y-4">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-600 font-semibold flex items-center gap-2">
          <Award className="w-3.5 h-3.5" /> 4. Hand-Finished Center Pendant (Optional)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {/* None Option */}
          <button
            onClick={() => setSelectedCharmId('none')}
            className={`p-3 rounded-sm border text-center flex flex-col items-center justify-center transition-all ${
              selectedCharmId === 'none'
                ? 'border-obsidian-900 bg-[var(--theme-primary)] text-gold-100 shadow-sm'
                : 'hairline border-obsidian-200/50 glass-panel hover:border-obsidian-400 hover:shadow-ambient hover:scale-105 text-obsidian-700'
            }`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] block mb-1">∅</span>
            <span className="text-xs font-semibold block">None</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.15em] opacity-60">No charm</span>
          </button>
          
          {availableCharms.map((ch) => {
            const active = selectedCharmId === ch.id;
            const chPrice = Math.round(ch.cost * markup);
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedCharmId(ch.id)}
                className={`p-3 rounded-sm border text-center flex flex-col items-center justify-center transition-all ${
                  active
                    ? 'border-obsidian-900 bg-[var(--theme-primary)] text-gold-100 shadow-sm'
                    : 'hairline border-obsidian-200/50 glass-panel hover:border-obsidian-400 hover:shadow-ambient hover:scale-105 text-obsidian-700'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full mb-1.5 shadow-inner" style={{ backgroundColor: ch.hex }} />
                <span className="text-xs font-semibold block truncate max-w-full leading-tight">{ch.name.replace(' Pendant', '')}</span>
                <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gold-500 font-semibold block mt-0.5">₱{chPrice}</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="hairline border-obsidian-200/50/30" />
      
      {/* Auto-Style Alignment Center */}
      <div className="glass-panel border hairline border-obsidian-200/50 p-5 rounded-sm flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h4 className="font-serif text-base font-semibold text-[var(--theme-primary)] flex items-center gap-1.5">
            <Sparkle className="w-4 h-4 text-gold-500 animate-pulse" /> Symmetrical Alignment
          </h4>
          <p className="text-xs text-obsidian-500 mt-1 max-w-md">
            Deploy Fibonacci index spacings and quad-pillar balances to distribute your active spacer.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={applyGoldenRatioAutoStyle}
            className="flex-1 sm:flex-initial bg-[var(--theme-primary)] hover:brightness-110 text-gold-100 text-xs font-semibold py-3 px-5 rounded-sm transition-all shadow-sm"
          >
            Golden Ratio Symmetry
          </button>
          <button
            onClick={autoFitBracelet}
            className="flex-1 sm:flex-initial glass-panel border border-gold-300 text-gold-700 hover:glass-panel text-xs font-semibold py-3 px-5 rounded-sm transition-all"
          >
            Standard Auto-Fit
          </button>
        </div>
      </div>

      <hr className="hairline border-obsidian-200/50/30" />
      
      {/* Micro sequence editor */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-obsidian-400">Fine-tune Strand Count ({beadsCount} Beads)</span>
          <span className="text-xs text-obsidian-400">Tap a bead in the preview disk to edit/swap individual stones.</span>
        </div>
        <div className="flex items-center gap-4 glass-panel border hairline border-obsidian-200/50 p-4 rounded-sm shadow-sm">
          <div className="text-sm text-obsidian-700">
            Current total length: <strong className="font-mono font-bold text-[var(--theme-primary)]">{designLength}mm</strong>
          </div>
          <div className="ml-auto flex gap-2">
            <button
              onClick={handleRemoveBead}
              className="w-10 h-10 border hairline border-obsidian-200/50 rounded-sm glass-panel hover:glass-panel flex items-center justify-center text-obsidian-700 font-semibold"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 font-mono text-base font-bold glass-panel border hairline border-obsidian-200/50 rounded-sm text-obsidian-950">
              {beadsCount}
            </span>
            <button
              onClick={handleAddBead}
              className="w-10 h-10 border hairline border-obsidian-200/50 rounded-sm glass-panel hover:glass-panel flex items-center justify-center text-obsidian-700 font-semibold"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
