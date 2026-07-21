import { create } from 'zustand';

export interface BackendCartItem {
  id: string;
  cartId: string;
  type: string;
  quantity: number;
  configuration: string | null;
}

export interface BackendCart {
  id: string;
  items: BackendCartItem[];
}

interface CartState {
  cart: BackendCart | null;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (type: string, quantity: number, configuration?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<any>;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  isLoading: false,
  error: null,

  fetchCart: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/commerce/cart');
      if (res.ok) {
        const data = await res.json();
        set({ cart: data.cart, isLoading: false });
      } else {
        set({ isLoading: false, error: 'Failed to load cart' });
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  addItem: async (type, quantity, configuration) => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/commerce/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, quantity, configuration }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ cart: data.cart, isLoading: false });
      } else {
        const err = await res.json();
        set({ isLoading: false, error: err.error || 'Failed to add item' });
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch(`/api/commerce/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ cart: data.cart, isLoading: false });
      } else {
        const err = await res.json();
        set({ isLoading: false, error: err.error || 'Failed to update item' });
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  removeItem: async (itemId) => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch(`/api/commerce/cart/items/${itemId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        set({ cart: data.cart, isLoading: false });
      } else {
        const err = await res.json();
        set({ isLoading: false, error: err.error || 'Failed to remove item' });
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  checkout: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/commerce/checkout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      // On success, the cart is cleared on the backend, so we update frontend
      const newCartRes = await fetch('/api/commerce/cart');
      if (newCartRes.ok) {
        const newCartData = await newCartRes.json();
        set({ cart: newCartData.cart, isLoading: false });
      }
      return data.order;
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  }
}));
