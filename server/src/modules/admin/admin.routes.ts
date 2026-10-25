import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { idParamSchema } from '../../common/utils/common.schema';
import { paginationSchema } from '../../common/utils/pagination';
import { adminController as c } from './admin.controller';
import {
  adminListPostsQuerySchema,
  auditQuerySchema,
  listUsersQuerySchema,
  updateRoleSchema,
  updateStatusSchema,
} from './admin.schema';

const router = Router();

// One line protects every route below, including any added later.
router.use(authenticate, authorize('admin'));

router.get('/stats', c.stats);
router.get('/users', validate({ query: listUsersQuerySchema }), c.listUsers);
router.patch('/users/:id/role', validate({ params: idParamSchema, body: updateRoleSchema }), c.changeRole);
router.patch('/users/:id/status', validate({ params: idParamSchema, body: updateStatusSchema }), c.setStatus);
router.get('/posts', validate({ query: adminListPostsQuerySchema }), c.listPosts);
router.post('/posts/:id/restore', validate({ params: idParamSchema }), c.restorePost);
router.get('/comments', validate({ query: paginationSchema }), c.listComments);
router.get('/audit-logs', validate({ query: auditQuerySchema }), c.listAuditLogs);

export default router;