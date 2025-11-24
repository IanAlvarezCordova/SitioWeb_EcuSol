//src/store/useAuthStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, RegisterData } from '@/services/authService';

interface AuthState {
  token: string | null;
  usuario: string | null;
  login: (token: string, usuario: string) => void;
  logout: () => void;
  // Agregamos registrar aquí para que TS no se queje
  registrar: (datos: RegisterData) => Promise<void>;
  isAutenticado: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      usuario: null,
      
      login: (token, usuario) => set({ token, usuario }),
      
      logout: () => set({ token: null, usuario: null }),

      // Implementación de registrar
      registrar: async (datos) => {
         await authService.register(datos);
         // No logueamos automáticamente, solo ejecutamos la acción
      },

      isAutenticado: () => !!get().token,
    }),
    { name: 'ecusol-auth' }
  )
);