import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

const futureDate = z.coerce.date().refine((d) => d.getTime() > Date.now(), {
  message: 'La fecha de salida debe ser futura',
});

export const createRideSchema = z.object({
  body: z.object({
    origin: z.string().trim().min(2).max(120),
    destination: z.string().trim().min(2).max(120),
    departureAt: futureDate,
    meetingPoint: z.string().trim().min(2).max(160),
    pricePerSeat: z.coerce.number().min(0).max(100000),
    totalSeats: z.coerce.number().int().min(1).max(8),
    description: z.string().trim().max(500).optional(),
  }),
});

export const updateRideSchema = z.object({
  params: z.object({ id: objectIdSchema }),
  body: z.object({
    origin: z.string().trim().min(2).max(120).optional(),
    destination: z.string().trim().min(2).max(120).optional(),
    departureAt: futureDate.optional(),
    meetingPoint: z.string().trim().min(2).max(160).optional(),
    pricePerSeat: z.coerce.number().min(0).max(100000).optional(),
    totalSeats: z.coerce.number().int().min(1).max(8).optional(),
    description: z.string().trim().max(500).optional(),
  }),
});

export const searchRidesSchema = z.object({
  query: z.object({
    origin: z.string().trim().optional(),
    destination: z.string().trim().optional(),
    date: z.coerce.date().optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    minSeats: z.coerce.number().int().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  }),
});

export type CreateRideInput = z.infer<typeof createRideSchema>['body'];
export type UpdateRideInput = z.infer<typeof updateRideSchema>['body'];
export type SearchRidesInput = z.infer<typeof searchRidesSchema>['query'];
