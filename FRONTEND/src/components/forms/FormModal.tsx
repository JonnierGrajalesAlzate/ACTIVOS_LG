import { useEffect, useId, type CSSProperties, type FormEvent, type ReactNode } from 'react';
import { formatCurrency, parseNumero } from '../../utils/format';
import styles from './FormModal.module.css';

// ---- Modal ----

interface FormModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSubmit: () => void;
  submitting: boolean;
  error: string | null;
  submitLabel?: string;
  wide?: boolean;
  /** Boton principal en rojo (acciones destructivas). */
  danger?: boolean;
  children: ReactNode;
}

export function FormModal({
  title,
  subtitle,
  onClose,
  onSubmit,
  submitting,
  error,
  submitLabel = 'Guardar',
  wide,
  danger,
  children,
}: FormModalProps) {
  const titleId = useId();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, submitting]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className={styles.overlay} onClick={submitting ? undefined : onClose}>
      <div
        className={`${styles.card} ${wide ? styles.wide : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} style={{ display: 'contents' }} noValidate>
          <div className={styles.head}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          <div className={styles.body}>{children}</div>

          <div className={styles.foot}>
            {error ? (
              <div className={styles.error} role="alert">
                {error}
              </div>
            ) : (
              <div className={styles.spacer} />
            )}
            <button type="button" className={styles.cancel} onClick={onClose} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={`${styles.submit} ${danger ? styles.danger : ''}`} disabled={submitting}>
              {submitting ? (danger ? 'Eliminando...' : 'Guardando...') : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Mientras se cargan los datos del registro a editar (o si fallo la carga). */
export function FormModalCargando({ title, error, onClose }: { title: string; error: string | null; onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <div className={styles.body}>
          <p className={error ? styles.error : styles.subtitle}>{error ?? 'Cargando datos...'}</p>
        </div>
        <div className={styles.foot}>
          <div className={styles.spacer} />
          <button type="button" className={styles.cancel} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export function FormSection({ title, cols = 2, children }: { title?: string; cols?: number; children: ReactNode }) {
  return (
    <fieldset className={styles.section}>
      {title && <legend className={styles.sectionTitle}>{title}</legend>}
      <div className={styles.grid} style={{ '--cols': cols } as CSSProperties}>
        {children}
      </div>
    </fieldset>
  );
}

// ---- Campos ----

interface BaseFieldProps {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  /** Ocupa toda la fila de la seccion. */
  full?: boolean;
  disabled?: boolean;
}

function FieldShell({ id, label, required, hint, full, children }: BaseFieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={`${styles.field} ${full ? styles.full : ''}`}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  );
}

interface TextFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  type?: 'text' | 'date';
}

export function TextField({ value, onChange, placeholder, maxLength, autoFocus, type = 'text', ...base }: TextFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <input
        id={id}
        type={type}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoFocus={autoFocus}
        disabled={base.disabled}
      />
    </FieldShell>
  );
}

export function DateField(props: Omit<TextFieldProps, 'type' | 'maxLength' | 'placeholder'>) {
  return <TextField {...props} type="date" />;
}

interface NumberFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
  /** Muestra debajo el valor interpretado en pesos, para confirmar lo digitado. */
  moneda?: boolean;
}

export function NumberField({ value, onChange, placeholder, suffix, moneda, hint, ...base }: NumberFieldProps) {
  const id = useId();
  const n = moneda ? parseNumero(value) : null;
  const eco = n !== null && !Number.isNaN(n) ? formatCurrency(n) : null;
  return (
    <FieldShell id={id} hint={eco ?? hint} {...base}>
      <div className={suffix ? styles.withSuffix : undefined}>
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className={styles.input}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={base.disabled}
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    </FieldShell>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Texto de la opcion vacia. */
  placeholder?: string;
}

export function SelectField({ value, onChange, options, placeholder = 'Seleccionar...', ...base }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <select
        id={id}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={base.disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TextAreaField({ value, onChange, placeholder, ...base }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} {...base}>
      <textarea
        id={id}
        className={styles.input}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={base.disabled}
      />
    </FieldShell>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  full?: boolean;
}

export function CheckboxField({ label, checked, onChange, full }: CheckboxFieldProps) {
  return (
    <label className={`${styles.check} ${full ? styles.full : ''}`}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

// ---- Previsualizacion de campos calculados ----

export function FormPreview({ items }: { items: Array<{ label: string; value: string; negative?: boolean }> }) {
  return (
    <div className={`${styles.preview} ${styles.full}`}>
      {items.map((item) => (
        <div key={item.label} className={styles.previewItem}>
          <span className={styles.previewLabel}>{item.label}</span>
          <span className={`${styles.previewValue} ${item.negative ? styles.previewNegative : ''}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
