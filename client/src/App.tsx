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


// Regular users never download the admin bundle.
const AdminHome = lazy(() => import('./features/admin/AdminHome'));





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
                <Route path="posts/new" element={<PostFormPage />} />
                <Route path="posts/:slug/edit" element={<PostFormPage />} />
                <Route element={<RequireRole role="admin" />}>
                    <Route path="admin" element={<AdminHome />} />
                </Route>
            </Route>

            <Route path="*" element={<h1 className="p-8 text-muted">404 Page not found</h1>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}