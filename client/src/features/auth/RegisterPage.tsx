import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { errorMessage } from '../../lib/http';
import { useAuth } from './AuthContext';
import { registerSchema, type RegisterForm } from './schemas';
import { SocialButtons } from './SocialButtons';

const input = 'w-full rounded border border-line bg-surface px-3 py-2 outline-none focus:border-primary';

export default function RegisterPage() {
  const { register: signUp, status } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  if (status === 'authenticated') return <Navigate to="/" replace />;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp(values);
      navigate('/', { replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
    }
  });

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-lg border border-line bg-surface p-6">
      <h1 className="mb-4 text-xl font-semibold">Create account</h1>
      <form onSubmit={onSubmit} className="space-y-3" noValidate>
        {(['name', 'email', 'password'] as const).map((f) => (
          <div key={f}>
            <input
              {...register(f)}
              type={f === 'password' ? 'password' : f === 'email' ? 'email' : 'text'}
              placeholder={f[0]!.toUpperCase() + f.slice(1)}
              className={input}
            />
            {errors[f] && <p className="mt-1 text-xs text-danger">{errors[f]?.message}</p>}
          </div>
        ))}
        <button disabled={isSubmitting} className="w-full rounded bg-primary px-4 py-2 font-medium text-white hover:bg-primary-hover disabled:opacity-60">
          {isSubmitting ? 'Creating...' : 'Sign up'}
        </button>
      </form>
      <SocialButtons />
      <p className="mt-4 text-center text-sm text-muted">
        Have an account? <Link to="/login" className="text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}