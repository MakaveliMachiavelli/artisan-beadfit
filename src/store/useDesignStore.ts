import { create } from 'zustand';
import { BeadInstance } from '../types';

interface DesignState {
  // Main Configuration
  mainStone: string;
  mainSize: number;
  mainQuality: string;
  
  // Customization
  activeSpacerId: string;
  selectedCharmId: string;
  customWord: string;
  letterStyle: 'white-gold' | 'black-white' | 'gold-metal';
  
  // Bracelet Structure
  beads: BeadInstance[];

  // Actions
  setMainStone: (val: string) => void;
  setMainSize: (val: number) => void;
  setMainQuality: (val: string) => void;
  setActiveSpacerId: (val: string) => void;
  setSelectedCharmId: (val: string) => void;
  setCustomWord: (val: string) => void;
  setLetterStyle: (val: 'white-gold' | 'black-white' | 'gold-metal') => void;
  setBeads: (val: BeadInstance[] | ((prev: BeadInstance[]) => BeadInstance[])) => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  mainStone: 'Lapis Lazuli',
  mainSize: 8,
  mainQuality: 'Standard Grade',
  
  activeSpacerId: 'spacer-stainless-3',
  selectedCharmId: 'none',
  customWord: '',
  letterStyle: 'white-gold',
  
  beads: [],

  setMainStone: (mainStone) => set({ mainStone }),
  setMainSize: (mainSize) => set({ mainSize }),
  setMainQuality: (mainQuality) => set({ mainQuality }),
  setActiveSpacerId: (activeSpacerId) => set({ activeSpacerId }),
  setSelectedCharmId: (selectedCharmId) => set({ selectedCharmId }),
  setCustomWord: (customWord) => set({ customWord }),
  setLetterStyle: (letterStyle) => set({ letterStyle }),
  setBeads: (val) => set((state) => ({
    beads: typeof val === 'function' ? val(state.beads) : val
  })),
}));
