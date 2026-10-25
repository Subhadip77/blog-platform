import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { errorMessage } from '../../lib/http';
import { useDebounce } from '../../lib/useDebounce';
import type { Role } from '../../lib/types';
import { useAuth } from '../auth/AuthContext';
import { adminApi } from './api';
import { Badge, btn, Table, td } from './ui';

export default function UsersPage() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const q = useDebounce(search.trim());

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, q, role],
    queryFn: () => adminApi.users(page, q, role),
    placeholderData: keepPreviousData,
  });

  const done = { onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }), onError: (e: unknown) => toast.error(errorMessage(e)) };
  const changeRole = useMutation({ mutationFn: (v: { id: string; role: Role }) => adminApi.setRole(v.id, v.role), ...done });
  const changeStatus = useMutation({ mutationFn: (v: { id: string; isActive: boolean }) => adminApi.setStatus(v.id, v.isActive), ...done });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Users</h1>
      <div className="mb-4 flex gap-3">
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search name or email"
          className="w-64 rounded border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-primary" />
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded border border-line bg-surface px-3 py-2 text-sm">
          <option value="">All roles</option><option value="user">User</option><option value="admin">Admin</option>
        </select>
      </div>

      {isLoading ? <Spinner /> : (
        <Table head={['Name', 'Email', 'Role', 'Status', 'Actions']}>
          {data?.items.map((u) => {
            const self = u._id === me?._id; // the API blocks self-changes too
            return (
              <tr key={u._id}>
                <td className={td}>{u.name}</td>
                <td className={td}>{u.email}</td>
                <td className={td}><Badge tone="info">{u.role}</Badge></td>
                <td className={td}><Badge tone={u.isActive ? 'ok' : 'bad'}>{u.isActive ? 'Active' : 'Disabled'}</Badge></td>
                <td className={`${td} space-x-3`}>
                  {self ? <span className="text-muted">You</span> : (
                    <>
                      <button className={`${btn} text-primary`}
                        onClick={() => changeRole.mutate({ id: u._id, role: u.role === 'admin' ? 'user' : 'admin' })}>
                        Make {u.role === 'admin' ? 'user' : 'admin'}
                      </button>
                      <button className={`${btn} ${u.isActive ? 'text-danger' : 'text-success'}`}
                        onClick={() => changeStatus.mutate({ id: u._id, isActive: !u.isActive })}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}