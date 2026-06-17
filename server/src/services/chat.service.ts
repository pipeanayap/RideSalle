import { Types } from 'mongoose';
import { chatRepository } from '../repositories/chat.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { rideRepository } from '../repositories/ride.repository.js';
import { notificationService } from './notification.service.js';
import { badRequest, forbidden, notFound } from '../utils/AppError.js';
import type { ChatDocument } from '../models/Chat.js';
import type { MessageDocument } from '../models/Message.js';
import type { SendMessageInput } from '../validation/chat.schema.js';

async function getOrCreateChat(rideId: string, userId: string): Promise<ChatDocument> {
  const ride = await rideRepository.findRaw(rideId);
  if (!ride) throw notFound('Viaje no encontrado');

  let chat = await chatRepository.findByRide(rideId);
  if (!chat) {
    chat = await chatRepository.create({
      ride: new Types.ObjectId(rideId),
      participants: [ride.driver],
    });
  }

  const isParticipant = chat.participants.some((p) => p.toString() === userId);
  if (!isParticipant) {
    if (ride.status === 'cancelled') throw badRequest('El viaje está cancelado');
    chat.participants.push(new Types.ObjectId(userId));
    await chat.save();
  }

  return chat;
}

export const chatService = {
  async listForUser(userId: string): Promise<ChatDocument[]> {
    return chatRepository.listForUser(userId);
  },

  async getChat(chatId: string, userId: string): Promise<ChatDocument> {
    const chat = await chatRepository.findById(chatId);
    if (!chat) throw notFound('Chat no encontrado');
    const isParticipant = chat.participants.some((p) => {
      const participant = p as unknown as { _id: { toString: () => string } };
      return participant._id?.toString() === userId || p.toString() === userId;
    });
    if (!isParticipant) throw forbidden('No tienes acceso a este chat');
    return chat;
  },

  async getMessages(chatId: string, userId: string): Promise<MessageDocument[]> {
    await chatService.getChat(chatId, userId);
    const messages = await messageRepository.listByChat(chatId);
    await messageRepository.markAsRead(chatId, userId);
    return messages;
  },

  async sendMessage(senderId: string, input: SendMessageInput): Promise<MessageDocument> {
    const chat = await chatRepository.findOneRaw({ _id: new Types.ObjectId(input.chatId) });
    if (!chat) throw notFound('Chat no encontrado');

    const isParticipant = chat.participants.some((p) => p.toString() === senderId);
    if (!isParticipant) throw forbidden('No puedes enviar mensajes en este chat');

    const message = await messageRepository.create({
      chat: new Types.ObjectId(input.chatId),
      sender: new Types.ObjectId(senderId),
      content: input.content,
      readBy: [new Types.ObjectId(senderId)],
    });

    await chatRepository.updateById(input.chatId, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    });

    const recipients = chat.participants.filter((p) => p.toString() !== senderId);
    await Promise.all(
      recipients.map((recipientId) =>
        notificationService.create({
          recipient: recipientId.toString(),
          type: 'new_message',
          title: 'Nuevo mensaje',
          body: input.content.slice(0, 80),
        }),
      ),
    );

    return messageRepository.findById(message._id.toString()) as Promise<MessageDocument>;
  },

  async getOrJoinChatByRide(rideId: string, userId: string): Promise<ChatDocument> {
    return getOrCreateChat(rideId, userId);
  },
};
