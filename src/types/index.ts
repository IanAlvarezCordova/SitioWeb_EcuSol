// src/types/index.ts

export interface AuthResponse {
  token: string;
  usuario: string;
}

export interface CuentaDTO {
  cuentaId: number;
  numeroCuenta: string;
  saldo: number;
  estado: string;
  tipoCuentaId: number;
}

export interface MovimientoDTO {
  fecha: string;
  tipo: 'C' | 'D';
  monto: number;
  saldoNuevo: number;
  descripcion: string;
}

export interface DestinatarioDTO {
  numeroCuenta: string;
  nombreTitular: string;
  cedulaParcial: string;
  tipoCuenta?: string; // <--- NUEVO: "Ahorros" o "Corriente"
}

export interface TransferenciaRequest {
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  descripcion: string;
}

// Interfaz para la Agenda
export interface Beneficiario {
  id?: number;
  numeroCuenta: string;
  nombreTitular: string;
  alias: string;
  email?: string;
  tipoCuenta?: string; // <--- NUEVO
}