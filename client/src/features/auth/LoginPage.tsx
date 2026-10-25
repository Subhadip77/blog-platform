import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { errorMessage } from '../../lib/http';
import { useAuth } from './AuthContext';
import { loginSchema, type LoginForm } from './schemas';
import { SocialButtons } from './SocialButtons';
import { PasswordInput } from '../../components/PasswordInput';

const input = 'w-full rounded border border-line bg-surface px-3 py-2 outline-none focus:border-primary';

export default function LoginPage() {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/';
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (status === 'authenticated') return <Navigate to={from} replace />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  });

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-line bg-surface p-6">
      <h1 className="mb-4 text-xl font-semibold">Log in</h1>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        <div>
          <input {...register('email')} type="email" placeholder="Email" className={input} />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>
        <div>
          <PasswordInput {...register('password')} placeholder="Password" />
        </div>
        <button disabled={isSubmitting} className="w-full rounded bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Signing in...' : 'Log in'}
        </button>
      </form>
      <SocialButtons />
      <p className="mt-4 text-center text-sm text-muted">
        No account? <Link to="/register" className="text-primary hover:underline">Sign up</Link>
      </p>
    </div>
  );
}