//ubi:  src/services/apiClient.ts
import { useAuthStore } from "@/store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL;

export const apiClient = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const { token, logout } = useAuthStore.getState();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // 1. LEER UNA SOLA VEZ COMO TEXTO
    const textBody = await response.text();
    
    // 2. TRATAR DE PARSEAR A JSON
    let data: any = null;
    try {
        if (textBody) data = JSON.parse(textBody);
    } catch (e) {
        // No es JSON, usamos el texto plano
        data = textBody;
    }

    // 3. SI HAY ERROR HTTP
    if (!response.ok) {
      if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/login')) {
        logout();
        window.location.href = '/login';
        throw new Error('Sesión expirada.');
      }
      
      // Intentar extraer mensaje limpio
      const msg = data?.message || data?.error || (typeof data === 'string' ? data : 'Error en el servidor');
      throw new Error(msg);
    }

    // 4. RETORNAR DATA
    return data as T;

  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
};