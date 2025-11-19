// Lo que devuelve el login
export interface AuthResponse {
  token: string;
}

// Decodificamos esto del token (opcional) o lo guardamos
export interface Usuario {
  sub: string; // username
  userId: number;
  nombre?: string; // Lo llenaremos nosotros
}

export interface CuentaDTO {
  cuentaId: number;
  numeroCuenta: string;
  saldo: number;
  estado: string;
  tipoCuentaId: number;
  // Helper para el front
  tipoTexto?: string; 
}

export interface MovimientoDTO {
  fecha: string;
  tipo: 'C' | 'D'; // C = Crédito, D = Débito
  monto: number;
  saldoNuevo: number;
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