import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';

export interface IChat {
  _id: Types.ObjectId;
  ride: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type ChatDocument = HydratedDocument<IChat>;

const chatSchema = new Schema<IChat>(
  {
    ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, unique: true, index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

chatSchema.index({ participants: 1, lastMessageAt: -1 });

export const ChatModel: Model<IChat> = model<IChat>('Chat', chatSchema);
