import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, DoorOpen, Landmark, PieChart, Receipt } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchResumen } from '../api/resumen';
import { ProjectCard, SectionTitle } from '../components/cards/Cards';
import { OccupancyRing } from '../components/charts/OccupancyRing';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/kpi/StatCard';
import { ProgressBar } from '../components/progress/ProgressBar';
import { NuevoProyectoModal } from '../components/proyectos/NuevoProyectoModal';
import { pageMeta } from '../nav/navConfig';
import styles from './InicioPage.module.css';
import { formatArea, formatCurrencyCompact } from '../utils/format';
import { occupancyColor } from '../utils/colors';
import { matchesSearch } from '../utils/text';

export function InicioPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['resumen'], queryFn: fetchResumen });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showNuevoProyecto, setShowNuevoProyecto] = useState(false);
  const [search, setSearch] = useState('');
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
        onAction={() => setShowNuevoProyecto(true)}
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

      {showNuevoProyecto && (
        <NuevoProyectoModal
          onClose={() => setShowNuevoProyecto(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ['resumen'] });
            queryClient.invalidateQueries({ queryKey: ['proyectos'] });
          }}
        />
      )}
    </div>
  );
}
