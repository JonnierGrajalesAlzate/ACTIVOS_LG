import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { PantallaCarga } from '../components/loading/PantallaCarga';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { usuario, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <PantallaCarga pantallaCompleta />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
