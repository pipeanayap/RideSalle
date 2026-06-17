import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(60).optional(),
    lastName: z.string().trim().min(2).max(60).optional(),
    university: z.string().trim().min(2).max(120).optional(),
    career: z.string().trim().min(2).max(120).optional(),
    semester: z.coerce.number().int().min(1).max(20).optional(),
    description: z.string().trim().max(500).optional(),
  }),
});

export const vehicleSchema = z.object({
  body: z.object({
    brand: z.string().trim().min(1).max(40),
    model: z.string().trim().min(1).max(40),
    year: z.coerce
      .number()
      .int()
      .min(1980)
      .max(new Date().getFullYear() + 1),
    color: z.string().trim().min(1).max(30),
    plates: z.string().trim().min(3).max(12),
    seats: z.coerce.number().int().min(1).max(8),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8)
      .max(72)
      .regex(/[a-z]/)
      .regex(/[A-Z]/)
      .regex(/\d/),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type VehicleInput = z.infer<typeof vehicleSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
