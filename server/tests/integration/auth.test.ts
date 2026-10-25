import request from 'supertest';
import { createApp } from '../../src/app';
import { cookieFrom, PASSWORD, signup } from '../helpers';

const app = createApp();

describe('auth', () => {
  it('rejects registration with a weak password (422)', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ name: 'Weak', email: 'w@x.com', password: 'weak' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('never returns the password hash', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ name: 'Ann', email: 'a@x.com', password: PASSWORD });
    expect(res.status).toBe(201);
    expect(JSON.stringify(res.body)).not.toMatch(/passwordHash/);
  });

  it('gives the same 401 for a wrong password and an unknown email', async () => {
    await signup(app, 'Ann', 'a@x.com');
    const wrong = await request(app).post('/api/v1/auth/login').send({ email: 'a@x.com', password: 'WrongPass1' });
    const unknown = await request(app).post('/api/v1/auth/login').send({ email: 'nobody@x.com', password: 'WrongPass1' });
    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it('rotates refresh tokens and revokes the family on reuse', async () => {
    const { cookie: first } = await signup(app, 'Ann', 'a@x.com');

    const rotated = await request(app).post('/api/v1/auth/refresh').set('Cookie', first);
    expect(rotated.status).toBe(200);
    const second = cookieFrom(rotated);

    // Replaying the OLD token is treated as theft...
    const replay = await request(app).post('/api/v1/auth/refresh').set('Cookie', first);
    expect(replay.status).toBe(401);

    // ...and the NEW token, from the same family, dies too.
    const afterReplay = await request(app).post('/api/v1/auth/refresh').set('Cookie', second);
    expect(afterReplay.status).toBe(401);
  });

  it('protects /me', async () => {
    expect((await request(app).get('/api/v1/auth/me')).status).toBe(401);
    const { token } = await signup(app, 'Ann', 'a@x.com');
    const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
  });
});