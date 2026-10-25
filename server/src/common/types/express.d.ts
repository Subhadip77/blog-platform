import type { UserRole } from '../../modules/users/user.model';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
    }
  }
}

export {};