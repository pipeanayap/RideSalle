import { http } from './http';
import type { Chat, Message } from '../types';

export const chatsApi = {
  async list() {
    const res = await http.get<{ chats: Chat[] }>('/chats');
    return res.data.chats;
  },

  async getById(id: string) {
    const res = await http.get<{ chat: Chat }>(`/chats/${id}`);
    return res.data.chat;
  },

  async getMessages(chatId: string) {
    const res = await http.get<{ messages: Message[] }>(`/chats/${chatId}/messages`);
    return res.data.messages;
  },

  async sendMessage(chatId: string, content: string) {
    const res = await http.post<{ message: Message }>('/chats/messages', { chatId, content });
    return res.data.message;
  },

  async joinByRide(rideId: string) {
    const res = await http.post<{ chat: Chat }>(`/chats/ride/${rideId}/join`);
    return res.data.chat;
  },
};
