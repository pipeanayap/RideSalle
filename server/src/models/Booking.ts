import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import { BOOKING_STATUSES, type BookingStatus } from '../types/index.js';

export interface IBooking {
  _id: Types.ObjectId;
  ride: Types.ObjectId;
  passenger: Types.ObjectId;
  driver: Types.ObjectId;
  seats: number;
  status: BookingStatus;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

const bookingSchema = new Schema<IBooking>(
  {
    ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    passenger: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seats: { type: Number, required: true, min: 1, max: 8, default: 1 },
    status: { type: String, enum: BOOKING_STATUSES, default: 'pending', index: true },
    message: { type: String, maxlength: 300 },
  },
  { timestamps: true },
);

// Un pasajero no puede tener dos reservas ACTIVAS para el mismo viaje,
// pero sí volver a solicitar tras una cancelación/rechazo (índice parcial).
bookingSchema.index(
  { ride: 1, passenger: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['pending', 'accepted'] } } },
);

export const BookingModel: Model<IBooking> = model<IBooking>('Booking', bookingSchema);
