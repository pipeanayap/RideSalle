import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import { RIDE_STATUSES, type RideStatus } from '../types/index.js';

export interface IRide {
  _id: Types.ObjectId;
  driver: Types.ObjectId;
  origin: string;
  destination: string;
  departureAt: Date;
  meetingPoint: string;
  pricePerSeat: number;
  totalSeats: number;
  seatsAvailable: number;
  description?: string;
  status: RideStatus;
  passengers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type RideDocument = HydratedDocument<IRide>;

const rideSchema = new Schema<IRide>(
  {
    driver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    origin: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    departureAt: { type: Date, required: true, index: true },
    meetingPoint: { type: String, required: true, trim: true },
    pricePerSeat: { type: Number, required: true, min: 0, max: 100000 },
    totalSeats: { type: Number, required: true, min: 1, max: 8 },
    seatsAvailable: { type: Number, required: true, min: 0, max: 8 },
    description: { type: String, maxlength: 500 },
    status: { type: String, enum: RIDE_STATUSES, default: 'scheduled', index: true },
    passengers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);

// Búsquedas frecuentes: por ruta + fecha + estado.
rideSchema.index({ origin: 1, destination: 1, departureAt: 1, status: 1 });
rideSchema.index({ status: 1, departureAt: 1 });

export const RideModel: Model<IRide> = model<IRide>('Ride', rideSchema);
