import type { UserRole } from './index.js';

/** Identidad autenticada adjuntada a la request por el middleware de auth. */
export interface AuthUser {
  id: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
