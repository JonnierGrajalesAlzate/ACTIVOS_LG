import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchArrendadores, type ArrendadorListItem } from '../api/contrapartes';
import { SoftCard } from '../components/cards/Cards';
import { Header } from '../components/layout/Header';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';

const PAGE_SIZE = 10;

export function ArrendadoresPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('giro');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['arrendadores', { debouncedSearch, page, sortField, sortDir }],
    queryFn: () =>
      fetchArrendadores({
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

  const columns: DataTableColumn<ArrendadorListItem>[] = [
    { key: 'nombre', header: 'Arrendador', sortable: true, render: (r) => r.nombre },
    { key: 'nit', header: 'NIT', render: (r) => r.nit },
    { key: 'inmuebles', header: 'Inmuebles', align: 'right', sortable: true, render: (r) => r.inmuebles },
    { key: 'contratos', header: 'Contratos', align: 'right', render: (r) => r.contratos },
    {
      key: 'giro',
      header: 'Giro mensual',
      align: 'right',
      sortable: true,
      render: (r) => <b>{formatCurrency(r.giroMensual)}</b>,
    },
  ];

  const kpis = data?.kpis;

  return (
    <div>
      <Header meta={pageMeta.arrendadores} searchValue={search} onSearchChange={setSearch} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <SoftCard label="Arrendadores" value={String(kpis?.totalArrendadores ?? 0)} />
        <SoftCard
          label="Giro mensual"
          value={formatCurrencyCompact(kpis?.giroMensualTotal ?? 0)}
          tone="accent"
          help="Suma del canon de sus contratos"
        />
        <SoftCard label="Inmuebles representados" value={String(kpis?.inmueblesRepresentados ?? 0)} />
      </div>

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los arrendadores.</div>
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
            emptyTitle="Sin arrendadores"
            emptyHelp="No hay propietarios registrados con este filtro."
          />
          {data && data.pagina.total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.pagina.total} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
