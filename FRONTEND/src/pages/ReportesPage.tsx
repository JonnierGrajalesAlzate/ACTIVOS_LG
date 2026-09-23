import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { fetchReportes } from '../api/resumen';
import { SectionTitle } from '../components/cards/Cards';
import { DistributionBars, YearColumns } from '../components/charts/Charts';
import { Header } from '../components/layout/Header';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';

export function ReportesPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['reportes'], queryFn: fetchReportes });

  if (isError) {
    return (
      <div>
        <Header meta={pageMeta.reportes} />
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los informes.</div>
      </div>
    );
  }

  const totalEgresos = (data?.composicionEgresos ?? []).reduce((a, c) => a + c.valor, 0);

  const panelStyle: CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 18,
    padding: '22px 24px',
    boxShadow: 'var(--shadow-xs)',
  };

  return (
    <div>
      <Header meta={pageMeta.reportes} />

      <div
        style={{
          background: 'var(--surface-soft)',
          borderRadius: 16,
          padding: '14px 18px',
          fontSize: 13,
          color: 'var(--ink-3)',
          marginBottom: 26,
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        Los informes son agregaciones del estado actual del portafolio. La base de datos no
        guarda historico mensual, por lo que no hay series de tiempo todavia.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
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
          <SectionTitle>Composicion de egresos mensuales</SectionTitle>
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
              emptyText="Sin egresos registrados."
            />
          )}
        </section>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <section style={panelStyle}>
          <SectionTitle>Canon por tipo de inmueble</SectionTitle>
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

        <section style={panelStyle}>
          <SectionTitle>Contratos que vencen por anio</SectionTitle>
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
      </div>
    </div>
  );
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
