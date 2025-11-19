// src/components/layout/FooterApp.tsx
import { LogoEcuSol } from '@/components/common/LogoEcuSol';
import { Mail, MapPin, Phone, Twitter, Linkedin, Facebook } from 'lucide-react';

export const FooterApp = () => {
  return (
      <footer className="bg-ecusol-gris-oscuro text-gray-300 pt-16 pb-8">      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <LogoEcuSol className="text-3xl !text-white" />
          <p className="text-sm mt-2">El mejor banco a tu alcance.</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-white"><Twitter size={20} /></a>
            <a href="#" className="hover:text-white"><Linkedin size={20} /></a>
            <a href="#" className="hover:text-white"><Facebook size={20} /></a>
          </div>
        </div>
        <div>
          <h5 className="font-bold text-white mb-4">Links Rápidos</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="/app/dashboard" className="hover:text-white">Principal</a></li>
            <li><a href="/app/transferir" className="hover:text-white">Transferir</a></li>
            <li><a href="/app/acerca-de" className="hover:text-white">Acerca de</a></li>
            <li><a href="/app/ayuda" className="hover:text-white">Ayuda</a></li>
          </ul>
        </div>

        <div>
          <h5 className="font-bold text-white mb-4">Servicios de Banco</h5>
          <ul className="space-y-2 text-sm">
            <li><a href="/app/transferir" className="hover:text-white">Transferir Dinero</a></li>
          </ul>
        </div>
        <div>
          <h5 className="font-bold text-white mb-4">Contacto Para Créditos</h5>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <MapPin size={16} /> Av. Patria
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} /> +593 95 161 310
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} /> creditofacil@ecuasol.com
            </li>
            <li className="mt-2">
              Lunes - Sábado: <br /> 8am - 17pm
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
        <p>© 2025 EcuSol. Todos los Derechos Reservados.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-white">Política de Privacidad</a>
          <a href="#" className="hover:text-white">Términos del Servicio</a>
          <a href="#" className="hover:text-white">Política Cookie</a>
        </div>
      </div>
    </footer>
  );
};