import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MongoServerError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export { AppError } from '../utils/AppError.js';

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

/** Middleware 404 para rutas no encontradas. */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/** Mapea errores conocidos a un código HTTP y cuerpo seguro. */
function resolveError(err: unknown): { statusCode: number; body: ErrorResponse } {
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, body: { message: err.message } };
  }

  if (err instanceof ZodError) {
    const errors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'root';
      (errors[key] ??= []).push(issue.message);
    }
    return { statusCode: 422, body: { message: 'Datos inválidos', errors } };
  }

  if (err instanceof MongooseError.ValidationError) {
    const errors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(err.errors)) {
      (errors[key] ??= []).push(value.message);
    }
    return { statusCode: 422, body: { message: 'Datos inválidos', errors } };
  }

  if (err instanceof MongooseError.CastError) {
    return { statusCode: 400, body: { message: `Identificador inválido: ${err.value}` } };
  }

  if (err instanceof MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'campo';
    return { statusCode: 409, body: { message: `Ya existe un registro con ese ${field}` } };
  }

  return { statusCode: 500, body: { message: 'Error interno del servidor' } };
}

/**
 * Manejador central de errores. Nunca expone stack traces ni datos sensibles en producción.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const { statusCode, body } = resolveError(err);

  if (statusCode >= 500) {
    logger.error('Error no controlado', env.NODE_ENV === 'production' ? undefined : err);
  }

  res.status(statusCode).json(body);
}
