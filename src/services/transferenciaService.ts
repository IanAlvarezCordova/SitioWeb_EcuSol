// src/services/transferenciaService.ts
import { MODO_BACKEND, API_URL } from "./config";
import { TransferenciaResponse } from "@/types";

export interface TransferenciaRequest {
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  descripcion: string;
}

const enviarTransferenciaApi = async (datos: TransferenciaRequest): Promise<TransferenciaResponse> => {
  const respuesta = await fetch(`${API_URL}/cuentas/transferencias`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
    credentials: 'include'
  });
  if (!respuesta.ok) {
    const errorData = await respuesta.json().catch(() => ({}));
    throw new Error(errorData.message || "Error en la transferencia");
  }
  return await respuesta.json();
};

const enviarTransferenciaMock = async (datos: TransferenciaRequest): Promise<TransferenciaResponse> => {
    return {
        codigoTransaccion: "TX-MOCK-001",
        fecha: new Date().toISOString(),
        saldoDisponibleOrigen: 1000.00,
        saldoDisponibleDestino: 500.00
    };
};

export const transferenciaService = {
    enviar: MODO_BACKEND ? enviarTransferenciaApi : enviarTransferenciaMock,
};