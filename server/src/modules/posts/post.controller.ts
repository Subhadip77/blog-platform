import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/apiResponse';
import { postService } from './post.service';
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from './post.schema';

const actor = (req: Request) => req.user!; // authenticate guarantees it on these routes

export const postController = {
  async list(req: Request, res: Response) {
    const { items, meta } = await postService.list(req.query as unknown as ListPostsQuery);
    sendSuccess(res, items, { meta });
  },

  async getBySlug(req: Request, res: Response) {
    sendSuccess(res, await postService.getBySlug(req.params.slug as string));
  },

  async create(req: Request, res: Response) {
    const post = await postService.create(actor(req), req.body as CreatePostInput);
    sendSuccess(res, post, { status: 201 });
  },

  async update(req: Request, res: Response) {
    const post = await postService.update(actor(req), req.params.id as string, req.body as UpdatePostInput);
    sendSuccess(res, post);
  },

  async remove(req: Request, res: Response) {
    await postService.softDelete(actor(req), req.params.id as string);
    sendSuccess(res, { message: 'Post deleted' });
  },
};