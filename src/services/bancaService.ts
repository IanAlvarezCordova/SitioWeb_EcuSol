// src/services/bancaService.ts
import { apiClient } from "./apiClient";
import { CuentaDTO, DestinatarioDTO, MovimientoDTO, TransferenciaRequest } from "@/types";

// Tipos auxiliares si no están en types/index.ts
export interface Beneficiario {
  tipoCuenta: any;
  id?: number;
  numeroCuenta: string;
  nombreTitular: string;
  alias: string;
  email?: string;
}

export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  lat: number;
  lng: number;
}

export const bancaService = {
  getMisCuentas: async () => {
    return await apiClient<CuentaDTO[]>('/web/cuentas');
  },

  getMovimientos: async (numeroCuenta: string) => {
    return await apiClient<MovimientoDTO[]>(`/web/movimientos/${numeroCuenta}`);
  },

  validarDestinatario: async (numeroCuenta: string) => {
    return await apiClient<DestinatarioDTO>(`/web/validar-destinatario/${numeroCuenta}`);
  },

  transferir: async (data: TransferenciaRequest) => {
    return await apiClient<string>('/web/transferir', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  solicitarCuenta: async (tipoCuentaId: number) => {
    return await apiClient<string>(`/web/solicitar-cuenta?tipoCuentaId=${tipoCuentaId}`, {
      method: 'POST'
    });
  },

  // --- NUEVO: ENDPOINTS REALES ---
  
  getBeneficiarios: async () => {
    return await apiClient<Beneficiario[]>('/web/beneficiarios');
  },

  guardarBeneficiario: async (data: Beneficiario) => {
    return await apiClient<string>('/web/beneficiarios', {
        method: 'POST',
        body: JSON.stringify(data)
    });
  },

  getSucursales: async () => {
    // Ya no es Mock, llama al backend
    return await apiClient<Sucursal[]>('/web/sucursales'); 
  }
};