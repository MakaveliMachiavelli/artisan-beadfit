import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isLoading: false, error: null });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      set({ user: data.user, isLoading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      set({ user: data.user, isLoading: false, error: null });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null });
    } catch (e) {
      console.error('Logout failed', e);
    }
  },
}));
