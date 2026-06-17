import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from '../validation/auth.schema.js';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as RegisterInput;
    const { user, accessToken, refreshToken } = await authService.register(
      input,
      req.headers['user-agent'],
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });
    res.status(201).json({ user, accessToken });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as LoginInput;
    const { user, accessToken, refreshToken } = await authService.login(
      input,
      req.headers['user-agent'],
    );
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });
    res.json({ user, accessToken });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const token: string = (req.cookies as Record<string, string>)['refreshToken'] ?? '';
    const tokens = await authService.refresh(token, req.headers['user-agent']);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/auth/refresh',
    });
    res.json({ accessToken: tokens.accessToken });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const token: string = (req.cookies as Record<string, string>)['refreshToken'] ?? '';
    await authService.logout(token);
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.json({ message: 'Sesión cerrada' });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ForgotPasswordInput;
    await authService.forgotPassword(input);
    res.json({ message: 'Si el correo existe, recibirás un enlace de recuperación' });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as ResetPasswordInput;
    await authService.resetPassword(input);
    res.json({ message: 'Contraseña actualizada exitosamente' });
  }),
};
