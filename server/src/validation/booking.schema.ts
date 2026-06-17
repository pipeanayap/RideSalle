import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const createBookingSchema = z.object({
  body: z.object({
    rideId: objectIdSchema,
    seats: z.coerce.number().int().min(1).max(8).default(1),
    message: z.string().trim().max(300).optional(),
  }),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>['body'];
