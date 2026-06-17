import { http } from './http';
import type { User, Rating, Vehicle } from '../types';

export const usersApi = {
  async getMe() {
    const res = await http.get<{ user: User }>('/users/me');
    return res.data.user;
  },

  async updateMe(data: Partial<Pick<User, 'firstName' | 'lastName' | 'university' | 'career' | 'semester' | 'description'>>) {
    const res = await http.patch<{ user: User }>('/users/me', data);
    return res.data.user;
  },

  async uploadPhoto(dataUrl: string) {
    const res = await http.post<{ user: User }>('/users/me/photo', { dataUrl });
    return res.data.user;
  },

  async setVehicle(vehicle: Omit<Vehicle, '_id'>) {
    const res = await http.post<{ user: User }>('/users/me/vehicle', vehicle);
    return res.data.user;
  },

  async deleteVehicle() {
    const res = await http.delete<{ user: User }>('/users/me/vehicle');
    return res.data.user;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    await http.post('/users/me/change-password', { currentPassword, newPassword });
  },

  async getPublicProfile(userId: string) {
    const res = await http.get<{ user: User; ratings: Rating[] }>(`/users/${userId}`);
    return res.data;
  },
};
