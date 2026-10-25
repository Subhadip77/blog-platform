import { ForbiddenError } from '../errors/AppError';
import type { UserRole } from '../../modules/users/user.model';

export interface Actor {
  id: string;
  role: UserRole;
}

// Single source of truth for "owner or admin". Posts and comments both use it.
export function assertCanModify(ownerId: { toString(): string }, actor: Actor) {
  if (ownerId.toString() !== actor.id && actor.role !== 'admin') throw new ForbiddenError();
}