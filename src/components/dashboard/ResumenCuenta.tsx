// src/components/dashboard/ResumenCuenta.tsx
import { Tarjeta } from '@/components/common/Tarjeta';
import { formatCurrency } from '@/utils/formatters';
import { Cuenta } from '@/types';
import { ArrowRightLeft, CreditCard, FileText, PlusCircle, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ResumenCuentaProps {
  cuenta: Cuenta;
}

export const ResumenCuenta: React.FC<ResumenCuentaProps> = ({ cuenta }) => {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const IconoBotonAccion: React.FC<{ icono: React.ReactElement, etiqueta: string, onClick?: () => void }> = ({ icono, etiqueta, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center text-gray-600 hover:text-ecusol-azul">
      <div className="p-3 bg-gray-100 rounded-full">
        {React.cloneElement(icono, { size: 24 })}
      </div>
      <span className="text-xs mt-1">{etiqueta}</span>
    </button>
  );

  return (
    <Tarjeta className="w-full max-w-sm flex-shrink-0">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{cuenta.tipo}</h3>
        <span className="text-sm text-gray-500">**** {cuenta.numeroCorto}</span>
      </div>
      
      <div className="flex items-center gap-4 mb-6">
        <span className="text-3xl font-bold">
          {visible ? formatCurrency(cuenta.saldo) : '$ * * * * . * *'}
        </span>
        <button onClick={() => setVisible(!visible)} className="text-gray-500">
          {visible ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <IconoBotonAccion 
          icono={<ArrowRightLeft />} 
          etiqueta="Transferir" 
          onClick={() => navigate('/app/transferir')} 
        />
        <IconoBotonAccion 
          icono={<CreditCard />} 
          etiqueta="Pagar" 
          onClick={() => navigate('/app/pagar-servicios')}
        />
        <IconoBotonAccion 
          icono={<FileText />} 
          etiqueta="Estado" 
        />
        <IconoBotonAccion 
          icono={<PlusCircle />} 
          etiqueta="Nuevo" 
        />
      </div>
    </Tarjeta>
  );
};