import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { formatDate } from '../../lib/format';
import { errorMessage } from '../../lib/http';
import { adminApi } from './api';
import { Badge, btn, Table, td } from './ui';

export default function PostsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'posts', page, status],
    queryFn: () => adminApi.posts(page, status),
    placeholderData: keepPreviousData,
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ['admin'] });
    void qc.invalidateQueries({ queryKey: ['posts'] }); // keep the public feed in sync
  };
  const onError = (e: unknown) => toast.error(errorMessage(e));
  const restore = useMutation({ mutationFn: adminApi.restorePost, onSuccess: () => { toast.success('Post restored'); refresh(); }, onError });
  const remove = useMutation({ mutationFn: adminApi.deletePost, onSuccess: () => { toast.success('Post deleted'); refresh(); }, onError });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Posts</h1>
      <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        className="mb-4 rounded border border-line bg-surface px-3 py-2 text-sm">
        <option value="all">All</option><option value="active">Active</option><option value="deleted">Deleted</option>
      </select>

      {isLoading ? <Spinner /> : (
        <Table head={['Title', 'Author', 'Created', 'Status', 'Actions']}>
          {data?.items.map((p) => (
            <tr key={p._id}>
              <td className={td}>{p.deletedAt ? p.title : <Link to={`/posts/${p.slug}`} className="text-primary hover:underline">{p.title}</Link>}</td>
              <td className={td}>{p.author?.name ?? 'Unknown'}</td>
              <td className={td}>{formatDate(p.createdAt)}</td>
              <td className={td}><Badge tone={p.deletedAt ? 'bad' : 'ok'}>{p.deletedAt ? 'Deleted' : 'Active'}</Badge></td>
              <td className={td}>
                {p.deletedAt ? (
                  <button className={`${btn} text-success`} onClick={() => restore.mutate(p._id)}>Restore</button>
                ) : (
                  <button className={`${btn} text-danger`} onClick={() => window.confirm('Delete this post?') && remove.mutate(p._id)}>Delete</button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}