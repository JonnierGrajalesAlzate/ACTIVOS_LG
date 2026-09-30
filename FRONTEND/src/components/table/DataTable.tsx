import type { ReactNode } from 'react';
import styles from './DataTable.module.css';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  sortField?: string;
  sortDir?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  emptyTitle?: string;
  emptyHelp?: string;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  sortField,
  sortDir,
  onSortChange,
  emptyTitle = 'Sin resultados',
  emptyHelp = 'No hay registros que coincidan con el filtro actual.',
  skeletonRows = 6,
}: DataTableProps<T>) {
  const showEmpty = !loading && rows.length === 0;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${styles.th} ${col.align === 'right' ? styles.thRight : ''} ${
                  col.sortable ? styles.thSortable : ''
                }`}
                onClick={col.sortable && onSortChange ? () => onSortChange(col.key) : undefined}
              >
                {col.header}
                {col.sortable && sortField === col.key ? (sortDir === 'desc' ? ' ▼' : ' ▲') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: skeletonRows }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    <div className={styles.skeletonCell} />
                  </td>
                ))}
              </tr>
            ))}
          {!loading &&
            rows.map((row) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((col) => (
                  <td key={col.key} className={`${styles.td} ${col.align === 'right' ? styles.tdRight : ''}`}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
      {showEmpty && (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateTitle}>{emptyTitle}</div>
          <div className={styles.emptyStateHelp}>{emptyHelp}</div>
        </div>
      )}
    </div>
  );
}
