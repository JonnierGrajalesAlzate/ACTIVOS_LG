import { useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { fetchProyectos } from '../../api/inmuebles';
import styles from './SelectFiltro.module.css';

interface SelectFiltroProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  /** Texto de la opcion vacia ("Todos..."). */
  todos: string;
  /** Botones junto al selector (p. ej. editar lo seleccionado). */
  children?: ReactNode;
}

export function SelectFiltro({ label, value, onChange, options, todos, children }: SelectFiltroProps) {
  return (
    <div className={styles.filter}>
      <label className={styles.filter}>
        <span className={styles.label}>{label}</span>
        <select className={styles.select} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">{todos}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {children}
    </div>
  );
}

/** Boton de texto para acompanar un filtro ("Editar", "Eliminar"...). */
export function FiltroBoton({ onClick, danger, children }: { onClick: () => void; danger?: boolean; children: ReactNode }) {
  return (
    <button type="button" className={`${styles.linkBtn} ${danger ? styles.linkBtnDanger : ''}`} onClick={onClick}>
      {children}
    </button>
  );
}

/** Selector de proyecto con el catalogo compartido ['proyectos']. `value` vacio = todos. */
export function ProyectoFiltro({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { data: proyectos } = useQuery({ queryKey: ['proyectos'], queryFn: fetchProyectos });
  return (
    <SelectFiltro
      label="Proyecto"
      value={value}
      onChange={onChange}
      todos="Todos los proyectos"
      options={(proyectos ?? []).map((p) => ({ value: String(p.id), label: p.nombre }))}
    />
  );
}

export function FiltrosBar({ children }: { children: ReactNode }) {
  return <div className={styles.bar}>{children}</div>;
}
