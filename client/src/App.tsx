import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Spinner } from './components/Spinner';
import CallbackPage from './features/auth/CallbackPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import PublicLayout from './layouts/PublicLayout';
import RequireAuth from './layouts/RequireAuth';
import RequireRole from './layouts/RequireRole';
import PostListPage from './features/posts/PostListPage';
import PostDetailPage from './features/posts/PostDetailPage';
import PostFormPage from './features/posts/PostFormPage';


const AdminLayout = lazy(() => import('./features/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./features/admin/DashboardPage'));
const UsersPage = lazy(() => import('./features/admin/UsersPage'));
const AdminPostsPage = lazy(() => import('./features/admin/PostsPage'));
const CommentsPage = lazy(() => import('./features/admin/CommentsPage'));
const AuditPage = lazy(() => import('./features/admin/AuditPage'));




export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<PostListPage />} />
            <Route path="posts/:slug" element={<PostDetailPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="auth/callback" element={<CallbackPage />} />

            <Route element={<RequireAuth />}>
                <Route element={<RequireRole role="admin" />}>
                    <Route path="admin" element={<AdminLayout />}>
                    <Route index element={<DashboardPage />} />
                    <Route path="users" element={<UsersPage />} />
                    <Route path="posts" element={<AdminPostsPage />} />
                    <Route path="comments" element={<CommentsPage />} />
                    <Route path="audit" element={<AuditPage />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<h1 className="p-8 text-muted">404 Page not found</h1>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}