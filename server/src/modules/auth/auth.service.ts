import crypto from 'node:crypto';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../common/errors/AppError';
import { DUMMY_HASH, verifyPassword } from '../../common/utils/password';
import { UserModel, type UserRole } from '../users/user.model';
import { userService } from '../users/user.service';
import { RefreshTokenModel } from './refreshToken.model';
import { sha256, tokenService } from './token.service';
import type { LoginInput, RegisterInput } from './auth.schema';

const DAY_MS = 24 * 60 * 60 * 1000;

async function issueSession(user: { id: string; role: UserRole }, family: string = crypto.randomUUID()) {
  const jti = crypto.randomUUID();
  const refreshToken = tokenService.signRefresh({ sub: user.id, fam: family, jti });

  await RefreshTokenModel.create({
    user: user.id,
    family,
    jti,
    tokenHash: sha256(refreshToken),
    expiresAt: new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * DAY_MS),
  });

  const accessToken = tokenService.signAccess({ sub: user.id, role: user.role });
  return { accessToken, refreshToken, jti };
}

export const authService = {
  async register(input: RegisterInput) {
    const user = await userService.createLocal(input);
    // If TS says role is `string`, write: user.role as UserRole
    const session = await issueSession({ id: user.id, role: user.role });
    return { user, ...session };
  },

  async login(input: LoginInput) {
    const user = await userService.findByEmailWithPassword(input.email);

    // Always run bcrypt, even for unknown emails, so response time doesn't reveal which emails exist.
    const passwordOk = await verifyPassword(input.password, user?.passwordHash ?? DUMMY_HASH);

    if (!user || !user.passwordHash || !passwordOk || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password'); // one message for every failure
    }

    const session = await issueSession({ id: user.id, role: user.role });
    return { user, ...session };
  },

  async refresh(token: string | undefined) {
    if (!token) throw new UnauthorizedError('Refresh token missing');
    const payload = tokenService.verifyRefresh(token);

    // Atomic "claim": only ONE request can flip revokedAt from empty to a date.
    const claimed = await RefreshTokenModel.findOneAndUpdate(
      { jti: payload.jti, tokenHash: sha256(token), revokedAt: null },
      { revokedAt: new Date() },
    );

    if (!claimed) {
      // Signature is valid but the token was already used or revoked: treat as theft.
      await RefreshTokenModel.updateMany({ family: payload.fam, revokedAt: null }, { revokedAt: new Date() });
      throw new UnauthorizedError('Session expired, please log in again');
    }

    const user = await UserModel.findById(payload.sub);
    if (!user || !user.isActive) throw new UnauthorizedError('Session expired, please log in again');

    const session = await issueSession({ id: user.id, role: user.role }, claimed.family);
    await RefreshTokenModel.updateOne({ _id: claimed._id }, { replacedBy: session.jti });
    return { user, ...session };
  },

  async logout(token: string | undefined) {
    if (!token) return;
    try {
      const { fam } = tokenService.verifyRefresh(token);
      await RefreshTokenModel.updateMany({ family: fam, revokedAt: null }, { revokedAt: new Date() });
    } catch {
      // Token already invalid or expired: nothing to revoke, and logout stays idempotent.
    }
  },
};