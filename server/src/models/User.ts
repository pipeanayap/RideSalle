import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import { USER_ROLES, USER_STATUSES, type UserRole, type UserStatus } from '../types/index.js';

/** Vehículo del conductor (subdocumento opcional 1:1 dentro de User). */
export interface IVehicle {
  brand: string;
  model: string;
  year: number;
  color: string;
  plates: string;
  seats: number;
}

export interface IUser {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  photoUrl?: string;
  photoPublicId?: string;
  university: string;
  career: string;
  semester: number;
  description?: string;
  role: UserRole;
  status: UserStatus;
  vehicle?: IVehicle;
  ratingAverage: number;
  ratingCount: number;
  ridesCompleted: number;
  ridesPublished: number;
  passengersTransported: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

const vehicleSchema = new Schema<IVehicle>(
  {
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, required: true, min: 1980, max: new Date().getFullYear() + 1 },
    color: { type: String, required: true, trim: true },
    plates: { type: String, required: true, trim: true, uppercase: true },
    seats: { type: Number, required: true, min: 1, max: 8 },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    photoUrl: { type: String },
    photoPublicId: { type: String },
    university: { type: String, required: true, trim: true },
    career: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 20 },
    description: { type: String, maxlength: 500 },
    role: { type: String, enum: USER_ROLES, default: 'user', index: true },
    status: { type: String, enum: USER_STATUSES, default: 'active', index: true },
    vehicle: { type: vehicleSchema, default: undefined },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    ridesCompleted: { type: Number, default: 0, min: 0 },
    ridesPublished: { type: Number, default: 0, min: 0 },
    passengersTransported: { type: Number, default: 0, min: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const UserModel: Model<IUser> = model<IUser>('User', userSchema);
