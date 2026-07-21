import { create } from 'zustand';
import { CatalogItem } from '../types';
import { generateDefaultCatalog } from '../data';

interface CatalogState {
  // Global Business State
  catalog: CatalogItem[];
  markup: number;
  laborCost: number;
  packingCost: number;

  // Actions
  setCatalog: (catalog: CatalogItem[]) => void;
  setMarkup: (markup: number) => void;
  setLaborCost: (laborCost: number) => void;
  setPackingCost: (packingCost: number) => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  catalog: generateDefaultCatalog(),
  markup: 2.5,
  laborCost: 0,
  packingCost: 25,

  setCatalog: (catalog) => set({ catalog }),
  setMarkup: (markup) => set({ markup }),
  setLaborCost: (laborCost) => set({ laborCost }),
  setPackingCost: (packingCost) => set({ packingCost }),
}));
