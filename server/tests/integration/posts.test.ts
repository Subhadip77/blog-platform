import request from 'supertest';
import { createApp } from '../../src/app';
import { bearer, signup } from '../helpers';

const app = createApp();
const body = { title: 'My First Post', content: 'Hello world, this is the content.' };

async function users() {
  return {
    a: await signup(app, 'User A', 'a@x.com'),
    b: await signup(app, 'User B', 'b@x.com'),
    admin: await signup(app, 'Admin', 'admin@x.com', 'admin'),
  };
}

const createPost = (token: string) => request(app).post('/api/v1/posts').set(bearer(token)).send(body);

describe('posts', () => {
  it('requires authentication to create (401)', async () => {
    expect((await request(app).post('/api/v1/posts').send(body)).status).toBe(401);
  });

  it('generates a slug and avoids collisions', async () => {
    const { a } = await users();
    const first = await createPost(a.token);
    const second = await createPost(a.token);
    expect(first.body.data.slug).toBe('my-first-post');
    expect(second.body.data.slug).not.toBe('my-first-post');
    expect(second.body.data.slug).toMatch(/^my-first-post-/);
  });

  it('enforces ownership: other user 403, owner 200, admin 200', async () => {
    const { a, b, admin } = await users();
    const id = (await createPost(a.token)).body.data._id;
    const patch = (token: string) =>
      request(app).patch(`/api/v1/posts/${id}`).set(bearer(token)).send({ title: 'Edited title' });

    expect((await patch(b.token)).status).toBe(403);
    expect((await patch(a.token)).status).toBe(200);
    expect((await patch(admin.token)).status).toBe(200);
  });

  it('keeps the slug stable when the title changes', async () => {
    const { a } = await users();
    const created = (await createPost(a.token)).body.data;
    const res = await request(app).patch(`/api/v1/posts/${created._id}`).set(bearer(a.token)).send({ title: 'Totally new title' });
    expect(res.body.data.slug).toBe(created.slug);
  });

  it('soft deletes: hidden from the API, kept in the DB, slug reusable', async () => {
    const { a, b } = await users();
    const id = (await createPost(a.token)).body.data._id;

    expect((await request(app).delete(`/api/v1/posts/${id}`).set(bearer(b.token))).status).toBe(403);
    expect((await request(app).delete(`/api/v1/posts/${id}`).set(bearer(a.token))).status).toBe(200);

    expect((await request(app).get('/api/v1/posts/my-first-post')).status).toBe(404);
    const list = await request(app).get('/api/v1/posts');
    expect(list.body.data).toHaveLength(0);

    const again = await createPost(a.token);
    expect(again.body.data.slug).toBe('my-first-post'); // partial unique index frees the slug
  });

  it('paginates and caps the limit', async () => {
    const { a } = await users();
    for (let i = 0; i < 3; i++) await createPost(a.token);
    const res = await request(app).get('/api/v1/posts?page=1&limit=2');
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ total: 3, totalPages: 2 });
    expect((await request(app).get('/api/v1/posts?limit=500')).status).toBe(422);
  });
});