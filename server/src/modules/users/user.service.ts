import { ConflictError } from '../../common/errors/AppError';
import { hashPassword } from '../../common/utils/password';
import { UserModel } from './user.model';

export const userService = {
  async createLocal(input: { name: string; email: string; password: string }) {
    const exists = await UserModel.exists({ email: input.email });
    if (exists) throw new ConflictError('Email already registered');

    const passwordHash = await hashPassword(input.password);
    return UserModel.create({ name: input.name, email: input.email, passwordHash });
  },

  findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email }).select('+passwordHash');
  },

  findById(id: string) {
    return UserModel.findById(id);
  },
};