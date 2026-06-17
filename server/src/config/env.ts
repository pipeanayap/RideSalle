import 'dotenv/config';
import { z } from 'zod';

/**
 * Validación y tipado de variables de entorno. Falla rápido al arrancar si falta algo.
 * Mantener sincronizado con `.env.example`.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI es requerido'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET es requerido'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET es requerido'),
  JWT_ACCESS_EXPIRES: z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(8).max(15).default(12),
  CLOUDINARY_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
  ALLOWED_EMAIL_DOMAIN: z.string().default('lasallebajio.edu.mx'),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
