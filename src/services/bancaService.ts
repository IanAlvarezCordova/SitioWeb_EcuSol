//src/services/bancaService.ts
import { apiClient } from "./apiClient";
import { CuentaDTO, DestinatarioDTO, MovimientoDTO, TransferenciaRequest } from "@/types";

// Datos de sucursales reales (Mockeados en el front para rapidez)
const SUCURSALES_DATA = [
  { id: 1, nombre: 'Matriz Norte - Iñaquito', direccion: 'Av. Amazonas N21-241 y Av. República', telefono: '02-2500-000', lat: -0.172547, lng: -78.484728 },
  { id: 2, nombre: 'La Carolina', direccion: 'Av. Naciones Unidas y Japón', telefono: '02-2450-000', lat: -0.165821, lng: -78.478892 },
  { id: 3, nombre: 'Tumbaco', direccion: 'Interoceánica Km 12', telefono: '02-2380-000', lat: -0.211567, lng: -78.405567 },
  { id: 4, nombre: 'Tarqui - Guayaquil', direccion: 'Av. Francisco de Orellana', telefono: '04-2300-000', lat: -2.176389, lng: -79.899444 },
  { id: 5, nombre: 'Malecón 2000', direccion: 'Malecón Simón Bolívar y Olmedo', telefono: '04-2510-000', lat: -2.194167, lng: -79.879722 },
  { id: 6, nombre: 'Cuenca Centro', direccion: 'Calle Gran Colombia 10-45', telefono: '07-2840-000', lat: -2.900000, lng: -79.004722 },
  { id: 7, nombre: 'Manta Playa Murciélago', direccion: 'Malecón de Manta', telefono: '05-2620-000', lat: -0.950000, lng: -80.733333 },
  { id: 8, nombre: 'Calderón', direccion: 'Av. Carapungo y Río Coca', telefono: '02-2390-000', lat: -0.105000, lng: -78.455000 },
  { id: 9, nombre: 'Conocoto', direccion: 'Av. Camilo Ponce Enríquez', telefono: '02-2870-000', lat: -0.294444, lng: -78.475000 },
  { id: 10, nombre: 'Cumbayá', direccion: 'Vía Interoceánica y San Juan', telefono: '02-2890-000', lat: -0.200000, lng: -78.425000 },
];

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

  // Nuevo: Obtener sucursales (simulado)
  getSucursales: async () => {
    return SUCURSALES_DATA;
  }
};