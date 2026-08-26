import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchEgresos, type EgresoListItem } from '../api/egresos';
import { Header } from '../components/layout/Header';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';

const PAGE_SIZE = 10;

export function EgresosPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['egresos', { debouncedSearch, page, sortField, sortDir }],
    queryFn: () =>
      fetchEgresos({
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

  const columns: DataTableColumn<EgresoListItem>[] = [
    { key: 'inmueble', header: 'Inmueble', sortable: true, render: (r) => r.inmueble },
    { key: 'proyecto', header: 'Proyecto', render: (r) => r.proyecto },
    { key: 'predial', header: 'Predial', align: 'right', sortable: true, render: (r) => formatCurrency(r.predialMensual) },
    { key: 'admon', header: 'Com. admon', align: 'right', render: (r) => formatCurrency(r.comisionAdministracion) },
    { key: 'mtto', header: 'Mtto', align: 'right', render: (r) => formatCurrency(r.mantenimientoMenor) },
    { key: 'total', header: 'Total egresos', align: 'right', sortable: true, render: (r) => formatCurrency(r.totalEgresos) },
    {
      key: 'ebitda',
      header: 'EBITDA',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span style={{ color: (r.ebitda ?? 0) < 0 ? 'var(--danger)' : 'var(--ok)', fontWeight: 700 }}>
          {formatCurrency(r.ebitda)}
        </span>
      ),
    },
    {
      key: 'caprate',
      header: 'Cap rate',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span style={{ color: (r.rentabilidadCapRate ?? 0) < 0 ? 'var(--danger)' : undefined }}>
          {formatPercent(r.rentabilidadCapRate)}
        </span>
      ),
    },
  ];

  const kpis = data?.kpis;

  return (
    <div>
      <Header meta={pageMeta.egresos} searchValue={search} onSearchChange={setSearch} />

      <KpiStrip
        items={[
          { label: 'Egresos mensuales', value: formatCurrencyCompact(kpis?.totalEgresos ?? 0), tone: 'accent' },
          { label: 'EBITDA mensual', value: formatCurrencyCompact(kpis?.totalEbitda ?? 0) },
          { label: 'Predial mensual', value: formatCurrencyCompact(kpis?.predialTotal ?? 0) },
          {
            label: 'Inmuebles en perdida',
            value: String(kpis?.inmueblesEnPerdida ?? 0),
            tone: (kpis?.inmueblesEnPerdida ?? 0) > 0 ? 'danger' : undefined,
          },
        ]}
      />

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los egresos.</div>
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
            emptyTitle="Sin egresos"
            emptyHelp="No hay perfiles de egresos registrados para estos inmuebles."
          />
          {data && data.pagina.total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={data.pagina.total} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
