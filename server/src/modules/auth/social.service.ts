import { BadRequestError, ConflictError, ForbiddenError } from '../../common/errors/AppError';
import { activityBus } from '../../common/events/activity';
import { UserModel } from '../users/user.model';

export type SocialProvider = 'google' | 'facebook';

export interface SocialProfile {
  provider: SocialProvider;
  providerId: string;
  email?: string;
  emailVerified: boolean;
  name: string;
}

const FIELD = { google: 'googleId', facebook: 'facebookId' } as const;

export const socialService = {
  async findOrCreate(p: SocialProfile) {
    const field = FIELD[p.provider];

    // 1. Returning user: match on the provider's stable id, never on email.
    const linked = await UserModel.findOne({ [field]: p.providerId });
    if (linked) {
      if (!linked.isActive) throw new ForbiddenError('This account is disabled');
      return linked;
    }

    if (!p.email) throw new BadRequestError(`${p.provider} did not share an email address`);
    const email = p.email.toLowerCase();

    // 2. Same email already registered: link ONLY if the provider verified the email.
    const existing = await UserModel.findOne({ email });
    if (existing) {
      if (!p.emailVerified) {
        throw new ConflictError('An account with this email already exists. Log in with your password.');
      }
      if (!existing.isActive) throw new ForbiddenError('This account is disabled');
      existing[field] = p.providerId;
      await existing.save();
      return existing;
    }

    // 3. New user, with no password.
    const name = p.name.trim().slice(0, 60);
    const user = await UserModel.create({ name: name.length >= 2 ? name : 'User', email, [field]: p.providerId });
    activityBus.emit({
      action: 'user.registered',
      actorId: user.id,
      targetType: 'user',
      targetId: user.id,
      meta: { provider: p.provider },
    });
    return user;
  },
};