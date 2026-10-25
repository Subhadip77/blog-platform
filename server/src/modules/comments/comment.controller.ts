import type { Request, Response } from 'express';
import { sendSuccess } from '../../common/utils/apiResponse';
import { commentService } from './comment.service';
import type { CommentBody, ListCommentsQuery } from './comment.schema';

const actor = (req: Request) => req.user!;

export const commentController = {
  async list(req: Request, res: Response) {
    const { items, meta } = await commentService.listForPost(
      req.params.postId as string,
      req.query as unknown as ListCommentsQuery,
    );
    sendSuccess(res, items, { meta });
  },

  async create(req: Request, res: Response) {
    const comment = await commentService.create(actor(req), req.params.postId as string, req.body as CommentBody);
    sendSuccess(res, comment, { status: 201 });
  },

  async update(req: Request, res: Response) {
    const comment = await commentService.update(actor(req), req.params.id as string, req.body as CommentBody);
    sendSuccess(res, comment);
  },

  async remove(req: Request, res: Response) {
    await commentService.remove(actor(req), req.params.id as string);
    sendSuccess(res, { message: 'Comment deleted' });
  },
};