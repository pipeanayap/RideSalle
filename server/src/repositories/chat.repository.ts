import type { FilterQuery, UpdateQuery } from 'mongoose';
import { type IChat, ChatModel } from '../models/Chat.js';

const PARTICIPANT_FIELDS = 'firstName lastName photoUrl';

export const chatRepository = {
  create(data: Partial<IChat>) {
    return ChatModel.create(data);
  },

  findByRide(rideId: string) {
    return ChatModel.findOne({ ride: rideId }).exec();
  },

  findById(id: string) {
    return ChatModel.findById(id)
      .populate('participants', PARTICIPANT_FIELDS)
      .populate('ride', 'origin destination departureAt status')
      .exec();
  },

  findOneRaw(filter: FilterQuery<IChat>) {
    return ChatModel.findOne(filter).exec();
  },

  listForUser(userId: string) {
    return ChatModel.find({ participants: userId })
      .populate('participants', PARTICIPANT_FIELDS)
      .populate('ride', 'origin destination departureAt status')
      .populate('lastMessage', 'content sender createdAt')
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .exec();
  },

  updateById(id: string, update: UpdateQuery<IChat>) {
    return ChatModel.findByIdAndUpdate(id, update, { new: true }).exec();
  },
};
