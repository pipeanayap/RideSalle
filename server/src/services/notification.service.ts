import { Types } from 'mongoose';
import { notificationRepository } from '../repositories/notification.repository.js';
import type { NotificationType } from '../types/index.js';

export interface CreateNotificationParams {
  recipient: string;
  type: NotificationType;
  title: string;
  body: string;
  ride?: string;
}

export const notificationService = {
  create(params: CreateNotificationParams) {
    return notificationRepository.create({
      recipient: new Types.ObjectId(params.recipient),
      type: params.type,
      title: params.title,
      body: params.body,
      ...(params.ride ? { ride: new Types.ObjectId(params.ride) } : {}),
    });
  },

  list(userId: string) {
    return notificationRepository.listForUser(userId);
  },

  countUnread(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  },

  markAllAsRead(userId: string) {
    return notificationRepository.markAllAsRead(userId);
  },
};
