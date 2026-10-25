import { Link, useSearchParams } from 'react-router-dom';
import { Spinner } from '../../components/Spinner';
import { Pagination } from '../../components/Pagination';
import { formatDate } from '../../lib/format';
import { useAuth } from '../auth/AuthContext';
import { usePosts } from './hooks';

export default function PostListPage() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page')) || 1); // page lives in the URL, so it survives reload and sharing
  const { data, isLoading, isError, refetch } = usePosts(page);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Latest posts</h1>
        {user && <Link to="/posts/new" className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary-hover">Write a post</Link>}
      </div>

      {isLoading && <Spinner />}
      {isError && (
        <p className="text-danger">Could not load posts. <button className="underline" onClick={() => refetch()}>Retry</button></p>
      )}
      {data && data.items.length === 0 && <p className="text-muted">No posts yet. Be the first to write one.</p>}

      <ul className="space-y-3">
        {data?.items.map((p) => (
          <li key={p._id} className="rounded-lg border border-line bg-surface p-4 hover:border-primary">
            <Link to={`/posts/${p.slug}`} className="text-lg font-semibold">{p.title}</Link>
            <p className="mt-1 text-sm text-muted">by {p.author?.name ?? 'Unknown'} · {formatDate(p.createdAt)}</p>
          </li>
        ))}
      </ul>

      {data && <Pagination meta={data.meta} onPage={(n) => setParams({ page: String(n) })} />}
    </div>
  );
}