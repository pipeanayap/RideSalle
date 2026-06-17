import type { Request, Response } from 'express';
import { ratingService } from '../services/rating.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CreateRatingInput } from '../validation/rating.schema.js';

export const ratingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateRatingInput;
    const rating = await ratingService.create(req.user!.id, input);
    res.status(201).json({ rating });
  }),

  listForUser: asyncHandler(async (req: Request, res: Response) => {
    const ratings = await ratingService.listForUser(req.params['id']!);
    res.json({ ratings });
  }),
};
