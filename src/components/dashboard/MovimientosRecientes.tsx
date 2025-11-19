// src/components/dashboard/MovimientosRecientes.tsx
import { Movimiento } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { Tarjeta } from '../common/Tarjeta';
import { ChevronRight } from 'lucide-react';

interface ItemMovimientoProps {
  movimiento: Movimiento;
}

const ItemMovimiento: React.FC<ItemMovimientoProps> = ({ movimiento }) => {
  const esGasto = movimiento.monto < 0;
  const colorMonto = esGasto ? 'text-red-600' : 'text-green-600';
  const signo = esGasto ? '' : '+';

  return (
    <Tarjeta className="w-52 flex-shrink-0">
      <p className="font-semibold truncate">{movimiento.descripcion}</p>
      <p className="text-sm text-gray-500 mb-2">{movimiento.fecha}</p>
      <p className={`text-lg font-bold ${colorMonto}`}>
        {signo}{formatCurrency(movimiento.monto)}
      </p>
      <p className="text-xs text-gray-400 mt-1">{movimiento.categoria}</p>
    </Tarjeta>
  );
};


interface MovimientosRecientesProps {
  movimientos: Movimiento[];
}

export const MovimientosRecientes: React.FC<MovimientosRecientesProps> = ({ movimientos }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Movimientos Recientes</h2>
        <button className="text-ecusol-azul font-medium flex items-center">
          Ver todos <ChevronRight size={20} />
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {movimientos.map((mov) => (
          <ItemMovimiento key={mov.id} movimiento={mov} />
        ))}
      </div>
    </div>
  );
};