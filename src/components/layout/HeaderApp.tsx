// src/components/layout/HeaderApp.tsx
import React, { useState } from 'react';
import { LogoEcuSol } from '@/components/common/LogoEcuSol';
import useAuth from '@/hooks/useAuth';
import { NavLink, useNavigate } from 'react-router-dom';
import { Boton } from '@/components/common/Boton';
import { User, Menu, X } from 'lucide-react';

const enlaces = [
  { nombre: 'Principal', ruta: '/app/dashboard' },
  { nombre: 'Cuentas', ruta: '/app/cuentas' },
  { nombre: 'Transferir', ruta: '/app/transferir' },
  { nombre: 'Acerca de', ruta: '/app/acerca-de' },
  { nombre: 'Ayuda', ruta: '/app/ayuda' },
];

export const HeaderApp: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-ecusol-primario text-gray-200 w-full relative">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        <LogoEcuSol size={60} />
        
        <div className="hidden md:flex items-center space-x-6">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              className={({ isActive }) =>
                `font-medium text-gray-200 hover:text-white ${isActive ? 'text-white border-b-2 border-ecusol-secundario' : ''}`
              }
            >
              {enlace.nombre}
            </NavLink>
          ))}
        </div>
        
        <div className="hidden md:flex items-center space-x-4">
          <span className="text-gray-200 flex items-center gap-2">
            <User size={18} className="text-ecusol-secundario" />
            Bienvenid@{usuario ? `, ${usuario.split(' ')[0]}` : ''}
          </span>
          
          <Boton 
            onClick={handleLogout} 
            variante="secundario"
            className="bg-white hover:bg-gray-100"
            tamano="pequeno"
          >
            Salir
          </Boton>
        </div>

        <div className="md:hidden">
          <button onClick={() => setMenuAbierto(!menuAbierto)} className="text-white">
            {menuAbierto ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <div 
        className={`md:hidden absolute top-full left-0 w-full bg-white text-ecusol-gris-oscuro shadow-lg z-20 transition-all duration-300 ease-in-out ${menuAbierto ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
      >
        <div className="flex flex-col px-6 py-4 space-y-3">
          {enlaces.map((enlace) => (
            <NavLink
              key={enlace.ruta}
              to={enlace.ruta}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) =>
                `font-medium text-gray-600 hover:text-ecusol-primario ${isActive ? 'text-ecusol-primario' : ''}`
              }
            >
              {enlace.nombre}
            </NavLink>
          ))}
          <hr />
          <div className="flex flex-col space-y-4">
            <span className="text-gray-700 flex items-center gap-2">
              <User size={18} className="text-ecusol-primario" />
              Bienvenid@{usuario ? `, ${usuario.split(' ')[0]}` : ''}
            </span>
            <Boton onClick={handleLogout} variante="secundario" tamano="mediano" className="w-full">
              Salir
            </Boton>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderApp;