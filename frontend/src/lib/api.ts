import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  // Get token from persisted zustand store
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    } catch (e) {
      console.error('Error parsing auth storage:', e);
    }
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  register: (email: string, password: string, role: string = 'caller') =>
    api.post('/auth/register', { email, password, role }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
};

// Scripts endpoints
export const scriptsApi = {
  getAll: () => api.get('/scripts'),
  getById: (id: number) => api.get(`/scripts/${id}`),
  create: (title: string, content: string) =>
    api.post('/scripts', { title, content }),
};

// Calls endpoints
export const callsApi = {
  start: (persona_id: number) => api.post('/calls/start', { persona_id }),
  getById: (id: number) => api.get(`/calls/${id}`),
  getHistory: () => api.get('/calls/history'),
  end: (id: number) => api.post(`/calls/${id}/end`),
};

// Analytics endpoints
export const analyticsApi = {
  getUserStats: () => api.get('/analytics/user-stats'),
  getLeaderboard: () => api.get('/analytics/leaderboard'),
};

