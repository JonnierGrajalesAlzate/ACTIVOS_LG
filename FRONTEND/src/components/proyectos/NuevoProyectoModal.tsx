import { useState, type CSSProperties, type FormEvent } from 'react';
import { createProyecto } from '../../api/inmuebles';

export interface NuevoProyectoModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function NuevoProyectoModal({ onClose, onCreated }: NuevoProyectoModalProps) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }

    setSubmitting(true);
    try {
      await createProyecto(nombre.trim());
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el proyecto.');
    } finally {
      setSubmitting(false);
    }
  };

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(27, 27, 43, 0.45)',
    display: 'grid',
    placeItems: 'center',
    zIndex: 100,
  };

  const cardStyle: CSSProperties = {
    width: '100%',
    maxWidth: 380,
    background: 'var(--surface)',
    borderRadius: 20,
    padding: '32px 32px',
    boxShadow: '0 24px 60px rgba(27, 27, 43, 0.25)',
    margin: 16,
  };

  const titleStyle: CSSProperties = {
    fontSize: 20,
    fontWeight: 800,
    color: 'var(--ink)',
    margin: 0,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 13.5,
    color: 'var(--ink-3)',
    marginTop: 6,
    marginBottom: 0,
  };

  const labelStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
    marginBottom: 8,
    display: 'block',
  };

  const inputStyle: CSSProperties = {
    height: 46,
    width: '100%',
    padding: '0 14px',
    fontSize: 14.5,
    fontFamily: 'inherit',
    color: 'var(--ink)',
    background: 'var(--fill)',
    border: '1.5px solid var(--line)',
    borderRadius: 10,
    outline: 'none',
    boxSizing: 'border-box',
  };

  const errorStyle: CSSProperties = {
    fontSize: 13,
    color: 'var(--danger)',
    marginTop: 14,
    marginBottom: 0,
  };

  const actionsStyle: CSSProperties = {
    display: 'flex',
    gap: 12,
    marginTop: 24,
  };

  const submitButtonStyle: CSSProperties = {
    flex: 1,
    height: 46,
    background: 'var(--accent)',
    color: '#fff',
    fontSize: 14,
    fontWeight: 700,
    fontFamily: 'inherit',
    border: 'none',
    borderRadius: 10,
    cursor: submitting ? 'default' : 'pointer',
    opacity: submitting ? 0.85 : 1,
  };

  const cancelButtonStyle: CSSProperties = {
    height: 46,
    padding: '0 18px',
    background: 'transparent',
    color: 'var(--ink-3)',
    fontSize: 14,
    fontFamily: 'inherit',
    border: '1.5px solid var(--line)',
    borderRadius: 10,
    cursor: 'pointer',
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <h2 style={titleStyle}>Registrar proyecto</h2>
        <p style={subtitleStyle}>Crea un nuevo proyecto para luego asociarle inmuebles.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginTop: 20 }}>
            <label htmlFor="proyecto-nombre" style={labelStyle}>
              Nombre del proyecto
            </label>
            <input
              id="proyecto-nombre"
              type="text"
              placeholder="Ej. TORRE CENTRAL"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={inputStyle}
              autoFocus
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
      </div>
    </div>
  );
}
