import { type INotification, NotificationModel } from '../models/Notification.js';

export const notificationRepository = {
  create(data: Partial<INotification>) {
    return NotificationModel.create(data);
  },

  listForUser(userId: string, limit = 30) {
    return NotificationModel.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  countUnread(userId: string) {
    return NotificationModel.countDocuments({ recipient: userId, read: false }).exec();
  },

  markAsRead(id: string, userId: string) {
    return NotificationModel.findOneAndUpdate(
      { _id: id, recipient: userId },
      { read: true },
      { new: true },
    ).exec();
  },

  markAllAsRead(userId: string) {
    return NotificationModel.updateMany(
      { recipient: userId, read: false },
      { read: true },
    ).exec();
  },
};
