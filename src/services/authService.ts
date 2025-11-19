import { apiClient } from "./apiClient";
import { AuthResponse } from "@/types";

// Definimos qué espera el backend
export interface RegisterData {
  cedula: string;
  nombres: string;
  apellidos: string;
  email: string;
  usuario: string;
  password: string;
  telefono: string;
  direccion: string;
}

export const authService = {
  login: async (usuario: string, clave: string) => {
    // ... (tu código de login que ya funcionaba)
    return await apiClient<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ usuario, password: clave }),
    });
  },

  // NUEVO: Registro real
  register: async (datos: RegisterData) => {
    // El backend devuelve un String (mensaje), usamos response.text() internamente en apiClient
    return await apiClient<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }
};