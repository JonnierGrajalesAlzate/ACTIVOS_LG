import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginActivosLG, type LoginActivosLGCredentials } from '../components/auth/LoginActivosLG';

export function LoginPage() {
  const { usuario, isLoading, login } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && usuario) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/inicio';
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async ({ usuario: email, password }: LoginActivosLGCredentials) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch {
      setError('Usuario o contrasena incorrectos.');
    } finally {
      setSubmitting(false);
    }
  };

  return <LoginActivosLG onSubmit={handleSubmit} errorMessage={error} submitting={submitting} />;
}
