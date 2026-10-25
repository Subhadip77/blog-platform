import { z } from 'zod';
import { objectId } from '../../common/utils/common.schema';
import { paginationSchema } from '../../common/utils/pagination';

export const createPostSchema = z.object({
  title: z.string().trim().min(3).max(150),
  content: z.string().trim().min(10).max(20000),
});

export const updatePostSchema = createPostSchema
  .partial()
  .refine((v) => Object.keys(v).length > 0, 'Provide at least one field to update');

export const listPostsQuerySchema = paginationSchema.extend({
  author: objectId.optional(),
});

export const slugParamSchema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(100),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ListPostsQuery = z.infer<typeof listPostsQuerySchema>;