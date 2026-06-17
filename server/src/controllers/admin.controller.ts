import type { Request, Response } from 'express';
import { userRepository } from '../repositories/user.repository.js';
import { rideRepository } from '../repositories/ride.repository.js';
import { bookingRepository } from '../repositories/booking.repository.js';
import { notFound } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { buildPaginated, resolvePagination } from '../utils/pagination.js';

export const adminController = {
  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = resolvePagination(
      Number(req.query['page']) || 1,
      Number(req.query['limit']) || 20,
    );
    const search = req.query['search'] as string | undefined;
    const filter = search
      ? {
          $or: [
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const { items, total } = await userRepository.paginate(filter, page, limit);
    res.json(buildPaginated(items, total, { page, limit }));
  }),

  suspendUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.updateById(req.params['id']!, { status: 'suspended' });
    if (!user) throw notFound('Usuario no encontrado');
    res.json({ user });
  }),

  activateUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await userRepository.updateById(req.params['id']!, { status: 'active' });
    if (!user) throw notFound('Usuario no encontrado');
    res.json({ user });
  }),

  listRides: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = resolvePagination(
      Number(req.query['page']) || 1,
      Number(req.query['limit']) || 20,
    );
    const { items, total } = await rideRepository.paginate({}, page, limit);
    res.json(buildPaginated(items, total, { page, limit }));
  }),

  deleteRide: asyncHandler(async (req: Request, res: Response) => {
    const ride = await rideRepository.deleteById(req.params['id']!);
    if (!ride) throw notFound('Viaje no encontrado');
    res.json({ message: 'Viaje eliminado' });
  }),

  stats: asyncHandler(async (_req: Request, res: Response) => {
    const [totalUsers, totalRides, totalBookings] = await Promise.all([
      userRepository.count(),
      rideRepository.count(),
      bookingRepository.count(),
    ]);
    res.json({ totalUsers, totalRides, totalBookings });
  }),
};
