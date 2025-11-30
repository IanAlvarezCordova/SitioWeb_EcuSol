//ubi: src/pages/cuentas/PaginaDetalleCuenta.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bancaService } from '@/services/bancaService';
import { MovimientoDTO, CuentaDTO } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { ArrowLeft, ArrowDownLeft, ArrowUpRight, Calendar, Download, Filter, Search } from 'lucide-react';
import { Boton } from '@/components/common/Boton';

// Estructura para el agrupamiento por semana
interface MovimientoAgrupado {
    semana: string; // Ejemplo: "Lun 17 Nov - Dom 23 Nov"
    movimientos: MovimientoDTO[];
}

/**
 * Agrupa los movimientos por semana (Lunes a Domingo), asegurando consistencia horaria.
 */
const groupByWeek = (movimientos: MovimientoDTO[]): MovimientoAgrupado[] => {
    const grupos: { [key: string]: MovimientoDTO[] } = {};

    const formatDay = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options).replace(/\./g, ''); // Formato: Lun 17 Nov
    };

    movimientos.forEach(mov => {
        const date = new Date(mov.fecha);
        
        // **CORRECCIÓN CRÍTICA:** Normalizar la hora a medianoche (00:00:00) 
        // para que el cálculo del Lunes sea idéntico para todas las transacciones del mismo día calendario.
        date.setHours(0, 0, 0, 0); 
        
        // Calcula el inicio de la semana (Lunes)
        const dayOfWeek = (date.getDay() + 6) % 7; // 0=Lunes, 6=Domingo
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - dayOfWeek);
        
        // Clave de agrupamiento (formato YYYY-MM-DD del Lunes)
        const weekKey = startOfWeek.toISOString().split('T')[0];

        // Calcula el final de la semana (Domingo)
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        const groupTitle = `${formatDay(startOfWeek)} - ${formatDay(endOfWeek)}`;
        
        if (!grupos[weekKey]) {
            grupos[weekKey] = [];
        }
        // Agrega el título al primer elemento del grupo para usarlo fácilmente después
        if (grupos[weekKey].length === 0) {
            (grupos[weekKey] as any).groupTitle = groupTitle;
        }

        grupos[weekKey].push(mov);
    });

    // Convierte el objeto de grupos en un array ordenado
    return Object.keys(grupos)
        .sort((a, b) => b.localeCompare(a)) // Ordena por fecha descendente
        .map(key => ({
            semana: (grupos[key] as any).groupTitle,
            movimientos: grupos[key],
        }));
};


const PaginaDetalleCuenta = () => {
  const { numeroCuenta } = useParams();
  const navigate = useNavigate();
  
  const [movimientos, setMovimientos] = useState<MovimientoDTO[]>([]);
  const [movimientosFiltrados, setMovimientosFiltrados] = useState<MovimientoDTO[]>([]);
  const [gruposSemanales, setGruposSemanales] = useState<MovimientoAgrupado[]>([]); // NUEVO ESTADO
  const [cuentaInfo, setCuentaInfo] = useState<CuentaDTO | null>(null);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'INGRESOS' | 'EGRESOS'>('TODOS');
  const [filtroFecha, setFiltroFecha] = useState<'SIEMPRE' | 'SEMANA' | 'MES'>('SIEMPRE');

  useEffect(() => {
    const cargarDatos = async () => {
      if (!numeroCuenta) return;
      try {
        const movs = await bancaService.getMovimientos(numeroCuenta);
        setMovimientos(movs);
        // Inicializa los filtrados y grupos con los datos originales
        setMovimientosFiltrados(movs);
        setGruposSemanales(groupByWeek(movs)); // Agrupamiento inicial

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

  // Lógica de Filtrado y Agrupamiento
  useEffect(() => {
    let resultado = [...movimientos];

    // 1. Filtro por Tipo
    if (filtroTipo === 'INGRESOS') resultado = resultado.filter(m => m.tipo === 'C');
    if (filtroTipo === 'EGRESOS') resultado = resultado.filter(m => m.tipo === 'D');

    // 2. Filtro por Fecha
    const ahora = new Date();
    if (filtroFecha === 'SEMANA') {
        const haceUnaSemana = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        resultado = resultado.filter(m => new Date(m.fecha) >= haceUnaSemana);
    }
    if (filtroFecha === 'MES') {
        const haceUnMes = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
        resultado = resultado.filter(m => new Date(m.fecha) >= haceUnMes);
    }

    // 3. Actualizar el estado de movimientos filtrados y el agrupamiento semanal
    setMovimientosFiltrados(resultado);
    setGruposSemanales(groupByWeek(resultado)); // Agrupa los resultados filtrados

  }, [filtroTipo, filtroFecha, movimientos]);


// Componente de Ítem de Movimiento para la nueva lista
const MovimientoItem = ({ mov }: { mov: MovimientoDTO }) => {
    const esCredito = mov.tipo === 'C';
    const colorMonto = esCredito ? 'text-green-600' : 'text-red-600';
    const SignoIcon = esCredito ? ArrowDownLeft : ArrowUpRight;
    const tipoTexto = esCredito ? 'Ingreso' : 'Egreso';

    const fecha = new Date(mov.fecha);
    const fechaFormat = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
    const horaFormat = fecha.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });

    return (
        <div className="flex justify-between items-center p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${esCredito ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    <SignoIcon size={18} />
                </div>
                <div>
                    <p className="font-medium text-gray-800">{mov.descripcion || (esCredito ? 'Depósito' : 'Retiro/Transferencia')}</p>
                    <div className="text-xs text-gray-500 flex gap-2">
                        <span>{fechaFormat}</span>
                        <span>{horaFormat}</span>
                    </div>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold ${colorMonto}`}>
                    {esCredito ? '+' : '-'}{formatCurrency(mov.monto)}
                </p>
                <p className="text-xs text-gray-400">
                    Saldo: {formatCurrency(mov.saldoNuevo)}
                </p>
            </div>
        </div>
    );
};


  if (loading) return <div className="p-10 text-center text-ecusol-primario font-bold">Cargando movimientos...</div>;
  
  const totalMovimientos = movimientosFiltrados.length;


  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Encabezado */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/app/cuentas')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft className="text-ecusol-primario" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ecusol-primario">Detalle de Movimientos</h1>
          <p className="text-gray-500 text-sm">Cuenta Nro: <span className="font-mono font-bold text-gray-700">{numeroCuenta}</span></p>
        </div>
      </div>

      {/* Tarjeta Resumen */}
      {cuentaInfo && (
        <div className={`p-8 rounded-2xl shadow-lg flex justify-between items-center text-white relative overflow-hidden
            ${cuentaInfo.tipoCuentaId === 1 
                ? 'bg-gradient-to-r from-ecusol-primario to-blue-900' // Azul para Ahorros
                : 'bg-gradient-to-r from-gray-800 to-black'} // Negro para Corriente
        `}>
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">
                {cuentaInfo.tipoCuentaId === 1 ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}
            </p>
            <p className="text-4xl font-bold tracking-tight">{formatCurrency(cuentaInfo.saldo)}</p>
            <p className="text-xs text-white/60 mt-2">Saldo Disponible</p>
          </div>
          <div className="text-right hidden sm:block relative z-10">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm border border-white/30">
              {cuentaInfo.estado}
            </span>
          </div>
          {/* Decoración */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
             <svg width="200" height="200" viewBox="0 0 200 200" fill="white"><circle cx="150" cy="150" r="100" /></svg>
          </div>
        </div>
      )}

      {/* Filtros y Acciones */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
         <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            <Filter size={18} className="text-gray-400 mr-2" />
            
            <select 
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ecusol-primario outline-none"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as any)}
            >
                <option value="TODOS">Todos los tipos</option>
                <option value="INGRESOS">Solo Ingresos</option>
                <option value="EGRESOS">Solo Egresos</option>
            </select>

            <select 
                className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ecusol-primario outline-none"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value as any)}
            >
                <option value="SIEMPRE">Todo el historial</option>
                <option value="SEMANA">Últimos 7 días</option>
                <option value="MES">Este mes</option>
            </select>
         </div>
         
         <Boton variante="secundario" tamano="pequeno" icono={<Download size={16}/>}>
            Exportar Excel
         </Boton>
      </div>

      {/* NUEVA SECCIÓN DE MOVIMIENTOS AGRUPADOS POR SEMANA */}
      <h2 className="text-xl font-bold text-gray-700 mt-6">Historial ({totalMovimientos} movimientos)</h2>

      {totalMovimientos === 0 ? (
         <div className="p-16 text-center flex flex-col items-center text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-200">
            <Search size={48} className="mb-4 opacity-20"/>
            <p>No se encontraron movimientos con estos filtros.</p>
         </div>
      ) : (
        <div className="space-y-6">
          {gruposSemanales.map((grupo, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                {/* Encabezado de la Semana */}
                <div className="bg-gray-50 p-3 px-6 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-bold uppercase text-gray-500 flex items-center gap-2">
                        <Calendar size={14} className='text-ecusol-secundario'/> {grupo.semana}
                    </span>
                    <span className='text-xs text-gray-400'>{grupo.movimientos.length} transacciones</span>
                </div>
                
                {/* Lista de Movimientos de la Semana */}
                <div>
                    {grupo.movimientos.map((mov, movIndex) => (
                        <MovimientoItem key={movIndex} mov={mov} />
                    ))}
                </div>
            </div>
          ))}
        </div>
      )}
        {/* En la versión anterior se usaba esta tabla, ahora se usa el nuevo listado agrupado */}
    </div>
  );
};

export default PaginaDetalleCuenta;