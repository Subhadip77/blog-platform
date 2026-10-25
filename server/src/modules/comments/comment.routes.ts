import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../../common/utils/common.schema';
import { commentController } from './comment.controller';
import { commentBodySchema, listCommentsQuerySchema, postIdParamSchema } from './comment.schema';

// Mounted at /posts/:postId/comments. mergeParams lets this router see :postId from the parent path.
export const postCommentRoutes = Router({ mergeParams: true });

postCommentRoutes.get(
  '/',
  validate({ params: postIdParamSchema, query: listCommentsQuerySchema }),
  commentController.list,
);
postCommentRoutes.post(
  '/',
  authenticate,
  validate({ params: postIdParamSchema, body: commentBodySchema }),
  commentController.create,
);

// Mounted at /comments
export const commentRoutes = Router();

commentRoutes.patch(
  '/:id',
  authenticate,
  validate({ params: idParamSchema, body: commentBodySchema }),
  commentController.update,
);
commentRoutes.delete('/:id', authenticate, validate({ params: idParamSchema }), commentController.remove);