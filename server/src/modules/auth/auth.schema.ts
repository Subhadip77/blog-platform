import { z } from 'zod';

const email = z.string().trim().toLowerCase().pipe(z.email('Invalid email address'));

const password = z
  .string()
  .min(8, 'At least 8 characters')
  .max(72, 'At most 72 characters') // bcrypt ignores bytes beyond 72
  .regex(/[a-z]/, 'Needs a lowercase letter')
  .regex(/[A-Z]/, 'Needs an uppercase letter')
  .regex(/[0-9]/, 'Needs a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email,
  password,
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required'), // don't apply strength rules on login
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;