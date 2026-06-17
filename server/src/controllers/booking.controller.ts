import type { Request, Response } from 'express';
import { bookingService } from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import type { CreateBookingInput } from '../validation/booking.schema.js';

export const bookingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const input = req.body as CreateBookingInput;
    const booking = await bookingService.create(req.user!.id, input);
    res.status(201).json({ booking });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.getById(req.params['id']!, req.user!.id);
    res.json({ booking });
  }),

  myBookingsAsPassenger: asyncHandler(async (req: Request, res: Response) => {
    const bookings = await bookingService.listAsPassenger(req.user!.id);
    res.json({ bookings });
  }),

  pendingAsDriver: asyncHandler(async (req: Request, res: Response) => {
    const bookings = await bookingService.listAsDriver(req.user!.id);
    res.json({ bookings });
  }),

  accept: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.accept(req.params['id']!, req.user!.id);
    res.json({ booking });
  }),

  reject: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.reject(req.params['id']!, req.user!.id);
    res.json({ booking });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const booking = await bookingService.cancelByPassenger(req.params['id']!, req.user!.id);
    res.json({ booking });
  }),
};
