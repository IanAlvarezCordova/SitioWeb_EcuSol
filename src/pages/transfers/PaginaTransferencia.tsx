import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bancaService } from '@/services/bancaService';
import { CuentaDTO, DestinatarioDTO } from '@/types';
import { Boton } from '@/components/common/Boton';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle2, User, Users, Loader2, AlertTriangle, Clock, Wallet, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaginaTransferencia = () => {
  const navigate = useNavigate();
  
  const [misCuentas, setMisCuentas] = useState<CuentaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado del Formulario
  const [modo, setModo] = useState<'PROPIAS' | 'TERCEROS'>('PROPIAS');
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState(''); 
  const [destinoPropio, setDestinoPropio] = useState(''); 
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Estados UI
  const [destinatarioData, setDestinatarioData] = useState<DestinatarioDTO | null>(null);
  const [validando, setValidando] = useState(false);
  
  // Modal y Timer
  const [showModal, setShowModal] = useState(false);
  const [procesandoTx, setProcesandoTx] = useState(false); 
  const [txExitosa, setTxExitosa] = useState(false);
  const [segundos, setSegundos] = useState(30);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await bancaService.getMisCuentas();
        // MEJORA DE ROBUSTEZ: Solo filtra por ACTIVA sin necesidad de ACTIVO
        const activas = data.filter(c => c.estado && c.estado.toUpperCase() === 'ACTIVA'); 
        setMisCuentas(activas);
        
        if(activas.length > 0) {
          const cuentaOrigenInicial = activas[0].numeroCuenta;
          setOrigen(cuentaOrigenInicial);
          
          // CORRECCIÓN BUG: Obtener la primera cuenta de destino diferente a la de origen
          const cuentasDestinoDisponibles = activas.filter(c => c.numeroCuenta !== cuentaOrigenInicial);
          
          if(cuentasDestinoDisponibles.length > 0) {
            setDestinoPropio(cuentasDestinoDisponibles[0].numeroCuenta);
          } else {
            setDestinoPropio(''); // No hay cuentas destino disponibles
          }
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    cargar();
  }, []);

  const handleValidar = async () => {
    if (!destino || destino.length < 5) return;
    setValidando(true);
    setDestinatarioData(null);
    try {
      const data = await bancaService.validarDestinatario(destino);
      setDestinatarioData(data);
      toast.success("Cuenta verificada");
    } catch (error) {
      toast.error("Cuenta no encontrada");
    } finally {
      setValidando(false);
    }
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!monto || parseFloat(monto) <= 0) { toast.error("Monto inválido"); return; }
    if (modo === 'TERCEROS' && !destinatarioData) { toast.error("Debe validar la cuenta destino"); return; }
    if (modo === 'PROPIAS' && origen === destinoPropio) { toast.error("Origen y destino no pueden ser iguales"); return; }
    
    setSegundos(30);
    setShowModal(true);
    setTxExitosa(false);
  };

  // Lógica del Reloj (Timer)
  useEffect(() => {
    if (showModal && !txExitosa && segundos > 0) {
        timerRef.current = setTimeout(() => setSegundos(s => s - 1), 1000);
    } else if (segundos === 0 && showModal && !txExitosa) {
        setShowModal(false); 
        toast.error("Tiempo de seguridad expirado");
    }
    return () => clearTimeout(timerRef.current);
  }, [segundos, showModal, txExitosa]);

  const getColorReloj = () => {
      if (segundos > 15) return 'text-green-500 border-green-500';
      if (segundos > 6) return 'text-yellow-500 border-yellow-500';
      return 'text-red-500 border-red-500 animate-pulse';
  };


  const confirmarTransferencia = async () => {
    setProcesandoTx(true);
    clearTimeout(timerRef.current);

    try {
      const cuentaDestinoFinal = modo === 'PROPIAS' ? destinoPropio : destino;
      await bancaService.transferir({
        cuentaOrigen: origen,
        cuentaDestino: cuentaDestinoFinal,
        monto: parseFloat(monto),
        descripcion: descripcion || "Transferencia EcuSol"
      });
      
      setTxExitosa(true);
      // Actualiza solo las cuentas activas para el estado
      const data = await bancaService.getMisCuentas();
      setMisCuentas(data.filter(c => c.estado && c.estado.toUpperCase() === 'ACTIVA'));
      
    } catch (error: any) {
      toast.error(error.message);
      setShowModal(false); 
    } finally {
      setProcesandoTx(false);
    }
  };

  const cerrarModalYLimpiar = () => {
    setShowModal(false);
    if (txExitosa) {
      setMonto(''); setDescripcion(''); setDestino(''); setDestinatarioData(null); setTxExitosa(false);
    }
  };

  // Componente visual para seleccionar cuenta (Selector Bonito)
  const SelectorCuenta = ({ valor, onChange, opciones, label }: any) => (
    <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-700">{label}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {opciones.map((c: CuentaDTO) => {
                const selected = valor === c.numeroCuenta;
                return (
                    <button
                        key={c.cuentaId}
                        type="button"
                        onClick={() => onChange(c.numeroCuenta)}
                        className={`text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                            ${selected 
                                ? 'border-ecusol-primario bg-blue-50 ring-1 ring-ecusol-primario' 
                                : 'border-gray-200 hover:border-blue-300 bg-white'}
                        `}
                    >
                        <div>
                            <p className={`text-xs font-bold uppercase ${selected ? 'text-ecusol-primario' : 'text-gray-500'}`}>
                                {c.tipoCuentaId === 1 ? 'Ahorros' : 'Corriente'}
                            </p>
                            <p className="font-mono text-sm">**** {c.numeroCuenta.slice(-4)}</p>
                        </div>
                        <div className="text-right">
                            <p className={`font-bold ${selected ? 'text-ecusol-primario' : 'text-gray-700'}`}>
                                {formatCurrency(c.saldo)}
                            </p>
                        </div>
                        {selected && <CheckCircle2 size={18} className="text-ecusol-primario absolute top-2 right-2" />}
                    </button>
                );
            })}
        </div>
    </div>
  );

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-ecusol-primario" size={40} /></div>;

  if (misCuentas.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
         <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10">
            <AlertTriangle size={40} className="mx-auto text-orange-500 mb-4"/>
            <h2 className="text-2xl font-bold text-gray-800">Sin Cuentas Activas</h2>
            <p className="text-gray-600 mb-6">No tienes cuentas con saldo disponible para transferir.</p>
            <Boton onClick={() => navigate('/app/cuentas')}>Ir a Mis Productos</Boton>
         </div>
      </div>
    );
  }
  
  // Mover la lógica de filtrado de cuentas destino FUERA del JSX
  const cuentasDestino = misCuentas.filter(c => c.numeroCuenta !== origen);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-3xl font-bold text-ecusol-primario mb-6">Zona Transaccional</h1>

      {/* TABS DE MODO */}
      <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 flex mb-8">
        <button 
            onClick={() => { setModo('PROPIAS'); setDestinatarioData(null); }}
            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${modo === 'PROPIAS' ? 'bg-ecusol-primario text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <User size={20} /> Cuentas Propias
        </button>
        <button 
            onClick={() => setModo('TERCEROS')}
            className={`flex-1 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${modo === 'TERCEROS' ? 'bg-ecusol-primario text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
            <Users size={20} /> A Terceros
        </button>
        
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
         <form onSubmit={handlePreSubmit} className="space-y-8">
            
            {/* 1. ORIGEN */}
            <SelectorCuenta 
                label="¿Desde qué cuenta deseas transferir?"
                valor={origen}
                onChange={setOrigen}
                opciones={misCuentas}
            />

            <div className="border-t border-gray-100"></div>

            {/* 2. DESTINO */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Cuenta de Destino</label>
                
                {modo === 'PROPIAS' ? (
                     // CORRECCIÓN BUG: Usar la lista de opciones de destino filtradas
                     
                     cuentasDestino.length === 0 ? (
                        <div className="p-4 bg-orange-50 text-orange-700 rounded-xl flex gap-3 border border-orange-100">
                           <AlertTriangle /> Necesitas al menos otra cuenta activa para transferir entre ellas.
                        </div>
                     ) : (
                        <SelectorCuenta 
                            label="Selecciona tu cuenta destino"
                            valor={destinoPropio}
                            onChange={setDestinoPropio}
                            opciones={cuentasDestino} // Usar la lista filtrada
                        />
                     )
                ) : (
                    // MODO TERCEROS
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
                                <input 
                                    className="w-full pl-12 p-4 border-2 border-gray-200 rounded-xl focus:border-ecusol-primario outline-none font-mono text-lg transition-all" 
                                    placeholder="Ingrese número de cuenta destino" 
                                    value={destino} 
                                    onChange={e=>{setDestino(e.target.value); setDestinatarioData(null)}}
                                />
                            </div>
                            <button 
                                type="button" 
                                onClick={handleValidar} 
                                disabled={validando || !destino}
                                className="bg-ecusol-primario text-white px-6 rounded-xl font-bold hover:bg-blue-900 disabled:opacity-50 shadow-md"
                            >
                                {validando ? <Loader2 className="animate-spin" /> : 'Validar'}
                            </button>
                        </div>

                        {destinatarioData && (
                            <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-xl flex items-center gap-4 text-green-800 animate-scale-in">
                                <div className="bg-white p-2 rounded-full shadow-sm"><CheckCircle2 size={24} className="text-green-600"/></div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-green-700">Destinatario Verificado</p>
                                    <p className="font-bold text-lg">{destinatarioData.nombreTitular}</p>
                                    <p className="text-sm opacity-80 font-mono">{destinatarioData.cedulaParcial}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* 3. MONTO Y DETALLES (Solo si cumple condiciones) */}
            {/* Se comprueba que, si es PROPIAS, haya al menos una cuenta de destino disponible */}
            {!(modo === 'PROPIAS' && cuentasDestino.length === 0) && (
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Monto</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">$</span>
                                <input type="number" step="0.01" className="w-full pl-10 p-4 text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-ecusol-primario outline-none" placeholder="0.00" value={monto} onChange={e => setMonto(e.target.value)} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
                            <input className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-ecusol-primario outline-none" placeholder="Ej: Pago Alquiler" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                        </div>
                    </div>

                    <Boton type="submit" className="w-full py-4 text-lg shadow-lg" disabled={modo === 'TERCEROS' && !destinatarioData}>
                        Continuar con la Transferencia <ArrowRight size={20} />
                    </Boton>
                </div>
            )}
         </form>
      </div>

      {/* MODAL (Sin cambios lógicos, solo visuales) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            
            {!txExitosa && !procesandoTx && (
                <div className="absolute top-4 right-4 z-10">
                    <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold transition-colors bg-white ${getColorReloj()}`}>
                        {segundos}
                    </div>
                </div>
            )}

            <div className={`p-6 text-center ${txExitosa ? 'bg-green-600' : 'bg-ecusol-primario'} text-white`}>
              <h3 className="text-xl font-bold">{txExitosa ? '¡Transferencia Exitosa!' : 'Confirmar Datos'}</h3>
            </div>

            <div className="p-8 space-y-6">
              {txExitosa ? (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-bounce-in">
                    <CheckCircle2 size={60} />
                  </div>
                  <p className="text-gray-600 text-lg">Tu dinero ha sido enviado correctamente.</p>
                  <Boton onClick={cerrarModalYLimpiar} className="w-full bg-green-600 hover:bg-green-700 py-4 text-lg">Finalizar</Boton>
                </div>
              ) : (
                <>
                  <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Desde</span>
                        <span className="font-bold text-gray-800">Cuenta **** {origen.slice(-4)}</span>
                     </div>
                     <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Para</span>
                        <div className="text-right">
                            <span className="block font-bold text-gray-800">{modo === 'PROPIAS' ? 'Cuenta Propia' : destinatarioData?.nombreTitular}</span>
                            <span className="text-xs text-gray-400 font-mono">{modo === 'PROPIAS' ? destinoPropio : destino}</span>
                        </div>
                     </div>
                     <div className="border-t border-gray-200 my-2"></div>
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500 font-medium">Monto Total</span>
                        <span className="font-bold text-3xl text-ecusol-primario">{formatCurrency(parseFloat(monto))}</span>
                     </div>
                  </div>

                  <div className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                    <Clock size={14}/> Confirma antes de que el tiempo expire
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button onClick={confirmarTransferencia} className="flex-1 py-3 rounded-xl bg-ecusol-secundario text-white font-bold hover:bg-yellow-600 shadow-lg flex justify-center items-center gap-2">
                        {procesandoTx ? <Loader2 className="animate-spin"/> : 'Confirmar Pago'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaTransferencia;