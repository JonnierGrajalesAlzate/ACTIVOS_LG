import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CATALOGOS_KEY, fetchCatalogos, type Contraparte } from '../api/catalogos';
import { deleteContraparte, deleteContrato, fetchContratos, type ContratoListItem } from '../api/contrapartes';
import { DIAS_ALERTA_VENCIMIENTO } from '../api/resumen';
import { usePermisos } from '../auth/permisos';
import { SectionTitle } from '../components/cards/Cards';
import { ContraparteModal } from '../components/contrapartes/ContraparteModal';
import { ContratoModal } from '../components/contratos/ContratoModal';
import { ConfirmarEliminar } from '../components/crud/ConfirmarEliminar';
import { RowActions } from '../components/crud/RowActions';
import { useCrud } from '../components/crud/useCrud';
import { FilterChipRow, type ChipOption } from '../components/filters/FilterChipRow';
import { FiltroBoton, FiltrosBar, ProyectoFiltro, SelectFiltro } from '../components/filters/SelectFiltro';
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

function ContratoCard({
  c,
  actions,
  onArrendatario,
}: {
  c: ContratoListItem;
  actions: ReactNode;
  /** Filtra la vista por el arrendatario del contrato. */
  onArrendatario?: () => void;
}) {
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
        <div className={styles.blockValue}>
          {c.arrendatario && onArrendatario ? (
            <button
              type="button"
              className={styles.arrendatarioLink}
              onClick={onArrendatario}
              title="Ver solo los contratos de este arrendatario"
            >
              {c.arrendatario}
            </button>
          ) : (
            (c.arrendatario ?? '—')
          )}
        </div>
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

      {actions}
    </div>
  );
}

type ModalArrendatario = { tipo: 'crear' } | { tipo: 'editar' | 'eliminar'; arrendatario: Contraparte };

/**
 * Contratos y arrendatarios en una sola vista: cada contrato muestra su arrendatario y el filtro de
 * arrendatario hace de ficha (sus contratos, canon y vencimientos). Los arrendatarios se crean,
 * renombran y eliminan desde ese filtro.
 */
export function ContratosPage() {
  // Proyecto y arrendatario viven en la URL para poder recargar o compartir la vista filtrada.
  const [searchParams, setSearchParams] = useSearchParams();
  const proyecto = searchParams.get('proyecto') ?? '';
  const arrendatario = searchParams.get('arrendatario') ?? '';
  const [search, setSearch] = useState('');
  const [gestion, setGestion] = useState(TODOS);
  const [page, setPage] = useState(1);
  const crud = useCrud<ContratoListItem>();
  const { modal } = crud;
  const [modalArrendatario, setModalArrendatario] = useState<ModalArrendatario | null>(null);
  const { puedeEditar } = usePermisos();
  const debouncedSearch = useDebouncedValue(search, 250);

  const { data: cat } = useQuery({ queryKey: CATALOGOS_KEY, queryFn: fetchCatalogos });
  const arrendatarioActual = cat?.arrendatarios.find((a) => a.nit === arrendatario);

  const setFiltro = (clave: 'proyecto' | 'arrendatario', value: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('vista');
      if (value) next.set(clave, value);
      else next.delete(clave);
      return next;
    });
    setPage(1);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['contratos', { proyecto, arrendatario, debouncedSearch, gestion, page }],
    queryFn: () =>
      fetchContratos({
        proyecto: proyecto ? Number(proyecto) : undefined,
        arrendatario: arrendatario || undefined,
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
      <Header
        meta={pageMeta.contratos}
        searchValue={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        onAction={puedeEditar ? crud.crear : undefined}
      />
      {modal?.tipo === 'crear' && <ContratoModal onClose={crud.cerrar} arrendatarioInicial={arrendatario || undefined} />}
      {modal?.tipo === 'editar' && <ContratoModal id={modal.fila.id} onClose={crud.cerrar} />}
      {modal?.tipo === 'eliminar' && (
        <ConfirmarEliminar
          objeto={`el contrato de ${modal.fila.inmueble} (${modal.fila.proyecto})${
            modal.fila.arrendatario ? ` con ${modal.fila.arrendatario}` : ''
          }`}
          detalle="Tambien se elimina su historial de incrementos de canon. El estado del inmueble no cambia."
          eliminar={() => deleteContrato(modal.fila.id)}
          onClose={crud.cerrar}
        />
      )}
      {modalArrendatario?.tipo === 'crear' && (
        <ContraparteModal tipo="arrendatario" onClose={() => setModalArrendatario(null)} />
      )}
      {modalArrendatario?.tipo === 'editar' && (
        <ContraparteModal
          tipo="arrendatario"
          existente={modalArrendatario.arrendatario}
          onClose={() => setModalArrendatario(null)}
        />
      )}
      {modalArrendatario?.tipo === 'eliminar' && (
        <ConfirmarEliminar
          objeto={`el arrendatario ${modalArrendatario.arrendatario.nombre}`}
          detalle="Solo se puede eliminar si no figura en ningun contrato."
          eliminar={async () => {
            await deleteContraparte('arrendatario', modalArrendatario.arrendatario.nit);
            setFiltro('arrendatario', '');
          }}
          onClose={() => setModalArrendatario(null)}
        />
      )}

      <FiltrosBar>
        <ProyectoFiltro value={proyecto} onChange={(v) => setFiltro('proyecto', v)} />
        <SelectFiltro
          label="Arrendatario"
          value={arrendatario}
          onChange={(v) => setFiltro('arrendatario', v)}
          todos="Todos los arrendatarios"
          options={(cat?.arrendatarios ?? []).map((a) => ({ value: a.nit, label: `${a.nombre} · ${a.nit}` }))}
        >
          {puedeEditar && arrendatarioActual && (
            <>
              <FiltroBoton onClick={() => setModalArrendatario({ tipo: 'editar', arrendatario: arrendatarioActual })}>
                Editar
              </FiltroBoton>
              <FiltroBoton danger onClick={() => setModalArrendatario({ tipo: 'eliminar', arrendatario: arrendatarioActual })}>
                Eliminar
              </FiltroBoton>
            </>
          )}
          {puedeEditar && (
            <FiltroBoton onClick={() => setModalArrendatario({ tipo: 'crear' })}>+ Nuevo arrendatario</FiltroBoton>
          )}
        </SelectFiltro>
      </FiltrosBar>

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
            {!isLoading &&
              items.map((c) => (
                <ContratoCard
                  key={c.id}
                  c={c}
                  onArrendatario={
                    c.nitArrendatario && c.nitArrendatario !== arrendatario
                      ? () => setFiltro('arrendatario', c.nitArrendatario!)
                      : undefined
                  }
                  actions={
                    <RowActions
                      label={`contrato de ${c.inmueble}`}
                      onEdit={() => crud.editar(c)}
                      onDelete={() => crud.eliminar(c)}
                    />
                  }
                />
              ))}
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
