import { useAuth } from './features/auth/AuthContext';

export default function App() {
  const { user, status, login, logout } = useAuth();
  if (status === 'loading') return <p className="p-8 text-muted">Loading...</p>;
  return (
    <div className="mx-auto max-w-md p-8">
      <p className="mb-4">Status: <b>{status}</b> {user && `(${user.name}, ${user.role})`}</p>
      {user ? (
        <button className="rounded bg-danger px-4 py-2 text-white" onClick={logout}>Logout</button>
      ) : (
        <button
          className="rounded bg-primary px-4 py-2 text-white hover:bg-primary-hover"
          onClick={() => login({ email: 'usera@example.com', password: 'Passw0rdOK' })}
        >
          Test login
        </button>
      )}
    </div>
  );
}