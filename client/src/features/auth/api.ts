import { http } from '../../lib/http';
import type { AuthPayload, User } from '../../lib/types';

export const authApi = {
  login: (body: { email: string; password: string }) =>
    http.post('/auth/login', body).then((r) => r.data.data as AuthPayload),
  register: (body: { name: string; email: string; password: string }) =>
    http.post('/auth/register', body).then((r) => r.data.data as AuthPayload),
  logout: () => http.post('/auth/logout'),
  me: () => http.get('/auth/me').then((r) => r.data.data.user as User),
};