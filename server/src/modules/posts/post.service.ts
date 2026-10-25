import crypto from 'node:crypto';
import slugify from 'slugify';
import { ForbiddenError, NotFoundError } from '../../common/errors/AppError';
import { buildMeta } from '../../common/utils/pagination';
import { PostModel } from './post.model';
import type { CreatePostInput, ListPostsQuery, UpdatePostInput } from './post.schema';
import type { UserRole } from '../users/user.model';

interface Actor {
  id: string;
  role: UserRole;
}

async function generateUniqueSlug(title: string) {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 60) || 'post';
  let slug = base;
  while (await PostModel.exists({ slug })) {
    slug = `${base}-${crypto.randomBytes(3).toString('hex')}`;
  }
  return slug;
}

// The ownership rule lives in ONE place, so posts, comments and admin all share it.
function assertCanModify(ownerId: { toString(): string }, actor: Actor) {
  if (ownerId.toString() !== actor.id && actor.role !== 'admin') throw new ForbiddenError();
}

export const postService = {
  async create(actor: Actor, input: CreatePostInput) {
    const slug = await generateUniqueSlug(input.title);
    return PostModel.create({ ...input, slug, author: actor.id });
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
    return post.save();
  },

  async softDelete(actor: Actor, id: string) {
    const post = await PostModel.findById(id);
    if (!post) throw new NotFoundError('Post not found');
    assertCanModify(post.author, actor);

    post.deletedAt = new Date();
    await post.save();
  },
};