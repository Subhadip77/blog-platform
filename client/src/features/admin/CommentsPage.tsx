import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { formatDate } from '../../lib/format';
import { errorMessage } from '../../lib/http';
import { adminApi } from './api';
import { btn, Table, td } from './ui';

export default function CommentsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'comments', page],
    queryFn: () => adminApi.comments(page),
    placeholderData: keepPreviousData,
  });
  const remove = useMutation({
    mutationFn: adminApi.deleteComment,
    onSuccess: () => { toast.success('Comment deleted'); void qc.invalidateQueries({ queryKey: ['admin'] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">Comments</h1>
      {isLoading ? <Spinner /> : (
        <Table head={['Comment', 'Author', 'Post', 'Date', 'Actions']}>
          {data?.items.map((c) => (
            <tr key={c._id}>
              <td className={`${td} max-w-xs truncate`}>{c.content}</td>
              <td className={td}>{c.author?.name ?? 'Unknown'}</td>
              <td className={td}>{c.post?.title ?? <span className="text-muted">(deleted post)</span>}</td>
              <td className={td}>{formatDate(c.createdAt)}</td>
              <td className={td}>
                <button className={`${btn} text-danger`} onClick={() => window.confirm('Delete this comment?') && remove.mutate(c._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </Table>
      )}
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}