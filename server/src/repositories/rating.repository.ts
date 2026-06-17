import { Types } from 'mongoose';
import { type IRating, RatingModel } from '../models/Rating.js';

export const ratingRepository = {
  create(data: Partial<IRating>) {
    return RatingModel.create(data);
  },

  findOne(filter: Partial<Pick<IRating, 'ride' | 'author' | 'target'>>) {
    return RatingModel.findOne(filter).exec();
  },

  listForUser(userId: string) {
    return RatingModel.find({ target: userId })
      .populate('author', 'firstName lastName photoUrl')
      .sort({ createdAt: -1 })
      .exec();
  },

  /** Calcula el promedio y el conteo de calificaciones recibidas por un usuario. */
  async aggregateForUser(userId: string): Promise<{ average: number; count: number }> {
    const result = await RatingModel.aggregate<{ average: number; count: number }>([
      { $match: { target: new Types.ObjectId(userId) } },
      { $group: { _id: '$target', average: { $avg: '$score' }, count: { $sum: 1 } } },
    ]).exec();

    const stats = result[0];
    if (!stats) return { average: 0, count: 0 };
    return { average: Math.round(stats.average * 10) / 10, count: stats.count };
  },
};
