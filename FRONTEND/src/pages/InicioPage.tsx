import { useQuery } from '@tanstack/react-query';
import type { CSSProperties } from 'react';
import { fetchResumen } from '../api/resumen';
import { AlertCard, SectionTitle } from '../components/cards/Cards';
import { Header } from '../components/layout/Header';
import { ProgressBar } from '../components/progress/ProgressBar';
import { pageMeta } from '../nav/navConfig';
import { formatArea, formatCurrencyCompact } from '../utils/format';

export function InicioPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['resumen'], queryFn: fetchResumen });
  const k = data?.kpis;

  return (
    <div>
      <Header meta={pageMeta.inicio} />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudo cargar el resumen del portafolio.</div>
      ) : (
        <>
          {/* Barra de KPI grande: el canon es la cifra principal del portafolio. */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              padding: '16px 0',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
              marginBottom: 24,
            }}
          >
            <div style={{ paddingRight: 24, borderRight: '1px solid var(--line-2)' }}>
              <div style={kpiLabel}>Canon mensual</div>
              <div style={{ ...kpiHero, color: 'var(--accent)' }}>{formatCurrencyCompact(k?.canonMensual ?? 0)}</div>
              <div style={kpiHelp}>{k?.arrendados ?? 0} inmuebles arrendados</div>
            </div>
            <div style={{ padding: '0 24px', borderRight: '1px solid var(--line-2)' }}>
              <div style={kpiLabel}>Egresos mensuales</div>
              <div style={kpiValue}>{formatCurrencyCompact(k?.egresosMensuales ?? 0)}</div>
              <div style={kpiHelp}>EBITDA {formatCurrencyCompact(k?.ebitdaMensual ?? 0)}</div>
            </div>
            <div style={{ padding: '0 24px', borderRight: '1px solid var(--line-2)' }}>
              <div style={kpiLabel}>Ocupacion</div>
              <div style={kpiValue}>{k?.ocupacionPorcentaje ?? 0}%</div>
              <ProgressBar value={k?.ocupacionPorcentaje ?? 0} height={6} />
            </div>
            <div style={{ paddingLeft: 24 }}>
              <div style={kpiLabel}>Disponibles</div>
              <div style={{ ...kpiValue, color: (k?.disponibles ?? 0) > 0 ? 'var(--danger)' : undefined }}>
                {k?.disponibles ?? 0}
              </div>
              <div style={kpiHelp}>de {k?.totalInmuebles ?? 0} predios · {formatArea(k?.areaTotalM2 ?? 0)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 24 }}>
            <div>
              <SectionTitle>Requiere tu atencion</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={`sk-${i}`}
                      style={{ height: 72, borderRadius: 14, background: 'var(--line-2)', opacity: 0.7 }}
                    />
                  ))}
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
                  <div style={{ padding: 32, color: 'var(--ink-3)', fontSize: 13.5 }}>
                    Sin alertas: ningun contrato vence en los proximos 90 dias y ningun inmueble
                    esta en perdida.
                  </div>
                )}
              </div>
            </div>

            <div>
              <SectionTitle>Ocupacion por proyecto</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(data?.ocupacionPorProyecto ?? []).map((p) => (
                  <div key={p.proyecto}>
                    <div style={{ display: 'flex', fontSize: 13.5, fontWeight: 600, gap: 8 }}>
                      <span
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        title={p.proyecto}
                      >
                        {p.proyecto}
                      </span>
                      <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
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

const kpiLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--ink-4)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

const kpiHero: CSSProperties = {
  fontSize: 38,
  fontWeight: 800,
  letterSpacing: '-1.9px',
  marginTop: 8,
  lineHeight: 1,
};

const kpiValue: CSSProperties = {
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: '-1.2px',
  marginTop: 10,
  lineHeight: 1,
};

const kpiHelp: CSSProperties = {
  fontSize: 13,
  color: 'var(--ink-3)',
  marginTop: 8,
};
