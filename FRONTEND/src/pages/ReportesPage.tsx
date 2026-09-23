import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProyectos } from '../api/inmuebles';
import { fetchReportes, type ProyectoFinanciero } from '../api/resumen';
import { SectionTitle } from '../components/cards/Cards';
import { DistributionBars, YearColumns } from '../components/charts/Charts';
import { Header } from '../components/layout/Header';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';
import styles from './ReportesPage.module.css';

const panelStyle: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 18,
  padding: '22px 24px',
  boxShadow: 'var(--shadow-xs)',
};

export function ReportesPage() {
  // El filtro vive en la URL para poder compartir o recargar un informe de un proyecto.
  const [searchParams, setSearchParams] = useSearchParams();
  const proyectoId = searchParams.get('proyecto') ? Number(searchParams.get('proyecto')) : undefined;

  const { data: proyectosCatalogo } = useQuery({ queryKey: ['proyectos'], queryFn: fetchProyectos });
  const { data, isLoading, isError } = useQuery({
    queryKey: ['reportes', proyectoId ?? null],
    queryFn: () => fetchReportes(proyectoId),
  });

  const proyectoNombre = proyectosCatalogo?.find((p) => p.id === proyectoId)?.nombre;
  const sufijo = proyectoNombre ? ` · ${proyectoNombre}` : '';

  const setProyecto = (value: string) =>
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('proyecto', value);
      else next.delete('proyecto');
      return next;
    });

  const totalEgresos = (data?.composicionEgresos ?? []).reduce((a, c) => a + c.valor, 0);
  const proyectos = data?.proyectos ?? [];

  return (
    <div>
      <Header meta={pageMeta.reportes} />

      <div className={styles.toolbar}>
        <label className={styles.filter}>
          <span className={styles.filterLabel}>Proyecto</span>
          <select className={styles.select} value={proyectoId ?? ''} onChange={(e) => setProyecto(e.target.value)}>
            <option value="">Todos los proyectos</option>
            {(proyectosCatalogo ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.note}>
          Agregaciones del estado actual del portafolio. La base de datos no guarda historico mensual, por lo que no
          hay series de tiempo todavia.
        </div>
      </div>

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los informes.</div>
      ) : (
        <>
          <section style={{ ...panelStyle, marginBottom: 24 }}>
            <SectionTitle>Canon, egresos y EBITDA mensual por proyecto</SectionTitle>
            {isLoading ? <ChartSkeleton /> : <TablaFinanciera proyectos={proyectos} />}
          </section>

          <div className={styles.grid}>
            <section style={panelStyle}>
              <SectionTitle>Ocupacion por proyecto</SectionTitle>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <DistributionBars
                  items={[...proyectos]
                    .sort((a, b) => b.ocupacionPorcentaje - a.ocupacionPorcentaje)
                    .map((p) => ({
                      label: p.proyecto,
                      value: p.ocupacionPorcentaje,
                      display: `${formatPct(p.ocupacionPorcentaje)} · ${p.arrendados}/${p.inmuebles}`,
                      hint: `${p.proyecto}: ${p.arrendados} de ${p.inmuebles} inmuebles arrendados`,
                    }))}
                  emptyText="Sin inmuebles registrados."
                />
              )}
            </section>

            <section style={panelStyle}>
              <SectionTitle>Composicion de egresos mensuales{sufijo}</SectionTitle>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <DistributionBars
                  items={(data?.composicionEgresos ?? []).map((c) => ({
                    label: c.concepto,
                    value: c.valor,
                    display: formatCurrencyCompact(c.valor),
                    hint: `${c.concepto}: ${formatCurrency(c.valor)} (${
                      totalEgresos > 0 ? ((c.valor / totalEgresos) * 100).toFixed(1) : '0'
                    }% del total)`,
                  }))}
                  emptyText="Sin egresos registrados para este filtro."
                />
              )}
            </section>
          </div>

          <div className={styles.grid}>
            <section style={panelStyle}>
              <SectionTitle>Canon mensual por proyecto</SectionTitle>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <DistributionBars
                  items={(data?.canonPorProyecto ?? []).map((d) => ({
                    label: d.etiqueta,
                    value: d.valor,
                    display: formatCurrencyCompact(d.valor),
                    hint: `${d.etiqueta}: ${formatCurrency(d.valor)} · ${d.conteo} contrato(s)`,
                  }))}
                  emptyText="Sin contratos con canon registrado."
                />
              )}
            </section>

            <section style={panelStyle}>
              <SectionTitle>Canon por tipo de inmueble{sufijo}</SectionTitle>
              {isLoading ? (
                <ChartSkeleton />
              ) : (
                <DistributionBars
                  items={(data?.canonPorTipoInmueble ?? []).map((d) => ({
                    label: d.etiqueta,
                    value: d.valor,
                    display: formatCurrencyCompact(d.valor),
                    hint: `${d.etiqueta}: ${formatCurrency(d.valor)} · ${d.conteo} contrato(s)`,
                  }))}
                  emptyText="Sin datos."
                />
              )}
            </section>
          </div>

          <section style={panelStyle}>
            <SectionTitle>Contratos que vencen por anio{sufijo}</SectionTitle>
            {isLoading ? (
              <ChartSkeleton />
            ) : (
              <YearColumns
                items={(data?.vencimientosPorAnio ?? []).map((v) => ({
                  label: String(v.anio),
                  value: v.contratos,
                  display: String(v.contratos),
                  hint: `${v.anio}: ${v.contratos} contrato(s) · canon ${formatCurrency(v.canonMensual)}`,
                }))}
                emptyText="Sin vencimientos registrados."
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function formatPct(value: number): string {
  return `${value.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
}

function TablaFinanciera({ proyectos }: { proyectos: ProyectoFinanciero[] }) {
  if (proyectos.length === 0) return <div className={styles.empty}>Sin proyectos con inmuebles.</div>;

  const total = proyectos.reduce(
    (acc, p) => ({
      inmuebles: acc.inmuebles + p.inmuebles,
      arrendados: acc.arrendados + p.arrendados,
      canon: acc.canon + p.canonMensual,
      egresos: acc.egresos + p.egresosMensuales,
      ebitda: acc.ebitda + p.ebitdaMensual,
      valor: acc.valor + p.valorComercial,
    }),
    { inmuebles: 0, arrendados: 0, canon: 0, egresos: 0, ebitda: 0, valor: 0 },
  );

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Proyecto</th>
            <th className={styles.num}>Ocupacion</th>
            <th className={styles.num}>Canon mensual</th>
            <th className={styles.num}>Egresos mensuales</th>
            <th className={styles.num}>EBITDA mensual</th>
            <th className={styles.num}>Margen EBITDA</th>
            <th className={styles.num}>Valor comercial</th>
          </tr>
        </thead>
        <tbody>
          {proyectos.map((p) => (
            <tr key={p.id}>
              <td>
                <b>{p.proyecto}</b>
                <div className={styles.sub}>
                  {p.arrendados}/{p.inmuebles} inmuebles
                </div>
              </td>
              <td className={styles.num}>{formatPct(p.ocupacionPorcentaje)}</td>
              <td className={styles.num}>{formatCurrency(p.canonMensual)}</td>
              <td className={styles.num}>{formatCurrency(p.egresosMensuales)}</td>
              <td className={styles.num} style={p.ebitdaMensual < 0 ? { color: 'var(--danger)' } : undefined}>
                <b>{formatCurrency(p.ebitdaMensual)}</b>
              </td>
              <td className={styles.num}>{margen(p.ebitdaMensual, p.canonMensual)}</td>
              <td className={styles.num}>{formatCurrencyCompact(p.valorComercial)}</td>
            </tr>
          ))}
        </tbody>
        {proyectos.length > 1 && (
          <tfoot>
            <tr>
              <td>
                <b>Total</b>
                <div className={styles.sub}>
                  {total.arrendados}/{total.inmuebles} inmuebles
                </div>
              </td>
              <td className={styles.num}>
                {formatPct(total.inmuebles === 0 ? 0 : (total.arrendados * 100) / total.inmuebles)}
              </td>
              <td className={styles.num}>{formatCurrency(total.canon)}</td>
              <td className={styles.num}>{formatCurrency(total.egresos)}</td>
              <td className={styles.num}>
                <b>{formatCurrency(total.ebitda)}</b>
              </td>
              <td className={styles.num}>{margen(total.ebitda, total.canon)}</td>
              <td className={styles.num}>{formatCurrencyCompact(total.valor)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

/** EBITDA / canon. Sin canon no hay margen que calcular. */
function margen(ebitda: number, canon: number): string {
  if (canon <= 0) return '—';
  return formatPct((ebitda / canon) * 100);
}

function ChartSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: 26, borderRadius: 8, background: 'var(--line-2)', opacity: 0.7 }} />
      ))}
    </div>
  );
}
