import { create } from 'zustand';

export interface SavedDesign {
  id: string;
  userId: string;
  name: string;
  items: string; // JSON configuration
  createdAt: string;
}

interface SavedDesignsState {
  designs: SavedDesign[];
  isLoading: boolean;
  error: string | null;
  fetchDesigns: () => Promise<void>;
  saveDesign: (name: string, items: string) => Promise<void>;
}

export const useSavedDesignsStore = create<SavedDesignsState>((set) => ({
  designs: [],
  isLoading: false,
  error: null,

  fetchDesigns: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/commerce/designs');
      if (res.ok) {
        const data = await res.json();
        set({ designs: data.designs, isLoading: false });
      } else {
        set({ isLoading: false, error: 'Failed to fetch designs' });
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  saveDesign: async (name, items) => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/commerce/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, items }),
      });
      if (res.ok) {
        // re-fetch to get the updated list
        const res2 = await fetch('/api/commerce/designs');
        if (res2.ok) {
          const data2 = await res2.json();
          set({ designs: data2.designs, isLoading: false });
        }
      } else {
        const err = await res.json();
        set({ isLoading: false, error: err.error || 'Failed to save design' });
        throw new Error(err.error || 'Failed to save design');
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  }
}));
