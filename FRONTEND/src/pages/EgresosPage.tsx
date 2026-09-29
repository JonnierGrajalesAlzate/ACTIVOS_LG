import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deleteEgreso, fetchEgresos, type EgresoListItem } from '../api/egresos';
import { usePermisos } from '../auth/permisos';
import { FiltrosBar, ProyectoFiltro } from '../components/filters/SelectFiltro';
import { ConfirmarEliminar } from '../components/crud/ConfirmarEliminar';
import { RowActions } from '../components/crud/RowActions';
import { useCrud } from '../components/crud/useCrud';
import { EgresoModal } from '../components/egresos/EgresoModal';
import { Header } from '../components/layout/Header';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact, formatPercent } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';

const PAGE_SIZE = 10;

export function EgresosPage() {
  // El proyecto vive en la URL para poder recargar o compartir la vista filtrada.
  const [searchParams, setSearchParams] = useSearchParams();
  const proyecto = searchParams.get('proyecto') ?? '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('total');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const crud = useCrud<EgresoListItem>();
  const { modal } = crud;
  const { puedeEditar } = usePermisos();
  const debouncedSearch = useDebouncedValue(search, 250);

  const setProyecto = (value: string) => {
    setSearchParams(value ? { proyecto: value } : {});
    setPage(1);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['egresos', { proyecto, debouncedSearch, page, sortField, sortDir }],
    queryFn: () =>
      fetchEgresos({
        proyecto: proyecto ? Number(proyecto) : undefined,
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
    {
      key: 'acciones',
      header: '',
      align: 'right',
      render: (r) => (
        <RowActions label={`egreso de ${r.inmueble}`} onEdit={() => crud.editar(r)} onDelete={() => crud.eliminar(r)} />
      ),
    },
  ];

  const kpis = data?.kpis;

  return (
    <div>
      <Header
        meta={pageMeta.egresos}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAction={puedeEditar ? crud.crear : undefined}
      />
      {modal?.tipo === 'crear' && <EgresoModal onClose={crud.cerrar} />}
      {modal?.tipo === 'editar' && <EgresoModal id={modal.fila.id} onClose={crud.cerrar} />}
      {modal?.tipo === 'eliminar' && (
        <ConfirmarEliminar
          objeto={`el perfil de egresos de ${modal.fila.inmueble} (${modal.fila.proyecto})`}
          eliminar={() => deleteEgreso(modal.fila.id)}
          onClose={crud.cerrar}
        />
      )}

      <FiltrosBar>
        <ProyectoFiltro value={proyecto} onChange={setProyecto} />
      </FiltrosBar>

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
