import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Spinner } from '../../components/Spinner';
import { errorMessage } from '../../lib/http';
import type { Post } from '../../lib/types';
import { useAuth } from '../auth/AuthContext';
import { useCreatePost, usePost, useUpdatePost } from './hooks';

const schema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters').max(150),
  content: z.string().trim().min(10, 'At least 10 characters').max(20000),
});
type Values = z.infer<typeof schema>;

const field = 'w-full rounded border border-line bg-surface px-3 py-2 outline-none focus:border-primary';

function PostForm({ post }: { post?: Post }) {
  const navigate = useNavigate();
  const create = useCreatePost();
  const update = useUpdatePost();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { title: post?.title ?? '', content: post?.content ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const saved = post ? await update.mutateAsync({ id: post._id, ...values }) : await create.mutateAsync(values);
      toast.success(post ? 'Post updated' : 'Post published');
      navigate(`/posts/${saved.slug}`);
    } catch (e) {
      toast.error(errorMessage(e));
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <h1 className="text-2xl font-semibold">{post ? 'Edit post' : 'New post'}</h1>
      <div>
        <input {...register('title')} placeholder="Title" className={field} />
        {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
      </div>
      <div>
        <textarea {...register('content')} rows={12} placeholder="Write your post..." className={`${field} font-serif`} />
        {errors.content && <p className="mt-1 text-xs text-danger">{errors.content.message}</p>}
      </div>
      <button disabled={isSubmitting} className="rounded bg-primary px-5 py-2 font-medium text-white hover:bg-primary-hover disabled:opacity-60">
        {isSubmitting ? 'Saving...' : post ? 'Save changes' : 'Publish'}
      </button>
    </form>
  );
}

export default function PostFormPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { data: post, isLoading, isError } = usePost(slug ?? '');

  if (!slug) return <PostForm />; // create mode
  if (isLoading) return <Spinner />;
  if (isError || !post) return <p className="text-danger">Post not found.</p>;
  // UX guard only. The API enforces ownership for real.
  if (user?.role !== 'admin' && post.author?._id !== user?._id) return <p className="text-danger">You can only edit your own posts.</p>;
  return <PostForm post={post} />; // form mounts only after data exists, so defaultValues are correct
}