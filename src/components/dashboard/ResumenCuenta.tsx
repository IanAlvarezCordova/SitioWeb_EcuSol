import { Tarjeta } from '@/components/common/Tarjeta';
import { formatCurrency } from '@/utils/formatters';
import { CuentaDTO } from '@/types'; // Usamos el nuevo tipo
import { ArrowRightLeft, CreditCard, FileText, PlusCircle, Eye, EyeOff, Wallet } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ResumenCuentaProps {
  cuenta: CuentaDTO;
}

export const ResumenCuenta: React.FC<ResumenCuentaProps> = ({ cuenta }) => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Helper para iconos
  const IconoBotonAccion: React.FC<{ icono: React.ReactElement, etiqueta: string, onClick?: () => void }> = ({ icono, etiqueta, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center text-gray-600 hover:text-ecusol-primario transition-colors">
      <div className="p-3 bg-gray-50 rounded-full mb-1 hover:bg-blue-50">
        {React.cloneElement(icono, { size: 20 })}
      </div>
      <span className="text-xs font-medium">{etiqueta}</span>
    </button>
  );

  return (
    <Tarjeta className="w-full border border-gray-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-50 rounded-lg text-ecusol-primario">
             <Wallet size={20} />
           </div>
           <div>
             <h3 className="text-sm font-bold text-gray-700 uppercase">Cuenta {cuenta.tipoCuentaId === 1 ? 'Ahorros' : 'Corriente'}</h3>
             <span className="text-xs text-gray-500">**** {cuenta.numeroCuenta.slice(-4)}</span>
           </div>
        </div>
        <span className={`px-2 py-1 rounded text-[10px] font-bold ${cuenta.estado === 'ACTIVA' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
            {cuenta.estado}
        </span>
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl font-bold text-ecusol-primario">
          {visible ? formatCurrency(cuenta.saldo) : '$ ****.**'}
        </span>
        <button onClick={() => setVisible(!visible)} className="text-gray-400 hover:text-ecusol-secundario">
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 border-t border-gray-50 pt-4">
        <IconoBotonAccion icono={<ArrowRightLeft />} etiqueta="Transferir" onClick={() => navigate('/app/transferir')} />
        <IconoBotonAccion icono={<CreditCard />} etiqueta="Pagar" />
        <IconoBotonAccion icono={<FileText />} etiqueta="Historial" onClick={() => navigate(`/app/cuentas/${cuenta.numeroCuenta}`)} />
        <IconoBotonAccion icono={<PlusCircle />} etiqueta="Más" />
      </div>
    </Tarjeta>
  );
};