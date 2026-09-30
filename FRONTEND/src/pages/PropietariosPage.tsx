import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { deleteContraparte, fetchPropietarios, type PropietarioListItem } from '../api/contrapartes';
import { usePermisos } from '../auth/permisos';
import { SoftCard } from '../components/cards/Cards';
import { PropietarioModal } from '../components/contrapartes/PropietarioModal';
import { ConfirmarEliminar } from '../components/crud/ConfirmarEliminar';
import { RowActions } from '../components/crud/RowActions';
import { useCrud } from '../components/crud/useCrud';
import { Header } from '../components/layout/Header';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { formatCurrency, formatCurrencyCompact } from '../utils/format';
import { useDebouncedValue } from '../utils/useDebouncedValue';

const PAGE_SIZE = 10;

export function PropietariosPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('giro');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const crud = useCrud<PropietarioListItem>();
  const { modal } = crud;
  const { puedeEditar } = usePermisos();
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['propietarios', { debouncedSearch, page, sortField, sortDir }],
    queryFn: () =>
      fetchPropietarios({
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

  const columns: DataTableColumn<PropietarioListItem>[] = [
    { key: 'nombre', header: 'Propietario', sortable: true, render: (r) => r.nombre },
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
    {
      key: 'acciones',
      header: '',
      align: 'right',
      render: (r) => <RowActions label={r.nombre} onEdit={() => crud.editar(r)} onDelete={() => crud.eliminar(r)} />,
    },
  ];

  const kpis = data?.kpis;

  return (
    <div>
      <Header
        meta={pageMeta.propietarios}
        searchValue={search}
        onSearchChange={setSearch}
        onAction={puedeEditar ? crud.crear : undefined}
      />
      {modal?.tipo === 'crear' && <PropietarioModal onClose={crud.cerrar} />}
      {modal?.tipo === 'editar' && <PropietarioModal existente={modal.fila} onClose={crud.cerrar} />}
      {modal?.tipo === 'eliminar' && (
        <ConfirmarEliminar
          objeto={`el propietario ${modal.fila.nombre}`}
          detalle={
            modal.fila.contratos > 0
              ? `Figura en ${modal.fila.contratos} contrato(s): quitalo de ellos antes de eliminarlo.`
              : modal.fila.inmuebles > 0
                ? `Es dueño de ${modal.fila.inmuebles} inmueble(s): quitaselos en su formulario antes de eliminarlo.`
                : undefined
          }
          eliminar={() => deleteContraparte('propietario', modal.fila.nit)}
          onClose={crud.cerrar}
        />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 22 }}>
        <SoftCard label="Propietarios" value={String(kpis?.totalArrendadores ?? 0)} />
        <SoftCard
          label="Giro mensual"
          value={formatCurrencyCompact(kpis?.giroMensualTotal ?? 0)}
          tone="accent"
          help="Suma del canon de sus contratos"
        />
        <SoftCard label="Inmuebles representados" value={String(kpis?.inmueblesRepresentados ?? 0)} />
      </div>

      {isError ? (
        <div style={{ padding: 24, color: 'var(--danger)' }}>No se pudieron cargar los propietarios.</div>
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
            emptyTitle="Sin propietarios"
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
