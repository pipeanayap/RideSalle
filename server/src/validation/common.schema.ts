import { z } from 'zod';

/** ObjectId de Mongo (24 hex). */
export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Identificador inválido');

/** Query de paginación reutilizable. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const idParamSchema = z.object({ id: objectIdSchema });
