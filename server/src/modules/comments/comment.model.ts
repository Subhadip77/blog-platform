import { Schema, model, type InferSchemaType } from 'mongoose';

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

// Serves the only hot query: "comments of this post, newest first".
commentSchema.index({ post: 1, createdAt: -1 });
// Serves "comments by this user" (admin tools, profile page later).
commentSchema.index({ author: 1 });

export type Comment = InferSchemaType<typeof commentSchema>;
export const CommentModel = model('Comment', commentSchema);