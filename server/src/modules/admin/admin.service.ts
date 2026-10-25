import { ForbiddenError, NotFoundError } from '../../common/errors/AppError';
import { activityBus } from '../../common/events/activity';
import { buildMeta, paginationSchema } from '../../common/utils/pagination';
import type { Actor } from '../../common/utils/permissions';
import { RefreshTokenModel } from '../auth/refreshToken.model';
import { AuditLogModel } from '../audit/audit.model';
import { CommentModel } from '../comments/comment.model';
import { PostModel } from '../posts/post.model';
import { UserModel, type UserRole } from '../users/user.model';
import type { AdminListPostsQuery, AuditQuery, ListUsersQuery } from './admin.schema';
import type { z } from 'zod';
import type { QueryFilter } from 'mongoose';

type Page = z.infer<typeof paginationSchema>;
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const adminService = {
  async stats() {
    // Independent queries, so run them together.
    const [users, posts, comments, deletedPosts] = await Promise.all([
      UserModel.countDocuments(),
      PostModel.countDocuments(), // soft-delete hook excludes deleted posts
      CommentModel.countDocuments(),
      PostModel.countDocuments({ deletedAt: { $ne: null } }).setOptions({ withDeleted: true }),
    ]);
    return { users, posts, comments, deletedPosts };
  },

  async listUsers({ page, limit, search, role }: ListUsersQuery) {
    const filter: QueryFilter<unknown> = {};
    if (role) filter.role = role;
    if (search) {
      const rx = new RegExp(escapeRegex(search), 'i'); // escaped, so user input can't inject a regex
      filter.$or = [{ name: rx }, { email: rx }];
    }
    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(filter),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async changeRole(actor: Actor, id: string, role: UserRole) {
    if (actor.id === id) throw new ForbiddenError('You cannot change your own role');
    const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) throw new NotFoundError('User not found');
    activityBus.emit({
      action: 'admin.user_role_changed',
      actorId: actor.id,
      targetType: 'user',
      targetId: id,
      meta: { role },
    });
    return user;
  },

  async setStatus(actor: Actor, id: string, isActive: boolean) {
    if (actor.id === id) throw new ForbiddenError('You cannot change your own status');
    const user = await UserModel.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!user) throw new NotFoundError('User not found');

    if (!isActive) {
      // Kill every session so refresh stops working immediately.
      await RefreshTokenModel.updateMany({ user: id, revokedAt: null }, { revokedAt: new Date() });
    }
    activityBus.emit({
      action: 'admin.user_status_changed',
      actorId: actor.id,
      targetType: 'user',
      targetId: id,
      meta: { isActive },
    });
    return user;
  },

  async listPosts({ page, limit, status }: AdminListPostsQuery) {
    const filter: QueryFilter<unknown> =
      status === 'active' ? { deletedAt: null } : status === 'deleted' ? { deletedAt: { $ne: null } } : {};
    const [items, total] = await Promise.all([
      PostModel.find(filter)
        .setOptions({ withDeleted: true }) // explicit opt-out of the soft-delete guard
        .select('title slug author createdAt deletedAt')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name email')
        .lean(),
      PostModel.countDocuments(filter).setOptions({ withDeleted: true }),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async restorePost(actor: Actor, id: string) {
    const post = await PostModel.findOneAndUpdate(
      { _id: id, deletedAt: { $ne: null } },
      { $unset: { deletedAt: 1 } },
      { new: true },
    ).setOptions({ withDeleted: true });
    if (!post) throw new NotFoundError('Deleted post not found');
    activityBus.emit({ action: 'post.restored', actorId: actor.id, targetType: 'post', targetId: id });
    return post; // if its slug was taken meanwhile, the partial unique index gives a 409
  },

  async listComments({ page, limit }: Page) {
    const [items, total] = await Promise.all([
      CommentModel.find()
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name')
        .populate('post', 'title slug') // null if the post is soft deleted
        .lean(),
      CommentModel.countDocuments(),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async listAuditLogs({ page, limit, action, actor }: AuditQuery) {
    const filter: QueryFilter<unknown> = {};
    if (action) filter.action = action;
    if (actor) filter.actor = actor;
    const [items, total] = await Promise.all([
      AuditLogModel.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('actor', 'name')
        .lean(),
      AuditLogModel.countDocuments(filter),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },
};