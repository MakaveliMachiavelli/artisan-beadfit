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
  /**
   * Starts a real PayMongo checkout session rather than an instant mock
   * capture. `totalAmount` is the price already shown on screen
   * (orderCalculations.finalTotal) - the server has no other way to know
   * what the customer was actually quoted. Returns a hosted checkoutUrl to
   * redirect the browser to; the cart is NOT cleared here - that only
   * happens once the PayMongo webhook confirms payment succeeded.
   */
  checkout: (totalAmount: number) => Promise<{ checkoutUrl: string; orderId: string }>;
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

  checkout: async (totalAmount: number) => {
    try {
      set({ isLoading: true, error: null });
      const res = await fetch('/api/commerce/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalAmount }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Checkout failed');
      }
      // Cart is intentionally left alone here - it's only cleared once the
      // PayMongo webhook confirms the payment actually succeeded. Clearing
      // it now (before the customer has paid anything) would lose the
      // design if they abandon the hosted checkout page.
      set({ isLoading: false });
      return data as { checkoutUrl: string; orderId: string };
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
      throw e;
    }
  }
}));
