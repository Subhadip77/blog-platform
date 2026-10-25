import { http } from '../../lib/http';
import type { PageMeta, Role, Comment } from '../../lib/types';

export interface Stats { users: number; posts: number; comments: number; deletedPosts: number }
export interface AdminUser { _id: string; name: string; email: string; role: Role; isActive: boolean; createdAt: string }
export interface AdminPost {
  _id: string; title: string; slug: string; createdAt: string; deletedAt?: string;
  author: { _id: string; name: string; email: string } | null;
}
export interface AdminComment extends Comment { post: { title: string; slug: string } | null }
export interface AuditLog {
  _id: string; action: string; targetType?: string; ip?: string; createdAt: string;
  actor: { _id: string; name: string } | null;
}

type Page<T> = { items: T[]; meta: PageMeta };
const page = <T,>(r: { data: { data: T[]; meta: PageMeta } }): Page<T> => ({ items: r.data.data, meta: r.data.meta });

export const adminApi = {
  stats: () => http.get('/admin/stats').then((r) => r.data.data as Stats),
  users: (p: number, search?: string, role?: string) =>
    http.get('/admin/users', { params: { page: p, limit: 10, search: search || undefined, role: role || undefined } }).then(page<AdminUser>),
  setRole: (id: string, role: Role) => http.patch(`/admin/users/${id}/role`, { role }),
  setStatus: (id: string, isActive: boolean) => http.patch(`/admin/users/${id}/status`, { isActive }),
  posts: (p: number, status: string) =>
    http.get('/admin/posts', { params: { page: p, limit: 10, status } }).then(page<AdminPost>),
  restorePost: (id: string) => http.post(`/admin/posts/${id}/restore`),
  deletePost: (id: string) => http.delete(`/posts/${id}`), // same endpoint as users: the API lets admins through
  comments: (p: number) => http.get('/admin/comments', { params: { page: p, limit: 10 } }).then(page<AdminComment>),
  deleteComment: (id: string) => http.delete(`/comments/${id}`),
  audit: (p: number, action?: string) =>
    http.get('/admin/audit-logs', { params: { page: p, limit: 15, action: action || undefined } }).then(page<AuditLog>),
};