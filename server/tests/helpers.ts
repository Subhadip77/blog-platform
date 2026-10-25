import request from 'supertest';
import type { Express } from 'express';
import { UserModel } from '../src/modules/users/user.model';

export const PASSWORD = 'Passw0rdOK';

export async function signup(app: Express, name: string, email: string, role: 'user' | 'admin' = 'user') {
  await request(app).post('/api/v1/auth/register').send({ name, email, password: PASSWORD }).expect(201);
  if (role === 'admin') await UserModel.updateOne({ email }, { role: 'admin' }); // promote directly in the DB
  // Log in after promotion so the token carries the right role.
  const res = await request(app).post('/api/v1/auth/login').send({ email, password: PASSWORD }).expect(200);
  return {
    token: res.body.data.accessToken as string,
    id: res.body.data.user._id as string,
    cookie: cookieFrom(res),
  };
}

export const cookieFrom = (res: request.Response) =>
  (res.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });