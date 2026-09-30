import { useQuery } from '@tanstack/react-query';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchProyectos } from '../api/inmuebles';
import { fetchReportes, type ProyectoFinanciero, type ReportesResponse } from '../api/resumen';
import { useAuth } from '../auth/AuthContext';
import { SectionTitle } from '../components/cards/Cards';
import { DistributionBars, YearColumns } from '../components/charts/Charts';
import { CheckboxField, FormModal, FormSection } from '../components/forms/FormModal';
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

type SeccionId = 'resumen' | 'financiera' | 'ocupacion' | 'egresos' | 'canonProyecto' | 'canonTipo' | 'vencimientos';

interface Seccion {
  id: SeccionId;
  titulo: string;
  /** Tambien aparece en el tablero (el resumen ejecutivo solo existe en el informe formal). */
  enTablero: boolean;
  /** Ocupa todo el ancho en el tablero. */
  ancho?: boolean;
  render: (data: ReportesResponse) => ReactNode;
}

const SECCIONES: Seccion[] = [
  {
    id: 'resumen',
    titulo: 'Resumen ejecutivo',
    enTablero: false,
    render: (data) => <ResumenEjecutivo proyectos={data.proyectos} />,
  },
  {
    id: 'financiera',
    titulo: 'Canon, egresos y EBITDA mensual por proyecto',
    enTablero: true,
    ancho: true,
    render: (data) => <TablaFinanciera proyectos={data.proyectos} />,
  },
  {
    id: 'ocupacion',
    titulo: 'Ocupacion por proyecto',
    enTablero: true,
    render: (data) => (
      <DistributionBars
        items={[...data.proyectos]
          .sort((a, b) => b.ocupacionPorcentaje - a.ocupacionPorcentaje)
          .map((p) => ({
            label: p.proyecto,
            value: p.ocupacionPorcentaje,
            display: `${formatPct(p.ocupacionPorcentaje)} · ${p.arrendados}/${p.inmuebles}`,
            hint: `${p.proyecto}: ${p.arrendados} de ${p.inmuebles} inmuebles arrendados`,
          }))}
        emptyText="Sin inmuebles registrados."
      />
    ),
  },
  {
    id: 'egresos',
    titulo: 'Composicion de egresos mensuales',
    enTablero: true,
    render: (data) => {
      const total = data.composicionEgresos.reduce((a, c) => a + c.valor, 0);
      return (
        <DistributionBars
          items={data.composicionEgresos.map((c) => ({
            label: c.concepto,
            value: c.valor,
            display: formatCurrencyCompact(c.valor),
            hint: `${c.concepto}: ${formatCurrency(c.valor)} (${total > 0 ? ((c.valor / total) * 100).toFixed(1) : '0'}% del total)`,
          }))}
          emptyText="Sin egresos registrados para este filtro."
        />
      );
    },
  },
  {
    id: 'canonProyecto',
    titulo: 'Canon mensual por proyecto',
    enTablero: true,
    render: (data) => (
      <DistributionBars
        items={data.canonPorProyecto.map((d) => ({
          label: d.etiqueta,
          value: d.valor,
          display: formatCurrencyCompact(d.valor),
          hint: `${d.etiqueta}: ${formatCurrency(d.valor)} · ${d.conteo} contrato(s)`,
        }))}
        emptyText="Sin contratos con canon registrado."
      />
    ),
  },
  {
    id: 'canonTipo',
    titulo: 'Canon por tipo de inmueble',
    enTablero: true,
    render: (data) => (
      <DistributionBars
        items={data.canonPorTipoInmueble.map((d) => ({
          label: d.etiqueta,
          value: d.valor,
          display: formatCurrencyCompact(d.valor),
          hint: `${d.etiqueta}: ${formatCurrency(d.valor)} · ${d.conteo} contrato(s)`,
        }))}
        emptyText="Sin datos."
      />
    ),
  },
  {
    id: 'vencimientos',
    titulo: 'Contratos que vencen por anio',
    enTablero: true,
    ancho: true,
    render: (data) => (
      <YearColumns
        items={data.vencimientosPorAnio.map((v) => ({
          label: String(v.anio),
          value: v.contratos,
          display: String(v.contratos),
          hint: `${v.anio}: ${v.contratos} contrato(s) · canon ${formatCurrency(v.canonMensual)}`,
        }))}
        emptyText="Sin vencimientos registrados."
      />
    ),
  },
];

const fechaInforme = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' });

export function ReportesPage() {
  // El filtro vive en la URL para poder compartir o recargar un informe de un proyecto.
  const [searchParams, setSearchParams] = useSearchParams();
  const proyectoId = searchParams.get('proyecto') ? Number(searchParams.get('proyecto')) : undefined;
  const { usuario } = useAuth();

  // Secciones del informe formal elegidas; null = se ve el tablero.
  const [informe, setInforme] = useState<SeccionId[] | null>(null);
  const [eligiendo, setEligiendo] = useState(false);

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

  const filtroProyecto = (
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
  );

  const selector = eligiendo && (
    <ElegirSecciones
      inicial={informe ?? SECCIONES.map((s) => s.id)}
      onClose={() => setEligiendo(false)}
      onConfirm={(ids) => {
        setInforme(ids);
        setEligiendo(false);
      }}
    />
  );

  if (informe) {
    return (
      <div>
        {selector}
        <div className={styles.toolbar} data-no-print>
          {filtroProyecto}
          <div className={styles.informeAcciones}>
            <button type="button" className={styles.ghost} onClick={() => setInforme(null)}>
              Volver al tablero
            </button>
            <button type="button" className={styles.ghost} onClick={() => setEligiendo(true)}>
              Cambiar secciones
            </button>
            <button type="button" className={styles.primary} onClick={() => window.print()} disabled={!data}>
              Imprimir / guardar PDF
            </button>
          </div>
        </div>

        <article className={styles.informe}>
          <header className={styles.informeHead}>
            <div className={styles.informeKicker}>Activos LG · Informe del portafolio</div>
            <h1 className={styles.informeTitulo}>{proyectoNombre ?? 'Todos los proyectos'}</h1>
            <div className={styles.informeMeta}>
              Generado el {fechaInforme.format(new Date())}
              {usuario ? ` por ${usuario.nombre}` : ''}. Cifras del estado actual del portafolio (valores mensuales en COP).
            </div>
          </header>

          {isError && <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los informes.</div>}
          {data &&
            SECCIONES.filter((s) => informe.includes(s.id)).map((s, i) => (
              <section key={s.id} className={styles.informeSeccion}>
                <h2 className={styles.informeSeccionTitulo}>
                  {i + 1}. {s.titulo}
                </h2>
                {s.render(data)}
              </section>
            ))}
        </article>
      </div>
    );
  }

  const tablero = SECCIONES.filter((s) => s.enTablero);
  const anchas = (s: Seccion) => s.ancho;

  return (
    <div>
      <Header meta={pageMeta.reportes} onAction={() => setEligiendo(true)} />
      {selector}

      <div className={styles.toolbar}>
        {filtroProyecto}
        <div className={styles.note}>
          Agregaciones del estado actual del portafolio. La base de datos no guarda historico mensual, por lo que no
          hay series de tiempo todavia.
        </div>
      </div>

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los informes.</div>
      ) : (
        <>
          {tablero.filter(anchas).slice(0, 1).map((s) => (
            <Panel key={s.id} titulo={s.titulo} cargando={isLoading} style={{ marginBottom: 24 }}>
              {data && s.render(data)}
            </Panel>
          ))}

          <div className={styles.grid}>
            {tablero
              .filter((s) => !anchas(s))
              .map((s) => (
                <Panel key={s.id} titulo={`${s.titulo}${s.id === 'egresos' || s.id === 'canonTipo' ? sufijo : ''}`} cargando={isLoading}>
                  {data && s.render(data)}
                </Panel>
              ))}
          </div>

          {tablero.filter(anchas).slice(1).map((s) => (
            <Panel key={s.id} titulo={`${s.titulo}${sufijo}`} cargando={isLoading}>
              {data && s.render(data)}
            </Panel>
          ))}
        </>
      )}
    </div>
  );
}

function Panel({ titulo, cargando, style, children }: { titulo: string; cargando: boolean; style?: CSSProperties; children: ReactNode }) {
  return (
    <section style={{ ...panelStyle, ...style }}>
      <SectionTitle>{titulo}</SectionTitle>
      {cargando ? <ChartSkeleton /> : children}
    </section>
  );
}

/** Dialogo para escoger que secciones lleva el informe formal. */
function ElegirSecciones({
  inicial,
  onClose,
  onConfirm,
}: {
  inicial: SeccionId[];
  onClose: () => void;
  onConfirm: (ids: SeccionId[]) => void;
}) {
  const [elegidas, setElegidas] = useState<SeccionId[]>(inicial);
  const [error, setError] = useState<string | null>(null);

  const alternar = (id: SeccionId, marcada: boolean) =>
    setElegidas((prev) => (marcada ? [...prev, id] : prev.filter((x) => x !== id)));

  return (
    <FormModal
      title="Informe formal"
      subtitle="Escoge las secciones que quieres incluir. Luego podras imprimirlo o guardarlo como PDF."
      onClose={onClose}
      onSubmit={() => {
        if (elegidas.length === 0) {
          setError('Escoge al menos una seccion.');
          return;
        }
        // Se conserva el orden del informe, no el orden en que se marcaron.
        onConfirm(SECCIONES.map((s) => s.id).filter((id) => elegidas.includes(id)));
      }}
      submitting={false}
      error={error}
      submitLabel="Ver informe"
    >
      <FormSection cols={1}>
        {SECCIONES.map((s) => (
          <CheckboxField key={s.id} label={s.titulo} checked={elegidas.includes(s.id)} onChange={(x) => alternar(s.id, x)} />
        ))}
        <div style={{ display: 'flex', gap: 14 }}>
          <button type="button" className={styles.linkBtn} onClick={() => setElegidas(SECCIONES.map((s) => s.id))}>
            Marcar todas
          </button>
          <button type="button" className={styles.linkBtn} onClick={() => setElegidas([])}>
            Desmarcar todas
          </button>
        </div>
      </FormSection>
    </FormModal>
  );
}

function ResumenEjecutivo({ proyectos }: { proyectos: ProyectoFinanciero[] }) {
  const t = totales(proyectos);
  const items = [
    { label: 'Inmuebles', value: String(t.inmuebles) },
    { label: 'Ocupacion', value: `${formatPct(t.inmuebles === 0 ? 0 : (t.arrendados * 100) / t.inmuebles)} (${t.arrendados} arrendados)` },
    { label: 'Canon mensual', value: formatCurrency(t.canon) },
    { label: 'Egresos mensuales', value: formatCurrency(t.egresos) },
    { label: 'EBITDA mensual', value: formatCurrency(t.ebitda) },
    { label: 'Margen EBITDA', value: margen(t.ebitda, t.canon) },
    { label: 'Valor comercial', value: formatCurrency(t.valor) },
  ];
  return (
    <dl className={styles.resumen}>
      {items.map((i) => (
        <div key={i.label}>
          <dt>{i.label}</dt>
          <dd>{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatPct(value: number): string {
  return `${value.toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`;
}

function totales(proyectos: ProyectoFinanciero[]) {
  return proyectos.reduce(
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
}

function TablaFinanciera({ proyectos }: { proyectos: ProyectoFinanciero[] }) {
  if (proyectos.length === 0) return <div className={styles.empty}>Sin proyectos con inmuebles.</div>;

  const total = totales(proyectos);

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
