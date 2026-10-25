import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';

export default function PublicLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-between p-4">
          <Link to="/" className="text-lg font-bold text-primary">Blog Platform</Link>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                {user.role === 'admin' && <Link to="/admin" className="hover:text-primary">Admin</Link>}
                <span className="text-muted">{user.name}</span>
                <button onClick={logout} className="text-danger hover:underline">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary">Login</Link>
                <Link to="/register" className="rounded bg-primary px-3 py-1.5 text-white hover:bg-primary-hover">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl p-4">
        <Outlet />
      </main>
    </div>
  );
}