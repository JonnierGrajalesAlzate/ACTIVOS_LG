import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, DoorOpen, Landmark, PieChart, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATALOGOS_KEY, type Catalogos } from '../api/catalogos';
import { deleteProyecto, type Proyecto } from '../api/inmuebles';
import { fetchResumen, type OcupacionProyecto } from '../api/resumen';
import { usePermisos } from '../auth/permisos';
import { ProjectCard, SectionTitle } from '../components/cards/Cards';
import { ConfirmarEliminar } from '../components/crud/ConfirmarEliminar';
import { RowActions } from '../components/crud/RowActions';
import { useCrud } from '../components/crud/useCrud';
import { OccupancyRing } from '../components/charts/OccupancyRing';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/kpi/StatCard';
import { ProgressBar } from '../components/progress/ProgressBar';
import { ProyectoModal } from '../components/proyectos/ProyectoModal';
import { pageMeta } from '../nav/navConfig';
import styles from './InicioPage.module.css';
import { formatArea, formatCurrencyCompact } from '../utils/format';
import { occupancyColor } from '../utils/colors';
import { matchesSearch } from '../utils/text';

export function InicioPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['resumen'], queryFn: fetchResumen });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const crud = useCrud<OcupacionProyecto>();
  const { modal } = crud;
  const [search, setSearch] = useState('');
  const { esAdmin } = usePermisos();
  const k = data?.kpis;
  const ocupacion = k?.ocupacionPorcentaje ?? 0;
  const ocupacionTone = occupancyColor(ocupacion);

  const proyectos = data?.ocupacionPorProyecto ?? [];
  const proyectosFiltrados = proyectos.filter((p) => matchesSearch(p.proyecto, search));

  return (
    <div>
      <Header
        meta={pageMeta.inicio}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar proyecto..."
        onAction={esAdmin ? crud.crear : undefined}
      />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudo cargar el resumen del portafolio.</div>
      ) : (
        <>
          <SectionTitle>Proyectos</SectionTitle>
          <div className={styles.projectsGrid}>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <div key={`psk-${i}`} className={styles.projectSkeleton} />)}
            {!isLoading &&
              proyectosFiltrados.map((p) => (
                <ProjectCard
                  key={p.id}
                  nombre={p.proyecto}
                  inmuebles={p.inmuebles}
                  arrendados={p.arrendados}
                  ocupacionPorcentaje={p.ocupacionPorcentaje}
                  canonMensual={formatCurrencyCompact(p.canonMensual)}
                  onClick={() =>
                    navigate(p.etapas > 0 ? `/inicio/proyectos/${p.id}` : `/inmuebles?proyecto=${p.id}`)
                  }
                  actions={
                    <RowActions soloAdmin label={p.proyecto} onEdit={() => crud.editar(p)} onDelete={() => crud.eliminar(p)} />
                  }
                />
              ))}
            {!isLoading && proyectos.length === 0 && (
              <div className={styles.emptyState}>Aun no hay proyectos registrados.</div>
            )}
            {!isLoading && proyectos.length > 0 && proyectosFiltrados.length === 0 && (
              <div className={styles.emptyState}>Ningun proyecto coincide con "{search}".</div>
            )}
          </div>

          <SectionTitle>Indicadores del portafolio</SectionTitle>
          <div className={styles.kpiGrid}>
            <StatCard
              icon={Landmark}
              label="Valor del portafolio"
              tone="accent"
              value={formatCurrencyCompact(k?.valorPortafolio ?? 0)}
              help={`Valor comercial de ${k?.totalInmuebles ?? 0} inmuebles`}
            />
            <StatCard
              icon={Banknote}
              label="Canon mensual"
              tone="accent"
              value={formatCurrencyCompact(k?.canonMensual ?? 0)}
              help={`${k?.arrendados ?? 0} inmuebles arrendados`}
            />
            <StatCard
              icon={Receipt}
              label="Egresos mensuales"
              tone="warn"
              value={formatCurrencyCompact(k?.egresosMensuales ?? 0)}
              help={`EBITDA ${formatCurrencyCompact(k?.ebitdaMensual ?? 0)}`}
            />
            <StatCard
              icon={PieChart}
              label="Ocupacion"
              tone="accent"
              value={`${ocupacion}%`}
              help={`${k?.arrendados ?? 0} de ${k?.totalInmuebles ?? 0} predios`}
            >
              <ProgressBar value={ocupacion} height={6} color={ocupacionTone} />
            </StatCard>
            <StatCard
              icon={DoorOpen}
              label="Disponibles"
              tone={(k?.disponibles ?? 0) > 0 ? 'danger' : 'ok'}
              value={k?.disponibles ?? 0}
              help={`de ${k?.totalInmuebles ?? 0} predios · ${formatArea(k?.areaTotalM2 ?? 0)}`}
            />
          </div>

          <div className={styles.occupancyWrap}>
            <div className={styles.panel}>
              <SectionTitle>Ocupacion del portafolio</SectionTitle>

              <div className={styles.ringWrap}>
                <OccupancyRing percentage={ocupacion} color={ocupacionTone} />
                <div className={styles.ringLegend}>
                  <span className={styles.legendItem}>
                    <i className={styles.legendDot} style={{ background: ocupacionTone }} />
                    {k?.arrendados ?? 0} arrendados
                  </span>
                  <span className={styles.legendItem}>
                    <i className={styles.legendDot} style={{ background: 'var(--line-2)' }} />
                    {k?.disponibles ?? 0} disponibles
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {modal?.tipo === 'crear' && (
        <ProyectoModal
          onClose={crud.cerrar}
          // Un proyecto nuevo esta vacio: se pasa directo a registrar su primer inmueble.
          onCreated={(proyecto) => {
            // Se agrega ya a las listas en cache para que el selector lo muestre sin esperar la recarga.
            queryClient.setQueryData<Catalogos>(CATALOGOS_KEY, (cat) =>
              cat ? { ...cat, proyectos: [...cat.proyectos, proyecto] } : cat,
            );
            queryClient.setQueryData<Proyecto[]>(['proyectos'], (lista) => (lista ? [...lista, proyecto] : lista));
            navigate(`/inmuebles?proyecto=${proyecto.id}&registrar=1`);
          }}
        />
      )}
      {modal?.tipo === 'editar' && (
        <ProyectoModal existente={{ id: modal.fila.id, nombre: modal.fila.proyecto }} onClose={crud.cerrar} />
      )}
      {modal?.tipo === 'eliminar' && (
        <ConfirmarEliminar
          objeto={`el proyecto ${modal.fila.proyecto}`}
          detalle={
            modal.fila.inmuebles > 0
              ? `Tiene ${modal.fila.inmuebles} inmueble(s): eliminalos o muevelos a otro proyecto primero.`
              : modal.fila.etapas > 0
                ? `Sus ${modal.fila.etapas} etapa(s) tambien se eliminan.`
                : undefined
          }
          eliminar={() => deleteProyecto(modal.fila.id)}
          onClose={crud.cerrar}
        />
      )}
    </div>
  );
}
