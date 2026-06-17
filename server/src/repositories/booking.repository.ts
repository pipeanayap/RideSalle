import type { ClientSession, FilterQuery, UpdateQuery } from 'mongoose';
import { type IBooking, BookingModel } from '../models/Booking.js';

const RIDE_FIELDS = 'origin destination departureAt status pricePerSeat meetingPoint';
const USER_FIELDS = 'firstName lastName photoUrl ratingAverage';

export const bookingRepository = {
  create(data: Partial<IBooking>, session?: ClientSession) {
    return BookingModel.create(session ? [data] : [data], session ? { session } : undefined).then(
      (docs) => docs[0],
    );
  },

  findById(id: string) {
    return BookingModel.findById(id)
      .populate('ride', RIDE_FIELDS)
      .populate('passenger', USER_FIELDS)
      .populate('driver', USER_FIELDS)
      .exec();
  },

  findRaw(id: string, session?: ClientSession) {
    const query = BookingModel.findById(id);
    if (session) query.session(session);
    return query.exec();
  },

  findOne(filter: FilterQuery<IBooking>) {
    return BookingModel.findOne(filter).exec();
  },

  updateById(id: string, update: UpdateQuery<IBooking>, session?: ClientSession) {
    const query = BookingModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
    if (session) query.session(session);
    return query.exec();
  },

  findByFilter(filter: FilterQuery<IBooking>) {
    return BookingModel.find(filter)
      .populate('ride', RIDE_FIELDS)
      .populate('passenger', USER_FIELDS)
      .populate('driver', USER_FIELDS)
      .sort({ createdAt: -1 })
      .exec();
  },

  count(filter: FilterQuery<IBooking> = {}) {
    return BookingModel.countDocuments(filter).exec();
  },
};
