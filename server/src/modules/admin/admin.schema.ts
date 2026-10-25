import { z } from 'zod';
import { objectId } from '../../common/utils/common.schema';
import { paginationSchema } from '../../common/utils/pagination';
import { USER_ROLES } from '../users/user.model';

export const listUsersQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(50).optional(),
  role: z.enum(USER_ROLES).optional(),
});
export const updateRoleSchema = z.object({ role: z.enum(USER_ROLES) });
export const updateStatusSchema = z.object({ isActive: z.boolean() });
export const adminListPostsQuerySchema = paginationSchema.extend({
  status: z.enum(['active', 'deleted', 'all']).default('all'),
});
export const auditQuerySchema = paginationSchema.extend({
  action: z.string().trim().max(50).optional(),
  actor: objectId.optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type AdminListPostsQuery = z.infer<typeof adminListPostsQuerySchema>;
export type AuditQuery = z.infer<typeof auditQuerySchema>;admin.service.ts