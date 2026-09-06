import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchMe, login as loginRequest, type Usuario } from '../api/auth';
import { AUTH_EXPIRED_EVENT } from '../api/client';
import { clearToken, getToken, setToken } from './token';

interface AuthContextValue {
  usuario: Usuario | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!getToken()) {
      setIsLoading(false);
      return;
    }

    fetchMe()
      .then((data) => {
        if (active) setUsuario(data);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onExpired = () => setUsuario(null);
    window.addEventListener(AUTH_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, onExpired);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      isLoading,
      login: async (email: string, password: string) => {
        const res = await loginRequest(email, password);
        setToken(res.token);
        setUsuario(res.usuario);
      },
      logout: () => {
        clearToken();
        setUsuario(null);
      },
    }),
    [usuario, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
