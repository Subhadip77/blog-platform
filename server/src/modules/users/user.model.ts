import { Schema, model, type InferSchemaType } from 'mongoose';

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    // optional: social-login users have no password. select:false hides it by default.
    passwordHash: { type: String, select: false },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    isActive: { type: Boolean, default: true },
    googleId: { type: String, unique: true, sparse: true },
    facebookId: { type: String, unique: true, sparse: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { passwordHash: _p, __v, ...safe } = ret as Record<string, unknown>;
        return safe;
      },
    },
  },
);

export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);