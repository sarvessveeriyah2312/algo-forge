import { create } from 'zustand';
import { api, ApiError } from '../lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  hydrateUser: () => Promise<void>;
}

const loadStoredUser = (): { user: User | null; isAuthenticated: boolean } => {
  try {
    const stored = localStorage.getItem('af_user');
    const token = localStorage.getItem('af_access_token');
    if (stored && token) {
      return { user: JSON.parse(stored), isAuthenticated: true };
    }
  } catch {}
  return { user: null, isAuthenticated: false };
};

const { user: initialUser, isAuthenticated: initialAuth } = loadStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: initialAuth,
  user: initialUser,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      await api.login(email, password);
      const user = await api.getMe();
      localStorage.setItem('af_user', JSON.stringify(user));
      localStorage.setItem('af_is_authenticated', 'true');
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Login failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  register: async (email, username, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      await api.register(email, username, password, fullName);
      // Auto-login after register
      await api.login(email, password);
      const user = await api.getMe();
      localStorage.setItem('af_user', JSON.stringify(user));
      localStorage.setItem('af_is_authenticated', 'true');
      set({ isAuthenticated: true, user, isLoading: false });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Registration failed. Please try again.';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await api.logout();
    set({ isAuthenticated: false, user: null, isLoading: false, error: null });
  },

  clearError: () => set({ error: null }),

  hydrateUser: async () => {
    const token = api.getAccessToken();
    if (!token) return;
    try {
      const user = await api.getMe();
      localStorage.setItem('af_user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      api.clearTokens();
      set({ user: null, isAuthenticated: false });
    }
  },
}));
