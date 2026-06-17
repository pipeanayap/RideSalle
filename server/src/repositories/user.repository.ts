import type { FilterQuery, UpdateQuery } from 'mongoose';
import { type IUser, UserModel } from '../models/User.js';

export const userRepository = {
  create(data: Partial<IUser>) {
    return UserModel.create(data);
  },

  findById(id: string) {
    return UserModel.findById(id).exec();
  },

  /** Incluye el campo password (oculto por defecto) para autenticación. */
  findByEmailWithPassword(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+password').exec();
  },

  findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  },

  /** Incluye los campos de recuperación de contraseña (ocultos por defecto). */
  findByResetToken(tokenHash: string) {
    return UserModel.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    })
      .select('+resetPasswordToken +resetPasswordExpires +password')
      .exec();
  },

  updateById(id: string, update: UpdateQuery<IUser>) {
    return UserModel.findByIdAndUpdate(id, update, { new: true, runValidators: true }).exec();
  },

  findManyByIds(ids: string[]) {
    return UserModel.find({ _id: { $in: ids } }).exec();
  },

  async paginate(filter: FilterQuery<IUser>, page: number, limit: number) {
    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      UserModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  },

  count(filter: FilterQuery<IUser> = {}) {
    return UserModel.countDocuments(filter).exec();
  },
};
