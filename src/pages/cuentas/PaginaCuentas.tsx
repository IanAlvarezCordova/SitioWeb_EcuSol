import { useEffect, useState } from 'react';
import { bancaService } from '@/services/bancaService';
import { CuentaDTO } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, Loader2, PlusCircle, Lock, Building2, CheckCircle2 } from 'lucide-react';
import { Boton } from '@/components/common/Boton';
import { toast } from 'react-hot-toast';

const PaginaCuentas = () => {
  const [cuentas, setCuentas] = useState<CuentaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ESTADOS PARA EL MODAL
  const [showModal, setShowModal] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [tipoCuenta, setTipoCuenta] = useState('1'); // 1 = Ahorros (Default)

  // Verificar si ya tiene una pendiente para bloquear el botón principal
  const tieneCuentaPendiente = cuentas.some(c => c.estado === 'INACTIVA');

  const cargarCuentas = async () => {
    try {
      const data = await bancaService.getMisCuentas();
      setCuentas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCuentas();
  }, []);

  // CONFIRMAR SOLICITUD
  const handleConfirmarSolicitud = async () => {
    setProcesando(true);
    try {
      await bancaService.solicitarCuenta(parseInt(tipoCuenta));
      toast.success("¡Solicitud enviada correctamente!");
      setShowModal(false); // Cerrar modal
      await cargarCuentas(); // Recargar lista
    } catch (error: any) {
      toast.error(error.message || "Error al solicitar cuenta");
    } finally {
      setProcesando(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-ecusol-primario" size={40} /></div>;

  return (
    <div className="space-y-8 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-ecusol-primario">Mis Productos</h1>
        
        {/* BOTÓN FLOTANTE O SUPERIOR (Solo si tiene cuentas pero quiere otra) */}
        {cuentas.length > 0 && (
          <Boton 
            onClick={() => setShowModal(true)}
            disabled={tieneCuentaPendiente}
            tamano="pequeno"
            icono={<PlusCircle size={18}/>}
            className={tieneCuentaPendiente ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}
          >
            {tieneCuentaPendiente ? 'Solicitud Pendiente' : 'Nueva Cuenta'}
          </Boton>
        )}
      </div>

      {/* === LISTA DE CUENTAS === */}
      {cuentas.length === 0 ? (
        // ESTADO VACÍO
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-blue-50 text-ecusol-primario rounded-full flex items-center justify-center mx-auto mb-6">
            <Wallet size={40} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes cuentas activas</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8">
            Solicita hoy mismo tu cuenta en Banco EcuSol y empieza a manejar tus finanzas.
          </p>
          <Boton onClick={() => setShowModal(true)} icono={<PlusCircle />}>
            Solicitar Apertura de Cuenta
          </Boton>
        </div>
      ) : (
        // GRILLA DE TARJETAS
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cuentas.map((cuenta) => {
            const esInactiva = cuenta.estado === 'INACTIVA';
            const esAhorros = cuenta.tipoCuentaId === 1; // Asumiendo ID 1
            
            return (
              <div 
                key={cuenta.cuentaId} 
                className={`rounded-2xl p-6 shadow-md border transition-all relative overflow-hidden group
                  ${esInactiva 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-100 hover:shadow-xl cursor-pointer'
                  }`}
                onClick={() => !esInactiva && navigate(`/app/cuentas/${cuenta.numeroCuenta}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${esInactiva ? 'bg-gray-200 text-gray-500' : 'bg-blue-50 text-ecusol-primario'}`}>
                    {esInactiva ? <Lock size={24} /> : <Wallet size={24} />}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${esInactiva ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                    {cuenta.estado}
                  </span>
                </div>

                <h3 className="text-gray-500 text-sm font-medium uppercase">
                  {esAhorros ? 'Cuenta de Ahorros' : 'Cuenta Corriente'}
                </h3>
                <p className="text-lg font-bold text-gray-800 tracking-wider mb-4">
                  **** {cuenta.numeroCuenta.slice(-4)}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400 uppercase">Saldo Disponible</p>
                  <p className={`text-3xl font-bold mt-1 ${esInactiva ? 'text-gray-400' : 'text-ecusol-primario'}`}>
                    {esInactiva ? '$ --.--' : formatCurrency(cuenta.saldo)}
                  </p>
                </div>

                {esInactiva && (
                   <div className="mt-4 text-xs text-orange-600 font-medium bg-orange-50 p-2 rounded flex items-center gap-2">
                     <Loader2 size={12} className="animate-spin"/> Esperando aprobación...
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* === MODAL DE SOLICITUD === */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            
            <div className="bg-ecusol-primario p-6 text-white text-center">
              <Building2 className="mx-auto mb-2" size={40} />
              <h3 className="text-xl font-bold">Solicitud de Producto</h3>
              <p className="text-blue-200 text-sm">Banco EcuSol S.A.</p>
            </div>

            <div className="p-8">
              <p className="text-gray-600 text-sm mb-6 text-center">
                Selecciona el tipo de cuenta que deseas abrir con nosotros. La solicitud pasará a revisión inmediata.
              </p>

              <div className="space-y-4 mb-8">
                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-ecusol-primario transition-colors">
                  <input 
                    type="radio" 
                    name="tipo" 
                    value="1" 
                    checked={tipoCuenta === '1'}
                    onChange={(e) => setTipoCuenta(e.target.value)}
                    className="w-5 h-5 text-ecusol-primario focus:ring-ecusol-primario"
                  />
                  <div className="ml-4">
                    <span className="block font-bold text-gray-800">Cuenta de Ahorros</span>
                    <span className="text-xs text-gray-500">Ideal para guardar tu dinero y ganar interés.</span>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-ecusol-primario transition-colors">
                  <input 
                    type="radio" 
                    name="tipo" 
                    value="2" 
                    checked={tipoCuenta === '2'}
                    onChange={(e) => setTipoCuenta(e.target.value)}
                    className="w-5 h-5 text-ecusol-primario focus:ring-ecusol-primario"
                  />
                  <div className="ml-4">
                    <span className="block font-bold text-gray-800">Cuenta Corriente</span>
                    <span className="text-xs text-gray-500">Para manejo frecuente mediante cheques/tarjeta.</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50"
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirmarSolicitud}
                  disabled={procesando}
                  className="flex-1 py-3 rounded-xl bg-ecusol-secundario text-white font-bold hover:bg-yellow-600 shadow-md flex justify-center items-center gap-2"
                >
                  {procesando ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
                  {procesando ? 'Enviando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaCuentas;