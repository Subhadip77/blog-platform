import { Schema, model, type HydratedDocument } from 'mongoose';

export const USER_ROLES = ['user', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  name: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  isActive: boolean;
  googleId?: string;
  facebookId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
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

export type UserDocument = HydratedDocument<User>;
export const UserModel = model<User>('User', userSchema);