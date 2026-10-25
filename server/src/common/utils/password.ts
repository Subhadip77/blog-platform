import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);