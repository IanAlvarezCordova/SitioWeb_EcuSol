// src/services/cuentaService.ts
import { MODO_BACKEND, API_URL } from "./config";
import { useAuthStore } from "@/store/useAuthStore";
import { Cuenta, Movimiento } from "@/types";

const getCuentasApi = async (): Promise<Cuenta[]> => {
  const clienteId = useAuthStore.getState().usuario?.clienteId;
  if (!clienteId) throw new Error("Usuario no autenticado");

  const respuesta = await fetch(`${API_URL}/cuentas?clienteId=${clienteId}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!respuesta.ok) throw new Error("Error al obtener cuentas");
  return await respuesta.json();
};

const validarCuentaApi = async (numeroCuenta: string): Promise<Cuenta> => {
  const respuesta = await fetch(`${API_URL}/cuentas/${numeroCuenta}`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!respuesta.ok) throw new Error("Cuenta no encontrada");
  
  return await respuesta.json();
};

const getMovimientosApi = async (numeroCuenta: string): Promise<Movimiento[]> => {
  const respuesta = await fetch(`${API_URL}/cuentas/${numeroCuenta}/movimientos`, {
    method: 'GET',
    credentials: 'include'
  });
  if (!respuesta.ok) throw new Error("Error al obtener movimientos");
  return await respuesta.json();
};

const getCuentasMock = async (): Promise<Cuenta[]> => {
    return [
        { cuentaId: 10, numeroCuenta: "123456789012", tipoCuenta: "AHORROS", saldoDisponible: 1500.50, saldoContable: 1500.50, estado: "ACTIVA" }
    ];
};

const validarCuentaMock = async (numeroCuenta: string): Promise<Cuenta> => {
    return { cuentaId: 11, numeroCuenta: numeroCuenta, tipoCuenta: "AHORROS (Mock)", saldoDisponible: 200.00, saldoContable: 200.00, estado: "ACTIVA" };
};

const getMovimientosMock = async (numeroCuenta: string): Promise<Movimiento[]> => {
    return [
        { fecha: new Date().toISOString(), tipoTransaccion: "DEPOSITO", monto: 100.00, descripcion: "Mock depósito", saldoPosterior: 1600.50, canal: "WEB" }
    ];
};

export const cuentaService = {
  getCuentas: MODO_BACKEND ? getCuentasApi : getCuentasMock,
  validarCuenta: MODO_BACKEND ? validarCuentaApi : validarCuentaMock,
  getMovimientos: MODO_BACKEND ? getMovimientosApi : getMovimientosMock,
};