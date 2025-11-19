import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { authService } from '@/services/authService';
import { Boton } from '@/components/common/Boton';
import { Input } from '@/components/common/Input';
import { LogoEcuSol } from '@/components/common/LogoEcuSol';
import { toast } from 'react-hot-toast'; // Importar Toast
import { Loader2 } from 'lucide-react';

const PaginaLogin = () => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  // Ya no necesitamos el estado 'error' local si usamos toast, pero lo dejo por si quieres mostrarlo en texto también
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.login);

  // Lógica para forzar mayúsculas y números
  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorLimpio = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setUsuario(valorLimpio);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 1. Llamada al backend
      const data = await authService.login(usuario, password);
      
      // 2. Guardar sesión
      setAuth(data.token, usuario);
      
      // 3. Feedback Visual (Éxito)
      toast.success(`¡Bienvenido de nuevo, ${usuario}!`, {
        icon: '👋',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // 4. Pequeña pausa para que el usuario vea el mensaje antes de irse
      setTimeout(() => {
         navigate('/app/dashboard');
      }, 1500); // 1.5 segundos de espera

    } catch (err: any) {
      // 5. Feedback Visual (Error)
      toast.error(err.message || 'Usuario o contraseña incorrectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LADO IZQUIERDO: IMAGEN/BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 bg-ecusol-primario items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="z-10 text-center text-white p-12">
          <h1 className="text-5xl font-bold mb-6">Banco EcuSol</h1>
          <p className="text-xl text-ecusol-secundario">Tu futuro financiero, sólido como el sol.</p>
        </div>
      </div>

      {/* LADO DERECHO: FORMULARIO */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-ecusol-acento">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg animate-fade-in">
          <div className="flex justify-center mb-6">
            <LogoEcuSol size={60} className="text-ecusol-primario" />
          </div>
          <h2 className="text-3xl font-bold text-ecusol-primario text-center mb-2">Bienvenido</h2>
          <p className="text-gray-500 text-center mb-8">Ingresa a tu Banca en Línea</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input 
              id="user" 
              label="Usuario" 
              value={usuario} 
              onChange={handleUserChange} // Usamos la nueva función
              placeholder="Ej: IANALVAREZ31"
              className="uppercase font-bold text-ecusol-primario tracking-wider"
            />
            <Input 
              id="pass" 
              type="password" 
              label="Contraseña" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
            />

            <Boton 
              type="submit" 
              disabled={loading} 
              className="w-full bg-ecusol-primario hover:bg-blue-900 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" /> Validando...
                </span>
              ) : 'Iniciar Sesión'}
            </Boton>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta? <span className="text-ecusol-secundario font-bold cursor-pointer hover:underline" onClick={() => navigate('/registro')}>Regístrate aquí</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;