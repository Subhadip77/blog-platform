export type Role = 'user' | 'admin';
export interface PageMeta { page: number; limit: number; total: number; totalPages: number }
export interface Post extends PostSummary { content: string; updatedAt: string }


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


export interface PostSummary {
  _id: string;
  title: string;
  slug: string;
  author: { _id: string; name: string } | null;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: { _id: string; name: string } | null;
  createdAt: string;
}