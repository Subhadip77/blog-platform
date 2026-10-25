import type { ReactNode } from 'react';

export const th = 'px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted';
export const td = 'px-3 py-2 text-sm';
export const btn = 'text-sm hover:underline';

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full">
        <thead className="border-b border-line bg-page">
          <tr>{head.map((h) => <th key={h} className={th}>{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function Badge({ tone, children }: { tone: 'ok' | 'bad' | 'info'; children: ReactNode }) {
  const c = { ok: 'bg-success/10 text-success', bad: 'bg-danger/10 text-danger', info: 'bg-primary/10 text-primary' }[tone];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c}`}>{children}</span>;
}