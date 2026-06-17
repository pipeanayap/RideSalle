import { Types } from 'mongoose';
import { ratingRepository } from '../repositories/rating.repository.js';
import { bookingRepository } from '../repositories/booking.repository.js';
import { userService } from './user.service.js';
import { notificationService } from './notification.service.js';
import { badRequest, forbidden, notFound } from '../utils/AppError.js';
import type { RatingDocument } from '../models/Rating.js';
import type { CreateRatingInput } from '../validation/rating.schema.js';

export const ratingService = {
  async create(authorId: string, input: CreateRatingInput): Promise<RatingDocument> {
    if (authorId === input.targetId) throw badRequest('No puedes calificarte a ti mismo');

    const booking = await bookingRepository.findOne({
      ride: new Types.ObjectId(input.rideId),
      $or: [
        { passenger: new Types.ObjectId(authorId) },
        { driver: new Types.ObjectId(authorId) },
      ],
      status: 'accepted',
    });
    if (!booking) throw forbidden('Solo puedes calificar viajes en los que participaste');

    const existing = await ratingRepository.findOne({
      ride: new Types.ObjectId(input.rideId),
      author: new Types.ObjectId(authorId),
      target: new Types.ObjectId(input.targetId),
    });
    if (existing) throw badRequest('Ya calificaste a este usuario en este viaje');

    const rating = await ratingRepository.create({
      ride: new Types.ObjectId(input.rideId),
      author: new Types.ObjectId(authorId),
      target: new Types.ObjectId(input.targetId),
      score: input.score,
      comment: input.comment,
    });

    await userService.recalcRatingStats(input.targetId);

    await notificationService.create({
      recipient: input.targetId,
      type: 'new_rating',
      title: 'Nueva calificación',
      body: `Recibiste una calificación de ${input.score} estrella(s)`,
      ride: input.rideId,
    });

    return rating;
  },

  async listForUser(userId: string): Promise<RatingDocument[]> {
    const user = await userService.getById(userId);
    if (!user) throw notFound('Usuario no encontrado');
    return ratingRepository.listForUser(userId);
  },
};
