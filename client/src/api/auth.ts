import { http } from './http';
import type { User } from '../types';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  university: string;
  career: string;
  semester: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authApi = {
  async register(data: RegisterData) {
    const res = await http.post<{ user: User; accessToken: string }>('/auth/register', data);
    return res.data;
  },

  async login(data: LoginData) {
    const res = await http.post<{ user: User; accessToken: string }>('/auth/login', data);
    return res.data;
  },

  async logout() {
    await http.post('/auth/logout');
  },

  async forgotPassword(email: string) {
    await http.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string) {
    await http.post('/auth/reset-password', { token, password });
  },
};
