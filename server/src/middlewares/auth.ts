import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { forbidden, unauthorized } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import type { UserRole } from '../types/index.js';

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

/** Exige un access token válido y adjunta `req.user`. */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token) {
    throw unauthorized('Token de acceso requerido');
  }
  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role };
  next();
}

/** Restringe el acceso a los roles indicados. Debe usarse después de `authenticate`. */
export function authorize(...roles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw forbidden('No tienes permisos para esta acción');
    }
    next();
  };
}
