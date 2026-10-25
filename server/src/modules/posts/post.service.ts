import crypto from 'node:crypto';
import slugify from 'slugify';
import { NotFoundError } from '../../common/errors/AppError';
import { activityBus } from '../../common/events/activity';
import { buildMeta } from '../../common/utils/pagination';
import { assertCanModify, type Actor } from '../../common/utils/permissions';
import { PostModel } from './post.model';
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from './post.schema';

async function generateUniqueSlug(title: string) {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 60) || 'post';
  let slug = base;
  while (await PostModel.exists({ slug })) {
    slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return slug;
}

export const postService = {
  async create(actor: Actor, input: CreatePostInput) {
    const slug = await generateUniqueSlug(input.title);
    const post = await PostModel.create({ ...input, slug, author: actor.id });
    activityBus.emit({
      action: 'post.created',
      actorId: actor.id,
      targetType: 'post',
      targetId: post.id,
      meta: { slug },
    });
    return post;
  },

  async list({ page, limit, author }: ListPostsQuery) {
    const filter = author ? { author } : {};
    const [items, total] = await Promise.all([
      PostModel.find(filter)
        .select('title slug author createdAt updatedAt') // list omits the heavy `content`
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name') // name only, never email
        .lean(),
      PostModel.countDocuments(filter),
    ]);
    return { items, meta: buildMeta(page, limit, total) };
  },

  async getBySlug(slug: string) {
    const post = await PostModel.findOne({ slug }).select('-__v').populate('author', 'name').lean();
    if (!post) throw new NotFoundError('Post not found');
    return post;
  },

  async update(actor: Actor, id: string, input: UpdatePostInput) {
    const post = await PostModel.findById(id);
    if (!post) throw new NotFoundError('Post not found');
    assertCanModify(post.author, actor);

    Object.assign(post, input); // slug is intentionally NOT regenerated
    await post.save();
    activityBus.emit({
      action: 'post.updated',
      actorId: actor.id,
      targetType: 'post',
      targetId: post.id,
      meta: { fields: Object.keys(input), byAdmin: post.author.toString() !== actor.id },
    });
    return post;
  },

  async softDelete(actor: Actor, id: string) {
    const post = await PostModel.findById(id);
    if (!post) throw new NotFoundError('Post not found');
    assertCanModify(post.author, actor);

    post.deletedAt = new Date();
    await post.save();
    activityBus.emit({
      action: 'post.deleted',
      actorId: actor.id,
      targetType: 'post',
      targetId: post.id,
      meta: { byAdmin: post.author.toString() !== actor.id },
    });
  },
};