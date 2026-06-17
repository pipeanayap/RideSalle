import type { ClientSession, FilterQuery, UpdateQuery } from 'mongoose';
import { type IRide, RideModel } from '../models/Ride.js';

const DRIVER_FIELDS = 'firstName lastName photoUrl ratingAverage ratingCount vehicle';

export const rideRepository = {
  create(data: Partial<IRide>) {
    return RideModel.create(data);
  },

  findById(id: string) {
    return RideModel.findById(id).populate('driver', DRIVER_FIELDS).exec();
  },

  findRaw(id: string, session?: ClientSession) {
    const query = RideModel.findById(id);
    if (session) query.session(session);
    return query.exec();
  },

  updateById(id: string, update: UpdateQuery<IRide>, session?: ClientSession) {
    const query = RideModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (session) query.session(session);
    return query.exec();
  },

  async paginate(filter: FilterQuery<IRide>, page: number, limit: number) {
    const [items, total] = await Promise.all([
      RideModel.find(filter)
        .populate('driver', DRIVER_FIELDS)
        .sort({ departureAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      RideModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  deleteById(id: string) {
    return RideModel.findByIdAndDelete(id).exec();
  },

  count(filter: FilterQuery<IRide> = {}) {
    return RideModel.countDocuments(filter).exec();
  },
};
