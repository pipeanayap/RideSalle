import { userRepository } from '../repositories/user.repository.js';
import { ratingRepository } from '../repositories/rating.repository.js';
import { uploadService } from './upload.service.js';
import { badRequest, notFound, unauthorized } from '../utils/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import type { UserDocument } from '../models/User.js';
import type { ChangePasswordInput, UpdateProfileInput, VehicleInput } from '../validation/user.schema.js';

async function getOrThrow(userId: string): Promise<UserDocument> {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw notFound('Usuario no encontrado');
  }
  return user;
}

export const userService = {
  getById: getOrThrow,

  async getPublicProfile(userId: string) {
    const user = await getOrThrow(userId);
    const ratings = await ratingRepository.listForUser(userId);
    return { user, ratings };
  },

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<UserDocument> {
    const updated = await userRepository.updateById(userId, input);
    if (!updated) {
      throw notFound('Usuario no encontrado');
    }
    return updated;
  },

  async updateAvatar(userId: string, dataUrl: string): Promise<UserDocument> {
    const user = await getOrThrow(userId);
    if (user.photoPublicId) {
      await uploadService.deleteImage(user.photoPublicId);
    }
    const { url, publicId } = await uploadService.uploadImage(dataUrl, 'avatars');
    user.photoUrl = url;
    user.photoPublicId = publicId;
    await user.save();
    return user;
  },

  async setVehicle(userId: string, vehicle: VehicleInput): Promise<UserDocument> {
    const updated = await userRepository.updateById(userId, { vehicle });
    if (!updated) {
      throw notFound('Usuario no encontrado');
    }
    return updated;
  },

  async removeVehicle(userId: string): Promise<UserDocument> {
    const updated = await userRepository.updateById(userId, { $unset: { vehicle: 1 } });
    if (!updated) {
      throw notFound('Usuario no encontrado');
    }
    return updated;
  },

  async changePassword(userId: string, input: ChangePasswordInput): Promise<void> {
    const user = await userRepository.findByEmailWithPassword(
      (await getOrThrow(userId)).email,
    );
    if (!user) {
      throw notFound('Usuario no encontrado');
    }
    const valid = await verifyPassword(input.currentPassword, user.password);
    if (!valid) {
      throw unauthorized('La contraseña actual es incorrecta');
    }
    if (input.currentPassword === input.newPassword) {
      throw badRequest('La nueva contraseña debe ser diferente');
    }
    user.password = await hashPassword(input.newPassword);
    await user.save();
  },

  /** Recalcula y persiste el promedio/conteo de calificaciones de un usuario. */
  async recalcRatingStats(userId: string): Promise<void> {
    const { average, count } = await ratingRepository.aggregateForUser(userId);
    await userRepository.updateById(userId, { ratingAverage: average, ratingCount: count });
  },
};
