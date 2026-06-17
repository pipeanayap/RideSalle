import { http } from './http';
import type { Ride, Paginated } from '../types';

export interface SearchRidesParams {
  origin?: string;
  destination?: string;
  date?: string;
  maxPrice?: number;
  minSeats?: number;
  page?: number;
  limit?: number;
}

export interface CreateRideData {
  origin: string;
  destination: string;
  departureAt: string;
  meetingPoint: string;
  pricePerSeat: number;
  totalSeats: number;
  description?: string;
}

export const ridesApi = {
  async search(params: SearchRidesParams) {
    const res = await http.get<Paginated<Ride>>('/rides', { params });
    return res.data;
  },

  async getById(id: string) {
    const res = await http.get<{ ride: Ride }>(`/rides/${id}`);
    return res.data.ride;
  },

  async create(data: CreateRideData) {
    const res = await http.post<{ ride: Ride }>('/rides', data);
    return res.data.ride;
  },

  async update(id: string, data: Partial<CreateRideData>) {
    const res = await http.patch<{ ride: Ride }>(`/rides/${id}`, data);
    return res.data.ride;
  },

  async cancel(id: string) {
    const res = await http.patch<{ ride: Ride }>(`/rides/${id}/cancel`);
    return res.data.ride;
  },

  async complete(id: string) {
    const res = await http.patch<{ ride: Ride }>(`/rides/${id}/complete`);
    return res.data.ride;
  },

  async myRides() {
    const res = await http.get<{ rides: Ride[] }>('/rides/my');
    return res.data.rides;
  },
};
