import { type IMessage, MessageModel } from '../models/Message.js';

const SENDER_FIELDS = 'firstName lastName photoUrl';

export const messageRepository = {
  create(data: Partial<IMessage>) {
    return MessageModel.create(data);
  },

  findById(id: string) {
    return MessageModel.findById(id).populate('sender', SENDER_FIELDS).exec();
  },

  listByChat(chatId: string, limit = 100) {
    return MessageModel.find({ chat: chatId })
      .populate('sender', SENDER_FIELDS)
      .sort({ createdAt: 1 })
      .limit(limit)
      .exec();
  },

  /** Marca como leídos los mensajes de un chat que no envió el usuario dado. */
  markAsRead(chatId: string, userId: string) {
    return MessageModel.updateMany(
      { chat: chatId, sender: { $ne: userId }, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } },
    ).exec();
  },

  countUnread(chatId: string, userId: string) {
    return MessageModel.countDocuments({
      chat: chatId,
      sender: { $ne: userId },
      readBy: { $ne: userId },
    }).exec();
  },
};
