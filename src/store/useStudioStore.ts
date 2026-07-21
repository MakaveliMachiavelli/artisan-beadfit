import { create } from 'zustand';

interface StudioState {
  // Sizing Config
  wristMm: number;
  unit: 'cm' | 'mm' | 'in';
  ease: number;
  
  // UI Tabs & Modes
  activeTab: 'minerals' | 'customization';
  previewMode: '3d' | 'classic';
  packaging: 'none' | 'velvet-box' | 'linen-pouch';
  xrayMode: boolean;
  
  // Actions
  setWristMm: (val: number) => void;
  setUnit: (val: 'cm' | 'mm' | 'in') => void;
  setEase: (val: number) => void;
  setActiveTab: (val: 'minerals' | 'customization') => void;
  setPreviewMode: (val: '3d' | 'classic') => void;
  setPackaging: (val: 'none' | 'velvet-box' | 'linen-pouch') => void;
  setXrayMode: (val: boolean) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  wristMm: 165,
  unit: 'cm',
  ease: 6,
  
  activeTab: 'minerals',
  previewMode: '3d',
  packaging: 'velvet-box',
  xrayMode: false,
  
  setWristMm: (wristMm) => set({ wristMm }),
  setUnit: (unit) => set({ unit }),
  setEase: (ease) => set({ ease }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setPreviewMode: (previewMode) => set({ previewMode }),
  setPackaging: (packaging) => set({ packaging }),
  setXrayMode: (xrayMode) => set({ xrayMode }),
}));
