import { z } from 'zod';
import { objectId } from '../../common/utils/common.schema';
import { paginationSchema } from '../../common/utils/pagination';

export const commentBodySchema = z.object({
  content: z.string().trim().min(1, 'Comment cannot be empty').max(1000),
});

export const postIdParamSchema = z.object({ postId: objectId });

export const listCommentsQuerySchema = paginationSchema;

export type CommentBody = z.infer<typeof commentBodySchema>;
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>;