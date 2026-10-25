import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/posts', label: 'Posts' },
  { to: '/admin/comments', label: 'Comments' },
  { to: '/admin/audit', label: 'Activity log' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col bg-sidebar p-4 text-sidebar-text">
        <p className="mb-6 text-lg font-bold text-white">Admin</p>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded px-3 py-2 text-sm ${isActive ? 'bg-white/10 font-medium text-sidebar-accent' : 'hover:bg-white/5'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mb-2 text-sm hover:text-white">Back to site</Link>
        <p className="truncate text-xs">{user?.name}</p>
        <button onClick={logout} className="mt-1 text-left text-sm text-danger hover:underline">Logout</button>
      </aside>
      <main className="min-w-0 flex-1 p-6"><Outlet /></main>
    </div>
  );
}