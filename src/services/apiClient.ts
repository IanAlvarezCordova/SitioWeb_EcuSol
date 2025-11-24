//src/services/apiClient.ts
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

    // Manejo especial para 401/403 (Token vencido o inválido)
    if ((response.status === 401 || response.status === 403) && !endpoint.includes('/auth/login/web')) {
      logout();
      window.location.href = '/login/web';
      throw new Error('Su sesión ha expirado.');
    }

    // Si la respuesta NO es exitosa (ej: 400, 500)
    if (!response.ok) {
      let errorMessage = 'Ocurrió un error inesperado';
      
      try {
        // Intentamos leer el JSON que nos manda el GlobalExceptionHandler
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Si falla al leer JSON, intentamos leer como texto plano
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      }

      throw new Error(errorMessage);
    }

    // Si todo salió bien (200 OK)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") === -1) {
      return (await response.text()) as unknown as T;
    }

    return response.json();

  } catch (error: any) {
    // Este catch captura errores de red (servidor apagado, sin internet)
    console.error("API Error:", error);
    throw error; // Relanzamos el error para que el componente lo muestre
  }
};