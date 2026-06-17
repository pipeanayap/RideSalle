import { http } from './http';
import type { Booking } from '../types';

export const bookingsApi = {
  async create(rideId: string, seats = 1, message?: string) {
    const res = await http.post<{ booking: Booking }>('/bookings', { rideId, seats, message });
    return res.data.booking;
  },

  async getById(id: string) {
    const res = await http.get<{ booking: Booking }>(`/bookings/${id}`);
    return res.data.booking;
  },

  async myBookings() {
    const res = await http.get<{ bookings: Booking[] }>('/bookings/my');
    return res.data.bookings;
  },

  async pendingAsDriver() {
    const res = await http.get<{ bookings: Booking[] }>('/bookings/pending-driver');
    return res.data.bookings;
  },

  async accept(id: string) {
    const res = await http.patch<{ booking: Booking }>(`/bookings/${id}/accept`);
    return res.data.booking;
  },

  async reject(id: string) {
    const res = await http.patch<{ booking: Booking }>(`/bookings/${id}/reject`);
    return res.data.booking;
  },

  async cancel(id: string) {
    const res = await http.patch<{ booking: Booking }>(`/bookings/${id}/cancel`);
    return res.data.booking;
  },
};
