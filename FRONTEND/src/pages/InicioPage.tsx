import { useQuery } from '@tanstack/react-query';
import { Banknote, DoorOpen, PieChart, Receipt } from 'lucide-react';
import { fetchResumen } from '../api/resumen';
import { AlertCard, SectionTitle } from '../components/cards/Cards';
import { OccupancyRing } from '../components/charts/OccupancyRing';
import { Header } from '../components/layout/Header';
import { StatCard } from '../components/kpi/StatCard';
import { ProgressBar } from '../components/progress/ProgressBar';
import { pageMeta } from '../nav/navConfig';
import styles from './InicioPage.module.css';
import { formatArea, formatCurrencyCompact } from '../utils/format';

export function InicioPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['resumen'], queryFn: fetchResumen });
  const k = data?.kpis;
  const ocupacion = k?.ocupacionPorcentaje ?? 0;
  const ocupacionTone = ocupacion >= 90 ? 'var(--ok)' : ocupacion >= 70 ? 'var(--warn)' : 'var(--danger)';

  return (
    <div>
      <Header meta={pageMeta.inicio} />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudo cargar el resumen del portafolio.</div>
      ) : (
        <>
          <div className={styles.kpiGrid}>
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
              tone={ocupacion >= 90 ? 'ok' : ocupacion >= 70 ? 'warn' : 'danger'}
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

          <div className={styles.mainGrid}>
            <div className={styles.panel}>
              <SectionTitle>Requiere tu atencion</SectionTitle>
              <div className={styles.alertList}>
                {isLoading && Array.from({ length: 4 }).map((_, i) => <div key={`sk-${i}`} className={styles.skeleton} />)}
                {!isLoading &&
                  (data?.alertas ?? []).map((a, i) => (
                    <AlertCard
                      key={`${a.tipo}-${a.titulo}-${i}`}
                      titulo={a.titulo}
                      contexto={a.contexto}
                      motivo={a.motivo}
                      detalle={a.detalle}
                      severidad={a.severidad}
                    />
                  ))}
                {!isLoading && (data?.alertas.length ?? 0) === 0 && (
                  <div className={styles.emptyState}>
                    Sin alertas: ningun contrato vence en los proximos 90 dias y ningun inmueble esta en perdida.
                  </div>
                )}
              </div>
            </div>

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

              <SectionTitle>Por proyecto</SectionTitle>
              <div className={styles.projectList}>
                {(data?.ocupacionPorProyecto ?? []).map((p) => (
                  <div key={p.proyecto}>
                    <div className={styles.projectHead}>
                      <span className={styles.projectName} title={p.proyecto}>
                        {p.proyecto}
                      </span>
                      <span className={styles.projectMeta}>
                        {p.ocupacionPorcentaje}% · {p.inmuebles}
                      </span>
                    </div>
                    <ProgressBar
                      value={p.ocupacionPorcentaje}
                      height={8}
                      color={p.ocupacionPorcentaje < 100 ? 'var(--danger)' : 'var(--accent)'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
