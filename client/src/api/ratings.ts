import { http } from './http';
import type { Rating } from '../types';

export const ratingsApi = {
  async create(rideId: string, targetId: string, score: number, comment?: string) {
    const res = await http.post<{ rating: Rating }>('/ratings', { rideId, targetId, score, comment });
    return res.data.rating;
  },

  async listForUser(userId: string) {
    const res = await http.get<{ ratings: Rating[] }>(`/ratings/user/${userId}`);
    return res.data.ratings;
  },
};
