import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Spinner } from '../../components/Spinner';
import { formatDate } from '../../lib/format';
import { errorMessage } from '../../lib/http';
import { CommentSection } from '../comments/CommentSection';
import { useAuth } from '../auth/AuthContext';
import { useDeletePost, usePost } from './hooks';

export default function PostDetailPage() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: post, isLoading, isError } = usePost(slug);
  const del = useDeletePost();

  if (isLoading) return <Spinner />;
  if (isError || !post) return <p className="text-muted">Post not found. <Link to="/" className="text-primary underline">Back home</Link></p>;

  const canModify = !!user && (user.role === 'admin' || user._id === post.author?._id);

  const onDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await del.mutateAsync(post._id);
      toast.success('Post deleted');
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  return (
    <article>
      <h1 className="text-3xl font-bold">{post.title}</h1>
      <p className="mt-2 text-sm text-muted">by {post.author?.name ?? 'Unknown'} · {formatDate(post.createdAt)}</p>
      {canModify && (
        <div className="mt-3 flex gap-3 text-sm">
          <Link to={`/posts/${post.slug}/edit`} className="text-primary hover:underline">Edit</Link>
          <button onClick={onDelete} disabled={del.isPending} className="text-danger hover:underline">Delete</button>
        </div>
      )}
      {/* whitespace-pre-wrap keeps line breaks. React escapes the text, so there is no XSS risk. */}
      <div className="mt-6 whitespace-pre-wrap font-serif text-lg leading-relaxed">{post.content}</div>
      <CommentSection postId={post._id} />
    </article>
  );
}