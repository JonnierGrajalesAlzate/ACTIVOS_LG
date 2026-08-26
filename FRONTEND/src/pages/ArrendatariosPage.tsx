import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchArrendatarios, type ArrendatarioListItem } from '../api/contrapartes';
import { Header } from '../components/layout/Header';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact, formatDate } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';

const PAGE_SIZE = 10;

export function ArrendatariosPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('canon');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['arrendatarios', { debouncedSearch, page, sortField, sortDir }],
    queryFn: () =>
      fetchArrendatarios({
        q: debouncedSearch || undefined,
        pagina: page,
        tamano: PAGE_SIZE,
        orden: sortField,
        dir: sortDir,
      }),
  });

  const handleSortChange = (field: string) => {
    if (field === sortField) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortField(field);
      setSortDir('desc');
    }
    setPage(1);
  };

  const columns: DataTableColumn<ArrendatarioListItem>[] = [
    { key: 'nombre', header: 'Arrendatario', sortable: true, render: (r) => r.nombre },
    { key: 'nit', header: 'NIT', render: (r) => r.nit },
    {
      key: 'inmueble',
      header: 'Inmueble',
      render: (r) =>
        r.principalInmueble ? (
          <>
            {r.principalInmueble}
            <span style={{ color: 'var(--ink-4)' }}> · {r.principalProyecto}</span>
          </>
        ) : (
          '—'
        ),
    },
    { key: 'inmuebles', header: 'Predios', align: 'right', render: (r) => r.inmuebles },
    { key: 'canon', header: 'Canon', align: 'right', sortable: true, render: (r) => <b>{formatCurrency(r.canonMensual)}</b> },
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
  ];

  const kpis = data?.kpis;

  return (
    <div>
      <Header meta={pageMeta.arrendatarios} searchValue={search} onSearchChange={setSearch} />

      <KpiStrip
        items={[
          { label: 'Arrendatarios', value: String(kpis?.totalArrendatarios ?? 0) },
          { label: 'Canon mensual', value: formatCurrencyCompact(kpis?.canonMensualTotal ?? 0), tone: 'accent' },
          {
            label: 'Contratos vencidos',
            value: String(kpis?.contratosVencidos ?? 0),
            tone: (kpis?.contratosVencidos ?? 0) > 0 ? 'danger' : undefined,
          },
          { label: 'Vencen 90 d.', value: String(kpis?.vencenEn90Dias ?? 0) },
        ]}
      />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los arrendatarios.</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={data?.pagina.items ?? []}
            rowKey={(r) => r.nit}
            loading={isLoading}
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            emptyTitle="Sin arrendatarios"
            emptyHelp="No hay contrapartes registradas con este filtro."
          />
          {data && data.pagina.total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.pagina.total} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
