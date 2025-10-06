import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Letters API
export const lettersAPI = {
  getTypes: () => api.get('/letters/types'),
  create: (data) => api.post('/letters', data),
  getAll: (params) => api.get('/letters', { params }),
  getById: (id) => api.get(`/letters/${id}`),
  updateStatus: (id, data) => api.put(`/letters/${id}/status`, data),
  delete: (id) => api.delete(`/letters/${id}`),
  cancelNumber: (id) => api.put(`/letters/${id}/number/cancel`),
  editNumber: (id, data) => api.put(`/letters/${id}/number/edit`, data),
  getStats: (params) => api.get('/letters/stats/numbering', { params }),
};

export default api;
