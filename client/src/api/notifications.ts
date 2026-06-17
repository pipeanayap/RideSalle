import { http } from './http';
import type { Notification } from '../types';

export const notificationsApi = {
  async list() {
    const res = await http.get<{ notifications: Notification[]; unread: number }>('/notifications');
    return res.data;
  },

  async markAsRead(id: string) {
    const res = await http.patch<{ notification: Notification }>(`/notifications/${id}/read`);
    return res.data.notification;
  },

  async markAllAsRead() {
    await http.patch('/notifications/read-all');
  },
};
