import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const createRatingSchema = z.object({
  body: z.object({
    rideId: objectIdSchema,
    targetId: objectIdSchema,
    score: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().max(500).optional(),
  }),
});

export type CreateRatingInput = z.infer<typeof createRatingSchema>['body'];
