import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, X } from 'lucide-react';
import { fetchInmuebles, fetchProyectos, type InmuebleListItem } from '../api/inmuebles';
import { FilterChipRow, type ChipOption } from '../components/filters/FilterChipRow';
import { Header } from '../components/layout/Header';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { formatArea, formatCurrency, formatCurrencyCompact, formatDate } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';

const TODOS = '__todos__';
const PAGE_SIZE = 10;

// Color semantico por estado del catalogo `estado` de la base de datos.
function estadoColor(estado: string): string {
  switch (estado) {
    case 'Arrendado':
      return 'var(--ok)';
    case 'Disponible':
      return 'var(--danger)';
    case 'No Disponible':
      return 'var(--warn)';
    default:
      return 'var(--ink-2)';
  }
}

export function InmueblesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const proyectoId = searchParams.get('proyecto') ? Number(searchParams.get('proyecto')) : undefined;

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<string>(TODOS);
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('proyecto');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const debouncedSearch = useDebouncedValue(search, 250);

  const { data: proyectos } = useQuery({ queryKey: ['proyectos'], queryFn: fetchProyectos });
  const proyectoNombre = proyectos?.find((p) => p.id === proyectoId)?.nombre;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['inmuebles', { proyectoId, debouncedSearch, estado, page, sortField, sortDir }],
    queryFn: () =>
      fetchInmuebles({
        proyecto: proyectoId,
        q: debouncedSearch || undefined,
        estado: estado === TODOS ? undefined : estado,
        pagina: page,
        tamano: PAGE_SIZE,
        orden: sortField,
        dir: sortDir,
      }),
  });

  const clearProyecto = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('proyecto');
      return next;
    });
    setPage(1);
  };

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const columns: DataTableColumn<InmuebleListItem>[] = [
    { key: 'nombre', header: 'Inmueble', render: (r) => r.nombre },
    { key: 'proyecto', header: 'Proyecto', sortable: true, render: (r) => r.proyecto },
    { key: 'arrendatario', header: 'Arrendatario', render: (r) => r.arrendatario ?? '—' },
    { key: 'area', header: 'Area', align: 'right', sortable: true, render: (r) => formatArea(r.areaM2) },
    { key: 'canon', header: 'Canon', align: 'right', sortable: true, render: (r) => formatCurrency(r.canonMensual) },
    {
      key: 'vence',
      header: 'Vence',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span
          style={r.contratoVencido ? { color: 'var(--danger)', fontWeight: 700 } : undefined}
          title={r.contratoVencido ? 'Contrato vencido: renovacion pendiente' : undefined}
        >
          {formatDate(r.proximoVencimiento)}
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'right',
      sortable: true,
      render: (r) => <span style={{ color: estadoColor(r.estado), fontWeight: 700 }}>{r.estado}</span>,
    },
  ];

  const kpis = data?.kpis;

  const estadoOptions: ChipOption<string>[] = [
    { value: TODOS, label: `Todos · ${data?.pagina.total ?? 0}` },
    ...(data?.estados ?? []).map((e) => ({ value: e.estado, label: `${e.estado} · ${e.conteo}` })),
  ];

  return (
    <div>
      <Header meta={pageMeta.inmuebles} searchValue={search} onSearchChange={setSearch} />

      {proyectoId !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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
            }}
          >
            <ArrowLeft size={16} strokeWidth={2.2} />
            Volver a proyectos
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 14px',
              width: 'fit-content',
              background: 'var(--fill)',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>Proyecto: {proyectoNombre ?? `#${proyectoId}`}</span>
            <button
              type="button"
              onClick={clearProyecto}
              aria-label="Quitar filtro de proyecto"
              style={{
                display: 'grid',
                placeItems: 'center',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--ink-3)',
                padding: 2,
              }}
            >
              <X size={15} strokeWidth={2.2} />
            </button>
          </div>
        </div>
      )}

      <KpiStrip
        items={[
          { label: 'Canon', value: formatCurrencyCompact(kpis?.canonMensualTotal ?? 0), tone: 'accent' },
          { label: 'Area', value: formatArea(kpis?.areaTotalM2 ?? 0) },
          { label: 'Ocupacion', value: `${kpis?.ocupacionPorcentaje ?? 0}%` },
          { label: 'Vencen 90 d.', value: String(kpis?.vencenEn90Dias ?? 0) },
          {
            label: 'Contratos vencidos',
            value: String(kpis?.contratosVencidos ?? 0),
            tone: (kpis?.contratosVencidos ?? 0) > 0 ? 'danger' : undefined,
          },
        ]}
      />

      <FilterChipRow
        options={estadoOptions}
        value={estado}
        onChange={(v) => {
          setEstado(v);
          setPage(1);
        }}
      />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>
          No se pudo cargar el inventario de inmuebles. Verifica que el backend este disponible.
        </div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.pagina.items ?? []}
            rowKey={(r) => r.id}
            loading={isLoading}
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            emptyTitle="Sin inmuebles"
            emptyHelp="Aun no hay inmuebles registrados con este filtro."
          />
          {data && data.pagina.total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.pagina.total} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
