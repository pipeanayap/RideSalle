import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from './AppError.js';
import type { JwtPayload } from '../types/index.js';

type ExpiresIn = SignOptions['expiresIn'];

/** Firma un access token de corta duración. */
export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as ExpiresIn,
  });
}

/** Firma un refresh token de larga duración. */
export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as ExpiresIn,
  });
}

function parsePayload(decoded: string | jwt.JwtPayload): JwtPayload {
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || !('role' in decoded)) {
    throw unauthorized('Token inválido');
  }
  return { sub: decoded.sub, role: decoded.role as JwtPayload['role'] };
}

/** Verifica y decodifica un access token. Lanza 401 si es inválido/expirado. */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return parsePayload(jwt.verify(token, env.JWT_SECRET));
  } catch {
    throw unauthorized('Token de acceso inválido o expirado');
  }
}

/** Verifica y decodifica un refresh token. Lanza 401 si es inválido/expirado. */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return parsePayload(jwt.verify(token, env.JWT_REFRESH_SECRET));
  } catch {
    throw unauthorized('Refresh token inválido o expirado');
  }
}
