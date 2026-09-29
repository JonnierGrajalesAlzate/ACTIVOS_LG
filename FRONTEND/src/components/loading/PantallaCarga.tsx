import { useIsFetching } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import styles from './PantallaCarga.module.css';

// Retraso antes de mostrar la pantalla para que las respuestas rapidas no produzcan un parpadeo.
const RETRASO_MS = 150;

export function PantallaCarga({ pantallaCompleta = false }: { pantallaCompleta?: boolean }) {
  return (
    <div className={pantallaCompleta ? styles.fullscreen : styles.overlay} role="status" aria-live="polite">
      <div className={styles.box}>
        <span className={styles.spinner} aria-hidden="true" />
        <span className={styles.texto}>Cargando datos...</span>
      </div>
    </div>
  );
}

// Se mantiene visible mientras alguna consulta aun no tiene datos de la base de datos.
// Las recargas de consultas que ya tienen datos y las precargas (meta.segundoPlano) no la muestran.
export function CargaConsultas() {
  const cargando =
    useIsFetching({ predicate: (query) => query.state.data === undefined && !query.meta?.segundoPlano }) > 0;
  const [retrasoCumplido, setRetrasoCumplido] = useState(false);

  useEffect(() => {
    if (!cargando) return;
    const timer = setTimeout(() => setRetrasoCumplido(true), RETRASO_MS);
    return () => {
      clearTimeout(timer);
      setRetrasoCumplido(false);
    };
  }, [cargando]);

  return cargando && retrasoCumplido ? <PantallaCarga /> : null;
}
