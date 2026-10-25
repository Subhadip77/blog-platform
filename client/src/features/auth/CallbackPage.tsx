import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Spinner } from '../../components/Spinner';
import { useAuth } from './AuthContext';

export default function CallbackPage() {
  const { restore } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // StrictMode runs effects twice in dev
    ran.current = true;

    const error = params.get('error');
    if (error) {
      toast.error(error);
      navigate('/login', { replace: true });
      return;
    }
    // The server already set the httpOnly cookie, so we only exchange it for an access token.
    void restore().then((ok) => {
      if (!ok) toast.error('Login failed, please try again');
      navigate(ok ? '/' : '/login', { replace: true });
    });
  }, [params, restore, navigate]);

  return <Spinner />;
}