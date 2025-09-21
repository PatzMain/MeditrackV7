import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://meditrack-app.vercel.app/api'
    : 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  login: (credentials: LoginRequest): Promise<AuthResponse> =>
    api.post('/auth/login', credentials).then(res => res.data),

  register: (userData: RegisterRequest): Promise<AuthResponse> =>
    api.post('/auth/register', userData).then(res => res.data),

  logout: (): Promise<void> =>
    api.post('/auth/logout').then(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }),

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  }
};

export const userService = {
  getProfile: (): Promise<User> =>
    api.get('/users/profile').then(res => res.data),

  getActivity: (): Promise<any[]> =>
    api.get('/users/activity').then(res => res.data)
};