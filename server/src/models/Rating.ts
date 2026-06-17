import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';

export interface IRating {
  _id: Types.ObjectId;
  ride: Types.ObjectId;
  author: Types.ObjectId;
  target: Types.ObjectId;
  score: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type RatingDocument = HydratedDocument<IRating>;

const ratingSchema = new Schema<IRating>(
  {
    ride: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    target: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

// Una sola calificación por (viaje, autor, destinatario).
ratingSchema.index({ ride: 1, author: 1, target: 1 }, { unique: true });

export const RatingModel: Model<IRating> = model<IRating>('Rating', ratingSchema);
