import { useEffect, useState, type CSSProperties, type FormEvent, type MouseEvent } from 'react';
import logoUrl from '../../assets/logo.png';
import AnimatedGradient, { type GradientConfig } from '../ui/animated-gradient';

export interface LoginActivosLGCredentials {
  usuario: string;
  password: string;
}

export interface LoginActivosLGProps {
  onSubmit?: (credentials: LoginActivosLGCredentials) => void;
  onForgotPassword?: () => void;
  errorMessage?: string | null;
  submitting?: boolean;
}

const FONT_FAMILY = "'Archivo', sans-serif";

// Constantes a nivel de modulo: AnimatedGradient reconstruye el contexto WebGL si cambia la referencia de config.
const GRADIENT_CONFIG: GradientConfig = { preset: 'Prism' };
const GRADIENT_CONFIG_STATIC: GradientConfig = { preset: 'Prism', speed: 0 };

const KEYFRAMES = `
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-7px); }
}
`;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

function fadeUp(delay: number, reduced: boolean, duration = 0.9, easing = 'cubic-bezier(0.22, 0.8, 0.3, 1)'): CSSProperties {
  if (reduced) return {};
  return { animation: `fadeUp ${duration}s ${easing} ${delay}s both` };
}

export function LoginActivosLG({ onSubmit, onForgotPassword, errorMessage, submitting }: LoginActivosLGProps) {
  const reduced = useReducedMotion();
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<'usuario' | 'password' | null>(null);
  const [linkHover, setLinkHover] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toggleHover, setToggleHover] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.({ usuario, password });
  };

  const handleForgotClick = (e: MouseEvent) => {
    e.preventDefault();
    onForgotPassword?.();
  };

  const pageWrapStyle: CSSProperties = {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    background: '#f7f9fc',
    fontFamily: FONT_FAMILY,
  };

  const cardStyle: CSSProperties = {
    width: '100vw',
    height: '100vh',
    display: 'grid',
    gridTemplateColumns: '1.02fr 0.98fr',
    overflow: 'hidden',
    background: '#fff',
  };

  const leftPanelStyle: CSSProperties = {
    // Fondo solido de respaldo si el navegador no soporta WebGL2.
    background: '#050505',
    position: 'relative',
    isolation: 'isolate',
    overflow: 'hidden',
    padding: '0 68px',
    display: 'flex',
    alignItems: 'center',
  };

  const contentColumnStyle: CSSProperties = {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    gap: 26,
  };

  const logoWrapAnimation = [fadeUp(0, reduced).animation, reduced ? null : 'float 6s ease-in-out infinite']
    .filter(Boolean)
    .join(', ');

  const logoWrapStyle: CSSProperties = {
    display: 'inline-flex',
    ...(logoWrapAnimation ? { animation: logoWrapAnimation } : {}),
  };

  const logoImgStyle: CSSProperties = {
    height: 110,
    width: 'auto',
    display: 'block',
    objectFit: 'contain',
  };

  const wordmarkWrapStyle: CSSProperties = fadeUp(0.12, reduced);

  const wordmarkStyle: CSSProperties = {
    fontSize: 40,
    fontWeight: 800,
    letterSpacing: '0.02em',
    color: '#ffffff',
    margin: 0,
  };

  const subCopyStyle: CSSProperties = {
    fontSize: 17,
    color: '#a9c0d8',
    maxWidth: 340,
    marginTop: 10,
    lineHeight: 1.5,
  };

  const rightPanelStyle: CSSProperties = {
    background: '#f7f9fc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 56px',
  };

  const formCardStyle: CSSProperties = {
    width: '100%',
    maxWidth: 400,
    background: '#ffffff',
    borderRadius: 14,
    padding: '48px 44px',
    boxShadow: '0 20px 50px rgba(11, 37, 69, 0.10)',
    border: '1px solid #eef1f6',
    display: 'flex',
    flexDirection: 'column',
  };

  const titleBlockStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    ...fadeUp(0.18, reduced, 0.7, 'ease-out'),
  };

  const titleStyle: CSSProperties = {
    fontSize: 27,
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: '#0b2545',
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 14.5,
    color: '#5c6b80',
    margin: 0,
  };

  const errorStyle: CSSProperties = {
    fontSize: 13,
    color: '#b23b3b',
    margin: 0,
  };

  const formStyle: CSSProperties = {
    marginTop: 34,
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
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

  const fieldWrapStyle = (delay: number): CSSProperties => ({
    ...fadeUp(delay, reduced, 0.7, 'ease-out'),
  });

  const inputStyle = (focused: boolean, withToggle = false): CSSProperties => ({
    height: 52,
    width: '100%',
    padding: withToggle ? '0 44px 0 16px' : '0 16px',
    fontSize: 15,
    fontFamily: 'inherit',
    color: '#0b2545',
    background: focused ? '#ffffff' : '#f7f9fc',
    border: focused ? '1.5px solid #0f86d6' : '1.5px solid #dfe5ec',
    borderRadius: 4,
    outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focused ? '0 0 0 4px rgba(15, 134, 214, 0.14)' : 'none',
    transition: 'border-color .22s, box-shadow .22s, background .22s',
  });

  const inputWrapStyle: CSSProperties = {
    position: 'relative',
  };

  const toggleButtonStyle: CSSProperties = {
    position: 'absolute',
    right: 0,
    top: 0,
    height: 52,
    width: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    color: toggleHover ? '#0b2545' : '#5c6b80',
    transition: 'color .18s',
  };

  const forgotWrapStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    ...fadeUp(0.42, reduced, 0.7, 'ease-out'),
  };

  const forgotLinkStyle: CSSProperties = {
    fontSize: 14,
    color: '#0f86d6',
    fontWeight: 500,
    textDecoration: linkHover ? 'underline' : 'none',
    cursor: 'pointer',
  };

  const submitStyle: CSSProperties = {
    height: 54,
    width: '100%',
    background: buttonHover && !submitting ? '#0f86d6' : '#0b2545',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: 4,
    cursor: submitting ? 'default' : 'pointer',
    opacity: submitting ? 0.85 : 1,
    transform: buttonHover && !submitting ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: buttonHover && !submitting ? '0 14px 26px rgba(15, 134, 214, 0.32)' : 'none',
    transition: 'background .24s, transform .24s, box-shadow .24s',
    ...fadeUp(0.5, reduced, 0.7, 'ease-out'),
  };

  return (
    <div style={pageWrapStyle}>
      <style>{KEYFRAMES}</style>

      <div style={cardStyle}>
        <div style={leftPanelStyle}>
          <AnimatedGradient config={reduced ? GRADIENT_CONFIG_STATIC : GRADIENT_CONFIG} />

          <div style={contentColumnStyle}>
            <div style={logoWrapStyle}>
              <img src={logoUrl} alt="Activos LG" style={logoImgStyle} />
            </div>

            <div style={wordmarkWrapStyle}>
              <h1 style={wordmarkStyle}>
                <span>ACTIVOS </span>
                <span style={{ color: '#4fb1ee' }}>LG</span>
              </h1>
              <p style={subCopyStyle}>Bienvenidos a la gerencia de proyectos</p>
            </div>
          </div>
        </div>

        <div style={rightPanelStyle}>
          <div style={formCardStyle}>
            <div style={titleBlockStyle}>
              <h2 style={titleStyle}>Iniciar sesion</h2>
              <p style={subtitleStyle}>Ingresa con tus credenciales corporativas.</p>
              {errorMessage && <p style={errorStyle}>{errorMessage}</p>}
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>
            <div style={fieldWrapStyle(0.26)}>
              <label htmlFor="login-usuario" style={labelStyle}>
                Usuario
              </label>
              <input
                id="login-usuario"
                type="text"
                placeholder="nombre.apellido"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onFocus={() => setFocusedField('usuario')}
                onBlur={() => setFocusedField(null)}
                style={inputStyle(focusedField === 'usuario')}
              />
            </div>

            <div style={fieldWrapStyle(0.34)}>
              <label htmlFor="login-password" style={labelStyle}>
                Contrasena
              </label>
              <div style={inputWrapStyle}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={inputStyle(focusedField === 'password', true)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  onMouseEnter={() => setToggleHover(true)}
                  onMouseLeave={() => setToggleHover(false)}
                  aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  aria-pressed={showPassword}
                  style={toggleButtonStyle}
                >
                  {showPassword ? (
                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.36 5.32A9.77 9.77 0 0112 5c5 0 9 4.5 10 7-.42 1.08-1.2 2.36-2.3 3.53M6.5 6.64C4.36 8 2.9 9.9 2 12c1 2.5 5 7 10 7 1.4 0 2.72-.32 3.9-.86"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width={19} height={19} viewBox="0 0 24 24" fill="none">
                      <path
                        d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7s-9-4.5-10-7z"
                        stroke="currentColor"
                        strokeWidth={1.7}
                        strokeLinejoin="round"
                      />
                      <circle cx={12} cy={12} r={3} stroke="currentColor" strokeWidth={1.7} />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={forgotWrapStyle}>
              <a
                href="#"
                onClick={handleForgotClick}
                onMouseEnter={() => setLinkHover(true)}
                onMouseLeave={() => setLinkHover(false)}
                style={forgotLinkStyle}
              >
                Olvide mi contrasena
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              onMouseEnter={() => setButtonHover(true)}
              onMouseLeave={() => setButtonHover(false)}
              style={submitStyle}
            >
              {submitting ? 'Ingresando...' : 'Ingresar'}
            </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
