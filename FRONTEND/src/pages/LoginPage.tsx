import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginActivosLG, type LoginActivosLGCredentials } from '../components/auth/LoginActivosLG';
import { ResetPasswordModal } from '../components/auth/ResetPasswordModal';

export function LoginPage() {
  const { usuario, isLoading, login } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

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

  return (
    <>
      <LoginActivosLG
        onSubmit={handleSubmit}
        onForgotPassword={() => setShowResetModal(true)}
        errorMessage={error}
        submitting={submitting}
      />
      {showResetModal && <ResetPasswordModal onClose={() => setShowResetModal(false)} />}
    </>
  );
}
