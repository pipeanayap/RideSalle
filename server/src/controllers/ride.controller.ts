import type { Request, Response } from 'express';
import { rideService } from '../services/ride.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type {
  CreateRideInput,
  SearchRidesInput,
  UpdateRideInput,
} from '../validation/ride.schema.js';

export const rideController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const params = req.query as unknown as SearchRidesInput;
    const result = await rideService.search(params);
    res.json(result);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateRideInput;
    const ride = await rideService.create(req.user!.id, input);
    res.status(201).json({ ride });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const ride = await rideService.getById(req.params['id']!);
    res.json({ ride });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as UpdateRideInput;
    const ride = await rideService.update(req.params['id']!, req.user!.id, input);
    res.json({ ride });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const ride = await rideService.cancel(req.params['id']!, req.user!.id);
    res.json({ ride });
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const ride = await rideService.complete(req.params['id']!, req.user!.id);
    res.json({ ride });
  }),

  myRides: asyncHandler(async (req: Request, res: Response) => {
    const rides = await rideService.listAsDriver(req.user!.id);
    res.json({ rides });
  }),
};
