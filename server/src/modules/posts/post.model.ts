import { Schema, model, type InferSchemaType } from 'mongoose';

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    slug: { type: String, required: true },
    content: { type: String, required: true, maxlength: 20000 },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    deletedAt: { type: Date }, // unset = active, a date = soft deleted
  },
  { timestamps: true },
);

// Slug must be unique only among ACTIVE posts, so a deleted post doesn't block its slug.
postSchema.index(
  { slug: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
postSchema.index({ createdAt: -1 }); // public feed
postSchema.index({ author: 1, createdAt: -1 }); // "posts by this author"

// Soft-delete guard: every read query hides deleted posts unless explicitly asked.
postSchema.pre(['find', 'findOne', 'findOneAndUpdate', 'countDocuments'], function () {
  if (this.getOptions().withDeleted) return;
  this.where({ deletedAt: null }); // matches both "missing" and null
});

export type Post = InferSchemaType<typeof postSchema>;
export const PostModel = model('Post', postSchema);