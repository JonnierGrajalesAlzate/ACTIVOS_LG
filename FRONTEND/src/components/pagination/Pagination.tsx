import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

function buildPageSequence(current: number, totalPages: number): Array<number | '...'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: Array<number | '...'> = [];
  let prev = 0;
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('...');
    result.push(p);
    prev = p;
  }
  return result;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={styles.bar}>
      {buildPageSequence(page, totalPages).map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`}>...</span>
        ) : (
          <button
            key={p}
            type="button"
            className={`${styles.page} ${p === page ? styles.pageActive : ''}`}
            onClick={() => p !== page && onPageChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <span className={styles.summary}>
        {from}-{to} de {total}
      </span>
    </div>
  );
}
