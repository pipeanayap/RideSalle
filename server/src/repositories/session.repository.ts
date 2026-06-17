import { type ISession, SessionModel } from '../models/Session.js';

export const sessionRepository = {
  create(data: Partial<ISession>) {
    return SessionModel.create(data);
  },

  findByTokenHash(tokenHash: string) {
    return SessionModel.findOne({ tokenHash }).exec();
  },

  deleteByTokenHash(tokenHash: string) {
    return SessionModel.deleteOne({ tokenHash }).exec();
  },

  deleteAllForUser(userId: string) {
    return SessionModel.deleteMany({ user: userId }).exec();
  },
};
