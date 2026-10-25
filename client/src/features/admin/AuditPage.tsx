import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { adminApi } from './api';
import { Table, td } from './ui';

const ACTIONS = ['user.login', 'user.login_failed', 'user.registered', 'auth.token_reuse_detected', 'post.created',
  'post.updated', 'post.deleted', 'post.restored', 'comment.created', 'comment.deleted', 'admin.user_role_changed', 'admin.user_status_changed'];

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', page, action],
    queryFn: () => adminApi.audit(page, action),
    placeholderData: keepPreviousData,
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Activity log</h1>
      <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
        className="mb-4 rounded border border-line bg-surface px-3 py-2 text-sm">
        <option value="">All actions</option>
        {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
      {isLoading ? <Spinner /> : (
        <Table head={['When', 'Action', 'User', 'IP']}>
          {data?.items.map((l) => (
            <tr key={l._id}>
              <td className={td}>{new Date(l.createdAt).toLocaleString()}</td>
              <td className={`${td} font-mono text-xs`}>{l.action}</td>
              <td className={td}>{l.actor?.name ?? <span className="text-muted">anonymous</span>}</td>
              <td className={`${td} text-muted`}>{l.ip ?? '-'}</td>
            </tr>
          ))}
        </Table>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}