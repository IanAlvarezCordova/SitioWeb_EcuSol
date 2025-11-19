import { apiClient } from "./apiClient";
import { CuentaDTO, DestinatarioDTO, MovimientoDTO, TransferenciaRequest } from "@/types";

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
    // Enviamos tipoCuentaId como query param (?tipoCuentaId=1)
    return await apiClient<string>(`/web/solicitar-cuenta?tipoCuentaId=${tipoCuentaId}`, {
      method: 'POST'
    });
  }

  
};