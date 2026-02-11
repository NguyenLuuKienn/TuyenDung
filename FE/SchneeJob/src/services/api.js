import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7024';
const API_TIMEOUT = import.meta.env.VITE_API_TIMEOUT || 30000;

console.log('[API] Initializing with URL:', API_BASE_URL, 'Timeout:', API_TIMEOUT);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('[API Request]', config.method.toUpperCase(), config.url, '(timeout:', config.timeout + 'ms)');
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Handle response
api.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url, 'data:', response.data);
    return response;
  },
  (error) => {
    console.error('[API Response Error]', error.response?.status, error.config?.url, 'message:', error.message, 'data:', error.response?.data);
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('[API] 401 Unauthorized - clearing auth');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // DON'T use window.location.href - it causes hard reload
      // Instead, let the application handle 401 and redirect via React Router
    }
    return Promise.reject(error);
  }
);

export default api;

