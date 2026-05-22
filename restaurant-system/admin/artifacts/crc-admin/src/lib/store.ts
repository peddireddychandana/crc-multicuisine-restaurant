import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Admin } from '@workspace/api-client-react';

interface AuthState {
  token: string | null;
  admin: Admin | null;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      admin: null,
      login: (token, admin) => set({ token, admin }),
      logout: () => set({ token: null, admin: null }),
      isAuthenticated: () => !!get().token,
    }),
    {
      name: 'crc-admin-auth',
    }
  )
);
