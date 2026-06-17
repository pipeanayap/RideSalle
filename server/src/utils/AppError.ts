/**
 * Error de aplicación con código HTTP y bandera de operacional.
 * Lanzar desde services/controllers para errores esperados (validación, 404, permisos).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = 'AppError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export const badRequest = (message: string): AppError => new AppError(message, 400);
export const unauthorized = (message = 'No autorizado'): AppError => new AppError(message, 401);
export const forbidden = (message = 'Acceso denegado'): AppError => new AppError(message, 403);
export const notFound = (message = 'Recurso no encontrado'): AppError => new AppError(message, 404);
export const conflict = (message: string): AppError => new AppError(message, 409);
