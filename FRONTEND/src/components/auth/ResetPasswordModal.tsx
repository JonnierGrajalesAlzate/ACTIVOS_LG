import { useState, type CSSProperties, type FormEvent } from 'react';
import { resetPassword } from '../../api/auth';

export interface ResetPasswordModalProps {
  onClose: () => void;
}

const FONT_FAMILY = "'Archivo', sans-serif";

export function ResetPasswordModal({ onClose }: ResetPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('La nueva contrasena debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim(), newPassword);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contrasena.');
    } finally {
      setSubmitting(false);
    }
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11, 37, 69, 0.45)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 100,
    fontFamily: FONT_FAMILY,
  };

  const cardStyle: CSSProperties = {
    width: '100%',
    maxWidth: 380,
    background: '#ffffff',
    borderRadius: 14,
    padding: '36px 36px',
    boxShadow: '0 24px 60px rgba(11, 37, 69, 0.25)',
    margin: 16,
  };

  const titleStyle: CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#0b2545',
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 14,
    color: '#5c6b80',
    marginTop: 8,
    marginBottom: 0,
  };

  const labelStyle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#5c6b80',
    marginBottom: 8,
    display: 'block',
  };

  const inputStyle: CSSProperties = {
    height: 48,
    width: '100%',
    padding: '0 14px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#0b2545',
    background: '#f7f9fc',
    border: '1.5px solid #dfe5ec',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const fieldStyle: CSSProperties = {
    marginTop: 18,
  };

  const errorStyle: CSSProperties = {
    fontSize: 13,
    color: '#b23b3b',
    marginTop: 14,
    marginBottom: 0,
  };

  const successStyle: CSSProperties = {
    fontSize: 14,
    color: '#0b2545',
    marginTop: 18,
    lineHeight: 1.5,
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 12,
    marginTop: 26,
  };

  const submitButtonStyle: CSSProperties = {
    flex: 1,
    height: 48,
    background: '#0b2545',
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: 4,
    cursor: submitting ? 'default' : 'pointer',
    opacity: submitting ? 0.85 : 1,
  };

  const cancelButtonStyle: CSSProperties = {
    height: 48,
    padding: '0 18px',
    background: 'transparent',
    color: '#5c6b80',
    fontSize: 15,
    fontFamily: 'inherit',
    border: '1.5px solid #dfe5ec',
    borderRadius: 4,
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        {success ? (
          <>
            <h2 style={titleStyle}>Contrasena actualizada</h2>
            <p style={successStyle}>Ya puedes iniciar sesion con tu nueva contrasena.</p>
            <div style={actionsStyle}>
              <button type="button" style={submitButtonStyle} onClick={onClose}>
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 style={titleStyle}>Restablecer contrasena</h2>
            <p style={subtitleStyle}>Ingresa tu email y define una nueva contrasena.</p>

            <form onSubmit={handleSubmit}>
              <div style={fieldStyle}>
                <label htmlFor="reset-email" style={labelStyle}>
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="nombre@activoslg.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="reset-new-password" style={labelStyle}>
                  Nueva contrasena
                </label>
                <input
                  id="reset-new-password"
                  type="password"
                  placeholder="********"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={fieldStyle}>
                <label htmlFor="reset-confirm-password" style={labelStyle}>
                  Confirmar contrasena
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>

              {error && <p style={errorStyle}>{error}</p>}

              <div style={actionsStyle}>
                <button type="button" style={cancelButtonStyle} onClick={onClose}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} style={submitButtonStyle}>
                  {submitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
