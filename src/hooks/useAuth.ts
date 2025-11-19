// src/hooks/useAuth.ts
import { useAuthStore } from "@/store/useAuthStore";

const useAuth = () => {
  const isAutenticado = useAuthStore((state) => state.isAutenticado);
  const usuario = useAuthStore((state) => state.usuario);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const registrar = useAuthStore((state) => state.registrar);

  return {
    isAutenticado,
    usuario,
    login,
    logout,
    registrar,
  };
};

export default useAuth;