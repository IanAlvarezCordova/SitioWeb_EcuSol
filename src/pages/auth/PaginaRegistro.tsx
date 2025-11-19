import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, RegisterData } from '@/services/authService';
import { Boton } from '@/components/common/Boton';
import { Input } from '@/components/common/Input';
import { LogoEcuSol } from '@/components/common/LogoEcuSol';
import { toast } from 'react-hot-toast';
import { UserCheck, AlertCircle } from 'lucide-react';

const PaginaRegistro = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<RegisterData>({
    cedula: '',
    nombres: '',
    apellidos: '',
    usuario: '',
    email: '',
    telefono: '',
    direccion: '',
    password: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');

  // Manejador inteligente de cambios
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    // 1. LOGICA USUARIO: Solo Mayúsculas y Números (Ej: IANALVAREZ31)
    if (id === 'usuario') {
      // Regex: Reemplaza todo lo que NO sea A-Z o 0-9 por vacío
      const limpio = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData({ ...formData, [id]: limpio });
      return;
    }

    // 2. LOGICA NOMBRES/APELLIDOS: Permitir solo letras y espacios (opcional, para limpieza)
    if (id === 'nombres' || id === 'apellidos') {
        // Solo permitimos letras y espacios para evitar símbolos raros en los nombres
        const soloLetras = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
        setFormData({ ...formData, [id]: soloLetras });
        return;
    }

    // Resto de campos normales
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- VALIDACIONES ESTRICTAS ---

    // A. Validar 2 Nombres
    const palabrasNombres = formData.nombres.trim().split(/\s+/);
    if (palabrasNombres.length < 2) {
      toast.error("Debe ingresar sus DOS nombres completos (Ej: Juan Carlos)", { icon: '✍️' });
      return;
    }

    // B. Validar 2 Apellidos
    const palabrasApellidos = formData.apellidos.trim().split(/\s+/);
    if (palabrasApellidos.length < 2) {
      toast.error("Debe ingresar sus DOS apellidos (Ej: Pérez López)", { icon: '✍️' });
      return;
    }

    // C. Validar Contraseñas
    if (formData.password !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    // D. Validar Cédula (Longitud básica)
    if (formData.cedula.length < 10) {
      toast.error("La cédula debe tener 10 dígitos");
      return;
    }

    setLoading(true);
    try {
      await authService.register(formData);
      toast.success("¡Registro Exitoso! Bienvenido a EcuSol.");
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      toast.error(err.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        <div className="text-center">
          <div className="flex justify-center">
            <LogoEcuSol size={80} className="text-ecusol-primario" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Abre tu cuenta digital
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Únete a EcuSol en menos de 3 minutos
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          
          {/* Sección: Datos Personales */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="text-ecusol-primario font-bold mb-4 flex items-center gap-2">
               <UserCheck size={20}/> Datos de Identidad
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                    id="cedula" 
                    label="Cédula de Identidad" 
                    placeholder="1700000000" 
                    value={formData.cedula} onChange={handleChange} required 
                    maxLength={10}
                />
                <div className="hidden md:block"></div> {/* Espaciador */}
                
                <Input 
                    id="nombres" 
                    label="Nombres Completos (Mínimo 2)" 
                    placeholder="Ej: Juan Carlos" 
                    value={formData.nombres} onChange={handleChange} required 
                />
                <Input 
                    id="apellidos" 
                    label="Apellidos Completos (Mínimo 2)" 
                    placeholder="Ej: Pérez López" 
                    value={formData.apellidos} onChange={handleChange} required 
                />
            </div>
          </div>

          {/* Sección: Datos de Contacto y Acceso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Input 
                id="direccion" 
                label="Dirección Domiciliaria" 
                placeholder="Av. Amazonas y Naciones Unidas" 
                value={formData.direccion} onChange={handleChange} required 
              />
              <Input 
                id="email" 
                type="email" 
                label="Correo Electrónico" 
                placeholder="juan@gmail.com" 
                value={formData.email} onChange={handleChange} required 
              />
              <Input 
                id="telefono" 
                label="Celular" 
                placeholder="0991234567" 
                value={formData.telefono} onChange={handleChange} required 
              />
            </div>

            <div className="space-y-4">
               {/* CAMPO USUARIO MODIFICADO */}
               <div>
                  <Input 
                    id="usuario" 
                    label="Login Usuario (Mayúsculas y Números)" 
                    placeholder="Ej: IANALVAREZ31" 
                    value={formData.usuario} 
                    onChange={handleChange} 
                    required 
                    className="uppercase tracking-wider font-bold text-ecusol-primario"
                  />
                  <p className="text-xs text-gray-400 mt-1 ml-1 flex items-center gap-1">
                    <AlertCircle size={12}/> Solo letras A-Z y números 0-9
                  </p>
               </div>

               <div className="border-t border-gray-200 my-2"></div>

               <Input 
                  id="password" 
                  type="password" 
                  label="Contraseña" 
                  placeholder="••••••••" 
                  value={formData.password} onChange={handleChange} required 
                />
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  label="Confirmar Contraseña" 
                  placeholder="••••••••" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
            </div>
          </div>

          <div className="pt-4">
            <Boton 
              type="submit" 
              className="w-full py-4 text-lg font-bold bg-ecusol-secundario hover:bg-yellow-600 text-white shadow-lg transform transition hover:-translate-y-1"
              disabled={loading}
            >
              {loading ? 'Verificando datos...' : 'Confirmar Registro'}
            </Boton>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-sm">
              <span className="text-gray-600">¿Ya eres cliente? </span>
              <Link to="/login" className="font-medium text-ecusol-primario hover:text-ecusol-secundario transition-colors">
                Inicia Sesión aquí
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaginaRegistro;