import { model, Schema, type HydratedDocument, type Model, type Types } from 'mongoose';

/**
 * Sesión de refresh token. Se almacena el hash del token (nunca el token en claro) para
 * poder revocar sesiones (logout) y rotar refresh tokens.
 */
export interface ISession {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  tokenHash: string;
  userAgent?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SessionDocument = HydratedDocument<ISession>;

const sessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    userAgent: { type: String },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL: MongoDB elimina la sesión automáticamente al expirar.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel: Model<ISession> = model<ISession>('Session', sessionSchema);
