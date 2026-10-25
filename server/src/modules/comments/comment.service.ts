import { NotFoundError } from '../../common/errors/AppError';
import { activityBus } from '../../common/events/activity';
import { buildMeta } from '../../common/utils/pagination';
import { assertCanModify, type Actor } from '../../common/utils/permissions';
import { PostModel } from '../posts/post.model';
import { CommentModel } from './comment.model';
import type { CommentBody, ListCommentsQuery } from './comment.schema';

// PostModel.exists runs through findOne, so our soft-delete hook hides deleted posts here too.
async function assertPostExists(postId: string) {
  if (!(await PostModel.exists({ _id: postId }))) throw new NotFoundError('Post not found');
}

export const commentService = {
  async listForPost(postId: string, { page, limit }: ListCommentsQuery) {
    await assertPostExists(postId);

    const filter = { post: postId };
    const [items, total] = await Promise.all([
      CommentModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name')
        .select('-__v')
        .lean(),
      CommentModel.countDocuments(filter),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async create(actor: Actor, postId: string, input: CommentBody) {
    await assertPostExists(postId);
    const comment = await CommentModel.create({ post: postId, author: actor.id, content: input.content });
    activityBus.emit({
      action: 'comment.created',
      actorId: actor.id,
      targetType: 'comment',
      targetId: comment.id,
      meta: { postId },
    });
    return comment.populate('author', 'name');
  },

  async update(actor: Actor, id: string, input: CommentBody) {
    const comment = await CommentModel.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');
    assertCanModify(comment.author, actor);

    comment.content = input.content;
    await comment.save();
    activityBus.emit({
      action: 'comment.updated',
      actorId: actor.id,
      targetType: 'comment',
      targetId: comment.id,
      meta: { byAdmin: comment.author.toString() !== actor.id },
    });
    return comment.populate('author', 'name');
  },

  async remove(actor: Actor, id: string) {
    const comment = await CommentModel.findById(id);
    if (!comment) throw new NotFoundError('Comment not found');
    assertCanModify(comment.author, actor);

    await comment.deleteOne();
    activityBus.emit({
      action: 'comment.deleted',
      actorId: actor.id,
      targetType: 'comment',
      targetId: comment.id,
      meta: { byAdmin: comment.author.toString() !== actor.id },
    });
  },
};