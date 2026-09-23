import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { fetchContratos, type ContratoListItem } from '../api/contrapartes';
import { DIAS_ALERTA_VENCIMIENTO } from '../api/resumen';
import { SectionTitle } from '../components/cards/Cards';
import { FilterChipRow, type ChipOption } from '../components/filters/FilterChipRow';
import { Header } from '../components/layout/Header';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { Pagination } from '../components/pagination/Pagination';
import { ProgressBar } from '../components/progress/ProgressBar';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact, formatDate } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';
import styles from './ContratosPage.module.css';

const PAGE_SIZE = 8;
const TODOS = '__todos__';

const gestionOptions: ChipOption<string>[] = [
  { value: TODOS, label: 'Todos' },
  { value: 'vencido', label: 'Vencidos' },
  { value: 'por-vencer', label: 'Por vencer' },
  { value: 'vigente', label: 'Vigentes' },
];

function gestionColor(gestion: string): string {
  switch (gestion) {
    case 'Vencido':
      return 'var(--danger)';
    case 'Por vencer':
      return 'var(--warn)';
    case 'Vigente':
      return 'var(--ok)';
    default:
      return 'var(--ink-4)';
  }
}

function ContratoCard({ c }: { c: ContratoListItem }) {
  const color = gestionColor(c.gestion);
  const dias =
    c.diasRestantes === null
      ? 'Sin vencimiento'
      : c.diasRestantes < 0
        ? `Vencido hace ${Math.abs(c.diasRestantes)} dias`
        : `${c.diasRestantes} dias`;

  return (
    <div className={styles.card}>
      <div className={styles.inmueble}>
        <b className={styles.inmuebleName}>{c.inmueble}</b>
        <div className={styles.inmuebleProyecto}>{c.proyecto}</div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockLabel}>Arrendatario</div>
        <div className={styles.blockValue}>{c.arrendatario ?? '—'}</div>
      </div>

      <div className={styles.block}>
        <div className={styles.blockLabel}>Canon</div>
        <div className={styles.blockValue}>{formatCurrency(c.canonMensual)}</div>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressMeta}>
          <span>{dias}</span>
          <span className={styles.progressMetaEnd}>{formatDate(c.proximoVencimiento)}</span>
        </div>
        {/* Sin fecha de inicio no se puede calcular el avance: una barra en 0 %
            se leeria como "recien iniciado", que es falso. */}
        {c.porcentajeTranscurrido === null ? (
          <div className={styles.progressUnknown}>Sin fecha de inicio registrada</div>
        ) : (
          <ProgressBar value={c.porcentajeTranscurrido} color={color} />
        )}
      </div>

      <div className={styles.gestion} style={{ color }}>
        {c.gestion}
      </div>
    </div>
  );
}

export function ContratosPage({ tabs }: { tabs?: ReactNode }) {
  const [search, setSearch] = useState('');
  const [gestion, setGestion] = useState(TODOS);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contratos', { debouncedSearch, gestion, page }],
    queryFn: () =>
      fetchContratos({
        q: debouncedSearch || undefined,
        gestion: gestion === TODOS ? undefined : gestion,
        pagina: page,
        tamano: PAGE_SIZE,
        orden: 'vence',
        dir: 'asc',
      }),
  });

  const kpis = data?.kpis;
  const items = data?.pagina.items ?? [];

  return (
    <div>
      <Header meta={pageMeta.contratos} searchValue={search} onSearchChange={setSearch} />
      {tabs}

      <KpiStrip
        items={[
          { label: 'Contratos vigentes', value: String(kpis?.contratosVigentes ?? 0) },
          { label: `Vencen en ${DIAS_ALERTA_VENCIMIENTO} dias`, value: String(kpis?.vencenEn120Dias ?? 0) },
          { label: 'Canon mensual', value: formatCurrencyCompact(kpis?.canonMensualTotal ?? 0), tone: 'accent' },
        ]}
      />

      <FilterChipRow
        options={gestionOptions}
        value={gestion}
        onChange={(v) => {
          setGestion(v);
          setPage(1);
        }}
      />

      <div style={{ marginTop: 16 }}>
        <SectionTitle>Proximos vencimientos</SectionTitle>
      </div>

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los contratos.</div>
      ) : (
        <>
          <div className={styles.list}>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => <div key={`sk-${i}`} className={styles.skeleton} />)}
            {!isLoading && items.map((c) => <ContratoCard key={c.id} c={c} />)}
          </div>

          {!isLoading && items.length === 0 && (
            <div className={styles.empty}>
              <div className={styles.emptyTitle}>Sin contratos</div>
              <div>No hay contratos que coincidan con este filtro.</div>
            </div>
          )}

          {data && data.pagina.total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.pagina.total} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
