import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bancaService } from '@/services/bancaService';
import { CuentaDTO, DestinatarioDTO } from '@/types';
import { Boton } from '@/components/common/Boton';
import { Input } from '@/components/common/Input';
import { formatCurrency } from '@/utils/formatters';
import { CheckCircle2, User, Users, Loader2, Wallet, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PaginaTransferencia = () => {
  const navigate = useNavigate();
  
  // Datos
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
  
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [procesandoTx, setProcesandoTx] = useState(false); 
  const [txExitosa, setTxExitosa] = useState(false);

  // CARGA Y FILTRADO DE CUENTAS
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await bancaService.getMisCuentas();
        
        // --- FILTRO CLAVE: SOLO CUENTAS ACTIVAS ---
        const activas = data.filter(c => c.estado === 'ACTIVA');
        setMisCuentas(activas);

        if(activas.length > 0) {
          setOrigen(activas[0].numeroCuenta);
          if(activas.length > 1) setDestinoPropio(activas[1].numeroCuenta);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // --- VALIDACIONES Y LÓGICA ---
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
    if (!monto || parseFloat(monto) <= 0) {
      toast.error("Ingrese un monto válido");
      return;
    }
    if (modo === 'TERCEROS' && !destinatarioData) {
      toast.error("Valide la cuenta destino primero");
      return;
    }
    if (modo === 'PROPIAS' && origen === destinoPropio) {
      toast.error("La cuenta origen y destino no pueden ser la misma");
      return;
    }
    setShowModal(true);
    setTxExitosa(false);
  };

  const confirmarTransferencia = async () => {
    setProcesandoTx(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); 

    try {
      const cuentaDestinoFinal = modo === 'PROPIAS' ? destinoPropio : destino;
      
      await bancaService.transferir({
        cuentaOrigen: origen,
        cuentaDestino: cuentaDestinoFinal,
        monto: parseFloat(monto),
        descripcion: descripcion || "Transferencia EcuSol"
      });
      
      setTxExitosa(true);
      // Recargar para actualizar saldos
      const data = await bancaService.getMisCuentas();
      setMisCuentas(data.filter(c => c.estado === 'ACTIVA'));
      
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
      setMonto('');
      setDescripcion('');
      setDestino('');
      setDestinatarioData(null);
      setTxExitosa(false);
    }
  };

  const getNombreCuenta = (num: string) => {
    const c = misCuentas.find(x => x.numeroCuenta === num);
    return c ? `Mis Ahorros - ${c.numeroCuenta.slice(-4)}` : num;
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-ecusol-primario" size={40} /></div>;

  // === VISTA DE BLOQUEO: SI NO HAY CUENTAS ACTIVAS ===
  if (misCuentas.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-10 shadow-sm">
          <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No puedes realizar transferencias</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            No detectamos ninguna <strong>cuenta activa</strong> con saldo disponible. 
            Si acabas de solicitar una cuenta, espera a que sea aprobada por un administrador.
          </p>
          <Boton onClick={() => navigate('/app/cuentas')} icono={<Wallet />}>
            Ir a Mis Productos
          </Boton>
        </div>
      </div>
    );
  }

  // === VISTA NORMAL: FORMULARIO DE TRANSFERENCIA ===
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-ecusol-primario mb-6">Realizar Transferencia</h1>

      {/* TABS */}
      <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
        <button 
          onClick={() => { setModo('PROPIAS'); setDestinatarioData(null); }}
          className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${modo === 'PROPIAS' ? 'bg-white text-ecusol-primario shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <User size={20} /> Entre mis cuentas
        </button>
        <button 
          onClick={() => setModo('TERCEROS')}
          className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${modo === 'TERCEROS' ? 'bg-white text-ecusol-primario shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Users size={20} /> A otras cuentas
        </button>
      </div>
      
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
        <form onSubmit={handlePreSubmit} className="space-y-6">
          
          {/* 1. ORIGEN (Solo cuentas ACTIVAS) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta de Origen</label>
            <select 
              className="w-full p-4 border border-gray-200 bg-gray-50 rounded-xl focus:ring-2 focus:ring-ecusol-primario outline-none"
              value={origen}
              onChange={e => setOrigen(e.target.value)}
            >
              {misCuentas.map(c => (
                <option key={c.cuentaId} value={c.numeroCuenta}>
                  {c.tipoTexto || 'Ahorros'} •••• {c.numeroCuenta.slice(-4)} (Disp: {formatCurrency(c.saldo)})
                </option>
              ))}
            </select>
          </div>

          {/* 2. DESTINO */}
          {modo === 'PROPIAS' ? (
             // Modo Propias: Si solo tiene 1 cuenta activa, mostrar aviso
             misCuentas.length < 2 ? (
                <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-center gap-3">
                   <AlertTriangle size={20}/>
                   Solo tienes una cuenta activa. Para transferir entre cuentas propias necesitas al menos dos.
                </div>
             ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Destino (Propia)</label>
                  <select 
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ecusol-primario outline-none"
                    value={destinoPropio}
                    onChange={e => setDestinoPropio(e.target.value)}
                  >
                    {misCuentas
                      .filter(c => c.numeroCuenta !== origen)
                      .map(c => (
                      <option key={c.cuentaId} value={c.numeroCuenta}>
                        {c.tipoTexto || 'Ahorros'} •••• {c.numeroCuenta.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>
             )
          ) : (
            // Modo Terceros
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cuenta Destino (Terceros)</label>
              <div className="flex gap-3">
                <input 
                  type="text"
                  className="flex-1 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-ecusol-primario outline-none"
                  placeholder="Ingrese el número de cuenta"
                  value={destino}
                  onChange={e => { setDestino(e.target.value); setDestinatarioData(null); }}
                />
                <button 
                  type="button"
                  onClick={handleValidar}
                  disabled={validando || !destino}
                  className="bg-ecusol-primario text-white px-6 rounded-xl hover:bg-blue-900 transition-colors font-medium disabled:opacity-50"
                >
                  {validando ? <Loader2 className="animate-spin" /> : 'Validar'}
                </button>
              </div>

              {destinatarioData && (
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex items-center gap-4 text-green-800 animate-scale-in">
                  <div className="bg-green-200 p-2 rounded-full"><CheckCircle2 size={20} /></div>
                  <div>
                    <p className="text-xs text-green-600 uppercase font-bold tracking-wider">Cuenta Verificada</p>
                    <p className="font-bold text-lg">{destinatarioData.nombreTitular}</p>
                    <p className="text-sm opacity-80">C.I. {destinatarioData.cedulaParcial}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. MONTO Y BOTÓN (Se oculta si en PROPIAS solo hay 1 cuenta) */}
          {!(modo === 'PROPIAS' && misCuentas.length < 2) && (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                <Input 
                    id="monto"
                    label="Monto a Transferir"
                    type="number"
                    placeholder="0.00"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                />
                <Input 
                    id="desc"
                    label="Motivo / Descripción"
                    placeholder="Ej: Pago cena"
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                />
                </div>

                <Boton 
                type="submit" 
                className="w-full py-4 text-lg bg-ecusol-secundario hover:bg-yellow-600 text-white shadow-lg transform hover:-translate-y-1 transition-all"
                disabled={modo === 'TERCEROS' && !destinatarioData}
                >
                Continuar con la Transferencia
                </Boton>
            </>
          )}
        </form>
      </div>

      {/* === MODAL (Sin Cambios, reusamos la lógica anterior) === */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className={`p-6 text-center ${txExitosa ? 'bg-green-600' : 'bg-ecusol-primario'} text-white`}>
              <h3 className="text-xl font-bold">
                {txExitosa ? '¡Transferencia Exitosa!' : 'Confirmar Transferencia'}
              </h3>
              {!txExitosa && <p className="text-blue-200 text-sm mt-1">Verifique los datos antes de continuar</p>}
            </div>

            <div className="p-8 space-y-6">
              {txExitosa ? (
                <div className="text-center space-y-4 animate-scale-in">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={40} />
                  </div>
                  <p className="text-gray-600">Su dinero ha sido enviado correctamente.</p>
                  <Boton onClick={cerrarModalYLimpiar} className="w-full bg-green-600 hover:bg-green-700">
                    Entendido, finalizar
                  </Boton>
                </div>
              ) : (
                <>
                  <div className="space-y-4 text-sm">
                     <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Cuenta Origen</span>
                      <span className="font-bold text-gray-800">•••• {origen.slice(-4)}</span>
                    </div>
                    <div className="flex justify-between border-b border-gray-100 pb-2 items-center">
                      <span className="text-gray-500">Monto Total</span>
                      <span className="font-bold text-2xl text-ecusol-primario">{formatCurrency(parseFloat(monto))}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50">Cancelar</button>
                    <button 
                        onClick={confirmarTransferencia} 
                        className="flex-1 py-3 rounded-xl bg-ecusol-secundario text-white font-bold hover:bg-yellow-600 shadow-md flex justify-center items-center gap-2"
                    >
                        {procesandoTx ? <Loader2 className="animate-spin"/> : 'Confirmar'}
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