// src/services/authService.ts
import { apiClient } from "./apiClient";
import { AuthResponse } from "@/types";

// Esto debe coincidir con RegisterRequest.java
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
  // Login: POST /api/auth/login/web
  login: async (usuario: string, clave: string) => {
    return await apiClient<AuthResponse>('/auth/login/web', {
      method: 'POST',
      body: JSON.stringify({ usuario, password: clave }),
    });
  },

  // Registro: POST /api/auth/register
  register: async (datos: RegisterData) => {
    // El backend devuelve un String simple ("Usuario registrado...")
    return await apiClient<string>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
  }
};