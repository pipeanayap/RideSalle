import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

/** Hashea una contraseña en texto plano con bcrypt. */
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

/** Compara una contraseña en texto plano contra su hash. */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
