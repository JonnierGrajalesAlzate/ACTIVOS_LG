import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CircleDashed, Layers } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteEtapa, fetchEtapas, SIN_ETAPA, type EtapaResumen } from '../api/inmuebles';
import { usePermisos } from '../auth/permisos';
import { ProjectCard, SectionTitle } from '../components/cards/Cards';
import { ConfirmarEliminar } from '../components/crud/ConfirmarEliminar';
import { RowActions } from '../components/crud/RowActions';
import { useCrud } from '../components/crud/useCrud';
import { FiltroBoton } from '../components/filters/SelectFiltro';
import { EtapaModal } from '../components/proyectos/EtapaModal';
import { Header } from '../components/layout/Header';
import { formatCurrencyCompact } from '../utils/format';
import styles from './InicioPage.module.css';

// Paso intermedio entre Inicio y el inventario para proyectos con etapas:
// una tarjeta por etapa, cada una abre Inmuebles ya filtrado.
export function ProyectoEtapasPage() {
  const navigate = useNavigate();
  const proyectoId = Number(useParams().id);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['etapas', proyectoId],
    queryFn: () => fetchEtapas(proyectoId),
    enabled: Number.isFinite(proyectoId),
  });
  const { esAdmin } = usePermisos();
  const crud = useCrud<EtapaResumen>();
  const { modal } = crud;

  const verInmuebles = (etapaId?: number) =>
    navigate(`/inmuebles?proyecto=${proyectoId}${etapaId !== undefined ? `&etapa=${etapaId}` : ''}`);

  const etapas = data?.etapas ?? [];
  const total = etapas.reduce(
    (acc, e) => ({
      inmuebles: acc.inmuebles + e.inmuebles,
      arrendados: acc.arrendados + e.arrendados,
      canon: acc.canon + e.canonMensual,
    }),
    { inmuebles: 0, arrendados: 0, canon: 0 },
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => navigate('/inicio')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--accent)',
          fontSize: 13,
          fontWeight: 700,
          padding: 0,
          marginBottom: 12,
        }}
      >
        <ArrowLeft size={16} strokeWidth={2.2} />
        Volver a proyectos
      </button>

      <Header
        meta={{
          title: data?.nombre ?? 'Proyecto',
          subtitle: 'Etapas del proyecto',
          actionLabel: 'Ver todo el proyecto',
        }}
        onAction={() => verInmuebles()}
      />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar las etapas del proyecto.</div>
      ) : (
        <>
          {modal?.tipo === 'crear' && <EtapaModal proyectoId={proyectoId} proyectoNombre={data?.nombre} onClose={crud.cerrar} />}
          {modal?.tipo === 'editar' && (
            <EtapaModal
              proyectoId={proyectoId}
              proyectoNombre={data?.nombre}
              existente={{ id: modal.fila.id, nombre: modal.fila.nombre }}
              onClose={crud.cerrar}
            />
          )}
          {modal?.tipo === 'eliminar' && (
            <ConfirmarEliminar
              objeto={`la etapa ${modal.fila.nombre}`}
              detalle={
                modal.fila.inmuebles > 0
                  ? `Tiene ${modal.fila.inmuebles} inmueble(s): asignalos a otra etapa primero.`
                  : undefined
              }
              eliminar={() => deleteEtapa(modal.fila.id)}
              onClose={crud.cerrar}
            />
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
            <SectionTitle>Etapas</SectionTitle>
            {esAdmin && <FiltroBoton onClick={crud.crear}>+ Agregar etapa</FiltroBoton>}
          </div>
          <div className={styles.projectsGrid}>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => <div key={`esk-${i}`} className={styles.projectSkeleton} />)}

            {!isLoading &&
              etapas.map((e) => (
                <ProjectCard
                  key={e.id}
                  nombre={e.nombre}
                  icon={e.id === SIN_ETAPA ? CircleDashed : Layers}
                  inmuebles={e.inmuebles}
                  arrendados={e.arrendados}
                  ocupacionPorcentaje={e.ocupacionPorcentaje}
                  canonMensual={formatCurrencyCompact(e.canonMensual)}
                  onClick={() => verInmuebles(e.id)}
                  actions={
                    e.id === SIN_ETAPA ? undefined : (
                      <RowActions soloAdmin label={e.nombre} onEdit={() => crud.editar(e)} onDelete={() => crud.eliminar(e)} />
                    )
                  }
                />
              ))}

            {!isLoading && etapas.length > 0 && (
              <ProjectCard
                nombre="Todo el proyecto"
                inmuebles={total.inmuebles}
                arrendados={total.arrendados}
                ocupacionPorcentaje={
                  total.inmuebles === 0 ? 0 : Math.round((total.arrendados * 1000) / total.inmuebles) / 10
                }
                canonMensual={formatCurrencyCompact(total.canon)}
                onClick={() => verInmuebles()}
              />
            )}

            {!isLoading && etapas.length === 0 && (
              <div className={styles.emptyState}>Este proyecto no tiene etapas registradas.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
