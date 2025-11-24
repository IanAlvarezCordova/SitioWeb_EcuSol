//src/types/index.ts
// src/types/index.ts

// Auth
export interface AuthResponse {
  token: string;
}

// Modelos
export interface CuentaDTO {
  cuentaId: number;
  numeroCuenta: string;
  saldo: number;
  estado: string;
  tipoCuentaId: number;
  tipoTexto?: string; 
}

export interface MovimientoDTO {
  fecha: string;
  tipo: 'C' | 'D';
  monto: number;
  saldoNuevo: number;
  // AGREGADO: Esto soluciona el error en PaginaDetalleCuenta
  descripcion?: string; 
}

export interface DestinatarioDTO {
  numeroCuenta: string;
  nombreTitular: string;
  cedulaParcial: string;
}

export interface TransferenciaRequest {
  cuentaOrigen: string;
  cuentaDestino: string;
  monto: number;
  descripcion: string;
}

// Alias de compatibilidad
export type Cuenta = CuentaDTO;
export type Movimiento = MovimientoDTO;