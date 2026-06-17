import { Types } from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { userRepository } from '../repositories/user.repository.js';
import { sessionRepository } from '../repositories/session.repository.js';
import type { UserDocument } from '../models/User.js';
import { badRequest, conflict, unauthorized } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateRandomToken, hashToken } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import type { TokenPair } from '../types/index.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../validation/auth.schema.js';

const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function issueTokens(user: UserDocument): TokenPair {
  const payload = { sub: user.id as string, role: user.role };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

async function persistSession(userId: string, refreshToken: string, userAgent?: string) {
  await sessionRepository.create({
    user: new Types.ObjectId(userId),
    tokenHash: hashToken(refreshToken),
    userAgent,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });
}

export const authService = {
  async register(input: RegisterInput, userAgent?: string): Promise<{ user: UserDocument } & TokenPair> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw conflict('Ya existe una cuenta con ese correo');
    }

    const password = await hashPassword(input.password);
    const user = await userRepository.create({ ...input, password });

    const tokens = issueTokens(user);
    await persistSession(user.id as string, tokens.refreshToken, userAgent);
    return { user, ...tokens };
  },

  async login(input: LoginInput, userAgent?: string): Promise<{ user: UserDocument } & TokenPair> {
    const user = await userRepository.findByEmailWithPassword(input.email);
    if (!user) {
      throw unauthorized('Credenciales inválidas');
    }
    if (user.status === 'suspended') {
      throw unauthorized('Tu cuenta está suspendida. Contacta al administrador.');
    }

    const valid = await verifyPassword(input.password, user.password);
    if (!valid) {
      throw unauthorized('Credenciales inválidas');
    }

    const tokens = issueTokens(user);
    await persistSession(user.id as string, tokens.refreshToken, userAgent);
    return { user, ...tokens };
  },

  /** Rota el refresh token: valida, revoca el anterior y emite uno nuevo. */
  async refresh(refreshToken: string, userAgent?: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw unauthorized('Refresh token requerido');
    }
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);

    const session = await sessionRepository.findByTokenHash(tokenHash);
    if (!session) {
      throw unauthorized('Sesión inválida o expirada');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user || user.status === 'suspended') {
      await sessionRepository.deleteByTokenHash(tokenHash);
      throw unauthorized('Sesión inválida');
    }

    await sessionRepository.deleteByTokenHash(tokenHash);
    const tokens = issueTokens(user);
    await persistSession(user.id as string, tokens.refreshToken, userAgent);
    return tokens;
  },

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) return;
    await sessionRepository.deleteByTokenHash(hashToken(refreshToken));
  },

  /**
   * Genera un token de recuperación. Por seguridad nunca revela si el correo existe.
   * En ausencia de servicio de email, registra el enlace en el logger (desarrollo).
   */
  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) return;

    const rawToken = generateRandomToken();
    await userRepository.updateById(user.id as string, {
      resetPasswordToken: hashToken(rawToken),
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000),
    });

    const link = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;
    logger.info('Enlace de recuperación generado', env.NODE_ENV === 'production' ? undefined : link);
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const user = await userRepository.findByResetToken(hashToken(input.token));
    if (!user) {
      throw badRequest('El enlace de recuperación es inválido o ha expirado');
    }

    user.password = await hashPassword(input.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Revoca todas las sesiones tras cambiar la contraseña.
    await sessionRepository.deleteAllForUser(user.id as string);
  },
};
