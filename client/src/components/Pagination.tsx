import type { PageMeta } from '../lib/types';

export function Pagination({ meta, onPage }: { meta: PageMeta; onPage: (p: number) => void }) {
  if (meta.totalPages <= 1) return null;
  const btn = 'rounded border border-line bg-surface px-3 py-1.5 text-sm hover:bg-page disabled:opacity-50';
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button className={btn} disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Previous</button>
      <span className="text-sm text-muted">Page {meta.page} of {meta.totalPages}</span>
      <button className={btn} disabled={meta.page >= meta.totalPages} onClick={() => onPage(meta.page + 1)}>Next</button>
    </div>
  );
}