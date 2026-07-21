import React from 'react';
import { Sparkles } from 'lucide-react';

interface LetterBeadSequencerProps {
  customWord: string;
  setCustomWord: (word: string) => void;
  letterStyle: 'white-gold' | 'black-white' | 'gold-metal';
  setLetterStyle: (style: 'white-gold' | 'black-white' | 'gold-metal') => void;
}

export const LetterBeadSequencer: React.FC<LetterBeadSequencerProps> = ({
  customWord,
  setCustomWord,
  letterStyle,
  setLetterStyle,
}) => {
  return (
    <div className="space-y-6">
      <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--theme-primary)] uppercase tracking-[0.18em] font-semibold flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5" /> 3. Custom Lettering
      </h3>
      
      <div className="glass-panel border hairline border-obsidian-200/50 p-5 rounded-sm shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-semibold text-obsidian-900 mb-2 uppercase tracking-[0.18em]">Engrave a Word</label>
          <input 
            type="text" 
            maxLength={10} 
            placeholder="Enter up to 10 letters" 
            value={customWord}
            onChange={(e) => setCustomWord(e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase())}
            className="w-full glass-panel border hairline border-obsidian-200/50 rounded-sm px-4 py-3 text-center font-mono text-lg font-bold text-obsidian-900 focus:outline-none focus:border-obsidian-900 transition-colors uppercase"
          />
        </div>
        
        <div className="pt-2">
          <label className="block text-[10px] font-mono uppercase tracking-[0.15em] text-obsidian-400 mb-2 uppercase tracking-[0.18em]">Material Finish</label>
          <div className="flex gap-2">
            <button 
              onClick={() => setLetterStyle('white-gold')}
              className={`flex-1 py-2 px-3 border rounded-sm text-xs font-semibold transition-all ${letterStyle === 'white-gold' ? 'border-obsidian-900 glass-panel text-[var(--theme-primary)]' : 'hairline border-obsidian-200/50 glass-panel text-obsidian-500'}`}
            >
              White/Gold Acrylic
            </button>
            <button 
              onClick={() => setLetterStyle('black-white')}
              className={`flex-1 py-2 px-3 border rounded-sm text-xs font-semibold transition-all ${letterStyle === 'black-white' ? 'border-obsidian-900 glass-panel text-[var(--theme-primary)]' : 'hairline border-obsidian-200/50 glass-panel text-obsidian-500'}`}
            >
              Black/White Acrylic
            </button>
            <button 
              onClick={() => setLetterStyle('gold-metal')}
              className={`flex-1 py-2 px-3 border rounded-sm text-xs font-semibold transition-all ${letterStyle === 'gold-metal' ? 'border-obsidian-900 glass-panel text-[var(--theme-primary)]' : 'hairline border-obsidian-200/50 glass-panel text-obsidian-500'}`}
            >
              Premium Gold Metal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
