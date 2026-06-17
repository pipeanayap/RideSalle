import { http } from './http';
import type { User, Ride, Paginated } from '../types';

export const adminApi = {
  async listUsers(page = 1, limit = 20, search?: string) {
    const res = await http.get<Paginated<User>>('/admin/users', {
      params: { page, limit, search },
    });
    return res.data;
  },

  async suspendUser(id: string) {
    const res = await http.patch<{ user: User }>(`/admin/users/${id}/suspend`);
    return res.data.user;
  },

  async activateUser(id: string) {
    const res = await http.patch<{ user: User }>(`/admin/users/${id}/activate`);
    return res.data.user;
  },

  async listRides(page = 1, limit = 20) {
    const res = await http.get<Paginated<Ride>>('/admin/rides', { params: { page, limit } });
    return res.data;
  },

  async deleteRide(id: string) {
    await http.delete(`/admin/rides/${id}`);
  },

  async stats() {
    const res = await http.get<{ totalUsers: number; totalRides: number; totalBookings: number }>(
      '/admin/stats',
    );
    return res.data;
  },
};
