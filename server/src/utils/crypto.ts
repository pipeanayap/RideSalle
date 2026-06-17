import { createHash, randomBytes } from 'node:crypto';

/** Genera un token aleatorio en hex (p. ej. para recuperación de contraseña). */
export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex');
}

/** Hashea un token con SHA-256 para almacenarlo (nunca guardar el token en claro). */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
