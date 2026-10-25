export type Role = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface AuthPayload {
  user: User;
  accessToken: string;
}