import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, History, MessageSquareText, X } from 'lucide-react';
import {
  SIN_ETAPA,
  deleteInmueble,
  fetchEtapas,
  fetchInmuebles,
  fetchProyectos,
  type InmuebleListItem,
} from '../api/inmuebles';
import { ConfirmarEliminar } from '../components/crud/ConfirmarEliminar';
import { RowActions } from '../components/crud/RowActions';
import { useCrud } from '../components/crud/useCrud';
import { FilterChipRow, type ChipOption } from '../components/filters/FilterChipRow';
import { FiltroBoton } from '../components/filters/SelectFiltro';
import { HistorialInmuebleModal } from '../components/inmuebles/HistorialInmuebleModal';
import { InmuebleModal } from '../components/inmuebles/InmuebleModal';
import { EtapaModal } from '../components/proyectos/EtapaModal';
import { usePermisos } from '../auth/permisos';
import { Header } from '../components/layout/Header';
import { KpiStrip } from '../components/kpi/KpiStrip';
import { Pagination } from '../components/pagination/Pagination';
import { DataTable, type DataTableColumn } from '../components/table/DataTable';
import { pageMeta } from '../nav/navConfig';
import { DIAS_ALERTA_VENCIMIENTO } from '../api/resumen';
import { formatArea, formatCurrency, formatCurrencyCompact, formatDate, formatPercent } from '../utils/format';
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
  // La etapa vive en la URL junto al proyecto para que el filtro sobreviva recargas y se pueda compartir.
  const etapaId = proyectoId !== undefined && searchParams.get('etapa') ? Number(searchParams.get('etapa')) : undefined;

  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState<string>(TODOS);
  // Checklist de leasing: marcar solo una opcion filtra; ninguna o ambas muestran todos.
  const [conLeasing, setConLeasing] = useState(false);
  const [sinLeasing, setSinLeasing] = useState(false);
  const leasing = conLeasing === sinLeasing ? undefined : conLeasing ? 'si' : 'no';
  const [page, setPage] = useState(1);
  const [historial, setHistorial] = useState<InmuebleListItem | null>(null);
  const [agregarEtapa, setAgregarEtapa] = useState(false);
  const { puedeEditar, esAdmin } = usePermisos();
  const [sortField, setSortField] = useState('proyecto');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  // ?registrar=1 llega desde "Registrar proyecto": se abre el alta con ese proyecto ya elegido.
  const crud = useCrud<InmuebleListItem>(searchParams.get('registrar') === '1');
  const { modal } = crud;

  const cerrarAlta = () => {
    crud.cerrar();
    // Se quita el parametro para que recargar la pagina no vuelva a abrir el formulario.
    if (searchParams.has('registrar')) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('registrar');
          return next;
        },
        { replace: true },
      );
    }
  };

  const debouncedSearch = useDebouncedValue(search, 250);

  const { data: proyectos } = useQuery({ queryKey: ['proyectos'], queryFn: fetchProyectos });
  const proyectoNombre = proyectos?.find((p) => p.id === proyectoId)?.nombre;

  const { data: proyectoEtapas } = useQuery({
    queryKey: ['etapas', proyectoId],
    queryFn: () => fetchEtapas(proyectoId!),
    enabled: proyectoId !== undefined,
  });
  const etapas = proyectoEtapas?.etapas ?? [];
  const etapaNombre = etapas.find((e) => e.id === etapaId)?.nombre;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['inmuebles', { proyectoId, etapaId, debouncedSearch, estado, leasing, page, sortField, sortDir }],
    queryFn: () =>
      fetchInmuebles({
        proyecto: proyectoId,
        etapa: etapaId,
        q: debouncedSearch || undefined,
        estado: estado === TODOS ? undefined : estado,
        leasing,
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
      next.delete('etapa');
      return next;
    });
    setPage(1);
  };

  const setEtapa = (value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === TODOS) next.delete('etapa');
      else next.set('etapa', value);
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
    {
      key: 'local',
      header: 'Local',
      sortable: true,
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <b>{r.numeroLocal ?? '—'}</b>
          {r.observaciones && (
            <span title={r.observaciones} aria-label={`Observaciones: ${r.observaciones}`} style={{ color: 'var(--ink-4)', display: 'inline-flex' }}>
              <MessageSquareText size={14} strokeWidth={2} />
            </span>
          )}
        </span>
      ),
    },
    { key: 'nivel', header: 'Piso / nivel', sortable: true, render: (r) => r.nivel ?? '—' },
    {
      key: 'tipologia',
      header: 'Tipologia',
      sortable: true,
      render: (r) => (
        <>
          {r.tipologia}
          <span style={{ color: 'var(--ink-4)' }}> · {r.uso}</span>
        </>
      ),
    },
    {
      key: 'proyecto',
      header: 'Proyecto',
      sortable: true,
      render: (r) =>
        r.etapa ? (
          <>
            {r.proyecto} <span style={{ color: 'var(--ink-3)' }}>· {r.etapa}</span>
          </>
        ) : (
          r.proyecto
        ),
    },
    { key: 'arrendatario', header: 'Arrendatario', render: (r) => r.arrendatario ?? '—' },
    { key: 'area', header: 'Area', align: 'right', sortable: true, render: (r) => formatArea(r.areaM2) },
    { key: 'canon', header: 'Canon', align: 'right', sortable: true, render: (r) => formatCurrency(r.canonMensual) },
    {
      key: 'rental',
      header: 'Rental rate',
      align: 'right',
      sortable: true,
      render: (r) => (
        <span title="Canon mensual / valor comercial">{formatPercent(r.rentalRate)}</span>
      ),
    },
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
      key: 'leasing',
      header: 'Leasing',
      render: (r) =>
        r.tieneLeasing ? (
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Si</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>No</span>
        ),
    },
    {
      key: 'estado',
      header: 'Estado',
      align: 'right',
      sortable: true,
      render: (r) => <span style={{ color: estadoColor(r.estado), fontWeight: 700 }}>{r.estado}</span>,
    },
    {
      key: 'acciones',
      header: '',
      align: 'right',
      render: (r) => (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <button
            type="button"
            onClick={() => setHistorial(r)}
            aria-label={`Historial de ${r.nombre}`}
            title="Historial de contratos"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 30,
              height: 30,
              background: 'transparent',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--ink-3)',
            }}
          >
            <History size={15} strokeWidth={2} />
          </button>
          <RowActions label={r.nombre} onEdit={() => crud.editar(r)} onDelete={() => crud.eliminar(r)} />
        </span>
      ),
    },
  ];

  const kpis = data?.kpis;

  const estadoOptions: ChipOption<string>[] = [
    { value: TODOS, label: `Todos · ${data?.pagina.total ?? 0}` },
    ...(data?.estados ?? []).map((e) => ({ value: e.estado, label: `${e.estado} · ${e.conteo}` })),
  ];

  const etapaOptions: ChipOption<string>[] = [
    { value: TODOS, label: `Todas las etapas · ${etapas.reduce((acc, e) => acc + e.inmuebles, 0)}` },
    ...etapas.map((e) => ({ value: String(e.id), label: `${e.nombre} · ${e.inmuebles}` })),
  ];

  return (
    <div>
      <Header
        meta={pageMeta.inmuebles}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAction={puedeEditar ? crud.crear : undefined}
      />
      {historial && <HistorialInmuebleModal id={historial.id} nombre={historial.nombre} onClose={() => setHistorial(null)} />}
      {agregarEtapa && proyectoId !== undefined && (
        <EtapaModal proyectoId={proyectoId} proyectoNombre={proyectoNombre} onClose={() => setAgregarEtapa(false)} />
      )}
      {modal?.tipo === 'crear' && (
        <InmuebleModal
          onClose={cerrarAlta}
          proyectoInicial={proyectoId}
          etapaInicial={etapaId && etapaId !== SIN_ETAPA ? etapaId : undefined}
        />
      )}
      {modal?.tipo === 'editar' && <InmuebleModal id={modal.fila.id} onClose={crud.cerrar} />}
      {modal?.tipo === 'eliminar' && (
        <ConfirmarEliminar
          objeto={`el inmueble ${modal.fila.nombre} (${modal.fila.proyecto})`}
          detalle="Si tiene perfil de egresos, se elimina con el. No se puede eliminar si tiene contratos."
          eliminar={() => deleteInmueble(modal.fila.id)}
          onClose={crud.cerrar}
        />
      )}

      {proyectoId !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => navigate(etapas.length > 0 ? `/inicio/proyectos/${proyectoId}` : '/inicio')}
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
            {etapas.length > 0 ? 'Volver a etapas' : 'Volver a proyectos'}
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
            <span>
              Proyecto: {proyectoNombre ?? `#${proyectoId}`}
              {etapaNombre && ` · ${etapaNombre}`}
            </span>
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

          {esAdmin && <FiltroBoton onClick={() => setAgregarEtapa(true)}>+ Agregar etapa</FiltroBoton>}
        </div>
      )}

      <KpiStrip
        items={[
          { label: 'Canon', value: formatCurrencyCompact(kpis?.canonMensualTotal ?? 0), tone: 'accent' },
          { label: 'Area', value: formatArea(kpis?.areaTotalM2 ?? 0) },
          { label: 'Ocupacion', value: `${kpis?.ocupacionPorcentaje ?? 0}%` },
          { label: `Vencen ${DIAS_ALERTA_VENCIMIENTO} d.`, value: String(kpis?.vencenEn120Dias ?? 0) },
        ]}
      />

      {etapas && etapas.length > 0 && (
        <FilterChipRow
          options={etapaOptions}
          value={etapaId !== undefined ? String(etapaId) : TODOS}
          onChange={setEtapa}
        />
      )}

      <FilterChipRow
        options={estadoOptions}
        value={estado}
        onChange={(v) => {
          setEstado(v);
          setPage(1);
        }}
      />

      <fieldset style={{ display: 'flex', alignItems: 'center', gap: 18, border: 'none', margin: '4px 0 10px', padding: 0 }}>
        <legend style={{ float: 'left', marginRight: 4, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
          Leasing
        </legend>
        {[
          { label: 'Con leasing', checked: conLeasing, set: setConLeasing },
          { label: 'Sin leasing', checked: sinLeasing, set: setSinLeasing },
        ].map((o) => (
          <label
            key={o.label}
            style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: 'var(--ink-2)', cursor: 'pointer' }}
          >
            <input
              type="checkbox"
              checked={o.checked}
              onChange={(e) => {
                o.set(e.target.checked);
                setPage(1);
              }}
              style={{ width: 17, height: 17, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            {o.label}
          </label>
        ))}
      </fieldset>

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
