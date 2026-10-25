import { http } from '../../lib/http';
import type { Comment, PageMeta } from '../../lib/types';

export const commentsApi = {
  list: (postId: string, page: number) =>
    http.get(`/posts/${postId}/comments`, { params: { page, limit: 5 } }).then((r) => ({
      items: r.data.data as Comment[],
      meta: r.data.meta as PageMeta,
    })),
  add: (postId: string, content: string) =>
    http.post(`/posts/${postId}/comments`, { content }).then((r) => r.data.data as Comment),
  edit: (id: string, content: string) => http.patch(`/comments/${id}`, { content }).then((r) => r.data.data as Comment),
  remove: (id: string) => http.delete(`/comments/${id}`),
};