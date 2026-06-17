import { z } from 'zod';
import { env } from '../config/env.js';

const institutionalEmail = z
  .string()
  .email('Correo inválido')
  .toLowerCase()
  .refine(
    (email) => email.endsWith(`@${env.ALLOWED_EMAIL_DOMAIN}`),
    `Solo se permiten correos institucionales @${env.ALLOWED_EMAIL_DOMAIN}`,
  );

const strongPassword = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(72, 'La contraseña es demasiado larga')
  .regex(/[a-z]/, 'Debe incluir una minúscula')
  .regex(/[A-Z]/, 'Debe incluir una mayúscula')
  .regex(/\d/, 'Debe incluir un número');

export const registerSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(60),
    lastName: z.string().trim().min(2).max(60),
    email: institutionalEmail,
    password: strongPassword,
    university: z.string().trim().min(2).max(120),
    career: z.string().trim().min(2).max(120),
    semester: z.coerce.number().int().min(1).max(20),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Correo inválido').toLowerCase(),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({ email: z.string().email().toLowerCase() }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(10),
    password: strongPassword,
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
