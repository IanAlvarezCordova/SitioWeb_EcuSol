import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bancaService } from '@/services/bancaService';
import { MovimientoDTO, CuentaDTO } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Calendar, Download } from 'lucide-react';
import { Boton } from '@/components/common/Boton';

const PaginaDetalleCuenta = () => {
  const { numeroCuenta } = useParams();
  const navigate = useNavigate();
  
  const [movimientos, setMovimientos] = useState<MovimientoDTO[]>([]);
  const [cuentaInfo, setCuentaInfo] = useState<CuentaDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!numeroCuenta) return;
      try {
        // Cargamos movimientos
        const movs = await bancaService.getMovimientos(numeroCuenta);
        setMovimientos(movs);

        // Cargamos info de la cuenta para el encabezado (opcional, buscamos en mis cuentas)
        const cuentas = await bancaService.getMisCuentas();
        const actual = cuentas.find(c => c.numeroCuenta === numeroCuenta);
        if (actual) setCuentaInfo(actual);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [numeroCuenta]);

  if (loading) return <div className="p-10 text-center">Cargando movimientos...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado y Botón Atrás */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/cuentas')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="text-ecusol-primario" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ecusol-primario">Detalle de Cuenta</h1>
          <p className="text-gray-500">Nro: {numeroCuenta}</p>
        </div>
      </div>

      {/* Tarjeta Resumen Superior */}
      {cuentaInfo && (
        <div className="bg-gradient-to-r from-ecusol-primario to-blue-900 text-white p-8 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">Saldo Disponible</p>
            <p className="text-4xl font-bold">{formatCurrency(cuentaInfo.saldo)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-blue-200 text-sm">Estado</p>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold backdrop-blur-sm">
              {cuentaInfo.estado}
            </span>
          </div>
        </div>
      )}

      {/* Lista de Movimientos */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-bold text-lg text-gray-800">Últimos Movimientos</h2>
          <Boton variante="secundario" tamano="pequeno" icono={<Download size={16}/>}>Descargar</Boton>
        </div>

        {movimientos.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No hay movimientos registrados en esta cuenta.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-medium">
                <tr>
                  <th className="px-6 py-4 text-left">Fecha</th>
                  <th className="px-6 py-4 text-left">Tipo</th>
                  <th className="px-6 py-4 text-right">Monto</th>
                  <th className="px-6 py-4 text-right">Saldo Resultante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movimientos.map((mov, index) => {
                  const esCredito = mov.tipo === 'C';
                  return (
                    <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 text-gray-600">
                        <Calendar size={16} className="text-gray-400"/>
                        {new Date(mov.fecha).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(mov.fecha).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${esCredito ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {esCredito ? <ArrowDownLeft size={12}/> : <ArrowUpRight size={12}/>}
                          {esCredito ? 'Depósito / Ingreso' : 'Retiro / Egreso'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${esCredito ? 'text-green-600' : 'text-red-600'}`}>
                        {esCredito ? '+' : '-'}{formatCurrency(mov.monto)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-700 font-medium">
                        {formatCurrency(mov.saldoNuevo)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaginaDetalleCuenta;