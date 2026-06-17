import axios from 'axios';

export const http = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  for (const p of pendingQueue) {
    if (error) p.reject(error);
    else p.resolve(token!);
  }
  pendingQueue = [];
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers['Authorization'] = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as (typeof error.config) & { _retry?: boolean };
    if (error.response?.status !== 401 || original._retry) return Promise.reject(error);
    const url: string = original.url ?? '';
    if (url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers['Authorization'] = `Bearer ${token}`;
        return http(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await http.post<{ accessToken: string }>('/auth/refresh');
      localStorage.setItem('accessToken', data.accessToken);
      processQueue(null, data.accessToken);
      original.headers['Authorization'] = `Bearer ${data.accessToken}`;
      return http(original);
    } catch (err) {
      processQueue(err, null);
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
