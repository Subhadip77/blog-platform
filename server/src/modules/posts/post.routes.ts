import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../../common/utils/common.schema';
import { postController } from './post.controller';
import { createPostSchema, listPostsQuerySchema, slugParamSchema, updatePostSchema } from './post.schema';

const router = Router();

router.get('/', validate({ query: listPostsQuerySchema }), postController.list);
router.get('/:slug', validate({ params: slugParamSchema }), postController.getBySlug);

router.post('/', authenticate, validate({ body: createPostSchema }), postController.create);
router.patch('/:id', authenticate, validate({ params: idParamSchema, body: updatePostSchema }), postController.update);
router.delete('/:id', authenticate, validate({ params: idParamSchema }), postController.remove);

export default router;