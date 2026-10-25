import request from 'supertest';
import { createApp } from '../../src/app';
import { bearer, signup } from '../helpers';

const app = createApp();

describe('admin RBAC', () => {
  it('401 without a token, 403 for a regular user, 200 for an admin', async () => {
    const user = await signup(app, 'User', 'u@x.com');
    const admin = await signup(app, 'Admin', 'admin@x.com', 'admin');

    expect((await request(app).get('/api/v1/admin/stats')).status).toBe(401);
    expect((await request(app).get('/api/v1/admin/stats').set(bearer(user.token))).status).toBe(403);

    const ok = await request(app).get('/api/v1/admin/stats').set(bearer(admin.token));
    expect(ok.status).toBe(200);
    expect(ok.body.data).toMatchObject({ users: 2, posts: 0, comments: 0 });
  });

  it('stops an admin changing their own role', async () => {
    const admin = await signup(app, 'Admin', 'admin@x.com', 'admin');
    const res = await request(app).patch(`/api/v1/admin/users/${admin.id}/role`).set(bearer(admin.token)).send({ role: 'user' });
    expect(res.status).toBe(403);
  });

  it('deactivated users cannot log in', async () => {
    const user = await signup(app, 'User', 'u@x.com');
    const admin = await signup(app, 'Admin', 'admin@x.com', 'admin');
    await request(app).patch(`/api/v1/admin/users/${user.id}/status`).set(bearer(admin.token)).send({ isActive: false }).expect(200);
    const login = await request(app).post('/api/v1/auth/login').send({ email: 'u@x.com', password: 'Passw0rdOK' });
    expect(login.status).toBe(401);
  });
});