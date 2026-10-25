import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Pagination } from '../../components/Pagination';
import { Spinner } from '../../components/Spinner';
import { formatDate } from '../../lib/format';
import { errorMessage } from '../../lib/http';
import type { Comment } from '../../lib/types';
import { useAuth } from '../auth/AuthContext';
import { commentsApi } from './api';

const box = 'w-full rounded border border-line bg-surface px-3 py-2 outline-none focus:border-primary';

function CommentItem({ c, onChange }: { c: Comment; onChange: () => void }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(c.content);
  const canModify = !!user && (user.role === 'admin' || user._id === c.author?._id);

  const edit = useMutation({
    mutationFn: () => commentsApi.edit(c._id, text),
    onSuccess: () => { setEditing(false); onChange(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => commentsApi.remove(c._id),
    onSuccess: onChange,
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <li className="rounded-lg border border-line bg-surface p-3">
      <p className="text-sm text-muted">{c.author?.name ?? 'Unknown'} · {formatDate(c.createdAt)}</p>
      {editing ? (
        <div className="mt-2 space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={box} />
          <div className="flex gap-3 text-sm">
            <button disabled={edit.isPending || !text.trim()} onClick={() => edit.mutate()} className="text-primary hover:underline">Save</button>
            <button onClick={() => { setEditing(false); setText(c.content); }} className="text-muted hover:underline">Cancel</button>
          </div>
        </div>
      ) : (
        <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
      )}
      {canModify && !editing && (
        <div className="mt-2 flex gap-3 text-sm">
          <button onClick={() => setEditing(true)} className="text-primary hover:underline">Edit</button>
          <button onClick={() => window.confirm('Delete this comment?') && remove.mutate()} className="text-danger hover:underline">Delete</button>
        </div>
      )}
    </li>
  );
}

export function CommentSection({ postId }: { postId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [text, setText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['comments', postId, page],
    queryFn: () => commentsApi.list(postId, page),
    placeholderData: keepPreviousData,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ['comments', postId] });

  const add = useMutation({
    mutationFn: () => commentsApi.add(postId, text.trim()),
    onSuccess: () => { setText(''); setPage(1); void refresh(); }, // newest first, so jump to page 1
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <section className="mt-10 border-t border-line pt-6">
      <h2 className="mb-4 text-xl font-semibold">Comments {data ? `(${data.meta.total})` : ''}</h2>

      {user ? (
        <div className="mb-6 space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={1000} placeholder="Add a comment..." className={box} />
          <button disabled={add.isPending || !text.trim()} onClick={() => add.mutate()} className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover disabled:opacity-60">
            {add.isPending ? 'Posting...' : 'Comment'}
          </button>
        </div>
      ) : (
        <p className="mb-6 text-sm text-muted"><Link to="/login" className="text-primary underline">Log in</Link> to comment.</p>
      )}

      {isLoading && <Spinner />}
      {data && data.items.length === 0 && <p className="text-muted">No comments yet.</p>}
      <ul className="space-y-3">{data?.items.map((c) => <CommentItem key={c._id} c={c} onChange={refresh} />)}</ul>
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </section>
  );
}