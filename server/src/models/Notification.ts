import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import { NOTIFICATION_TYPES, type NotificationType } from '../types/index.js';

export interface INotification {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  ride?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationDocument = HydratedDocument<INotification>;

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    read: { type: Boolean, default: false, index: true },
    ride: { type: Schema.Types.ObjectId, ref: 'Ride' },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export const NotificationModel: Model<INotification> = model<INotification>(
  'Notification',
  notificationSchema,
);
