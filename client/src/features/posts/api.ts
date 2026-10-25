import { http } from '../../lib/http';
import type { PageMeta, Post, PostSummary } from '../../lib/types';

export interface PostInput { title: string; content: string }

export const postsApi = {
  list: (page: number, limit = 6) =>
    http.get('/posts', { params: { page, limit } }).then((r) => ({
      items: r.data.data as PostSummary[],
      meta: r.data.meta as PageMeta,
    })),
  get: (slug: string) => http.get(`/posts/${slug}`).then((r) => r.data.data as Post),
  create: (body: PostInput) => http.post('/posts', body).then((r) => r.data.data as Post),
  update: (id: string, body: Partial<PostInput>) => http.patch(`/posts/${id}`, body).then((r) => r.data.data as Post),
  remove: (id: string) => http.delete(`/posts/${id}`),
};