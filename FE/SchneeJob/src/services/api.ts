/**
 * API Client - Centralized HTTP Request Handler
 * Handles all communication with the ASP.NET Core Backend API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Get API base URL from environment variables
// Use Vite's import.meta.env which is replaced at build time
const API_BASE_URL = (() => {
  // Try to access Vite env variable - it will be replaced with actual value at build time
  // If not available at runtime, use default
  const env = (globalThis as any).__VITE_API_URL__ 
    || (globalThis as any).import?.meta?.env?.VITE_API_URL
    || 'https://localhost:7024/api';
  return env as string;
})();

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to headers
axiosInstance.interceptors.request.use(
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

// Response interceptor - Handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login only if we're not already on login page
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not on login or register page
      const currentPath = globalThis.window?.location?.pathname || '';
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        globalThis.window?.location?.assign('/login');
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access Forbidden:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// API Response wrapper type
interface ApiResponse<T = any> {
  data?: T;
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  [key: string]: any;
}

// Generic request method
const api = {
  /**
   * GET request
   */
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      const response = await axiosInstance.get<ApiResponse<T>>(url, config);
      return response;
    } catch (error) {
      console.error(`GET ${url}:`, error);
      throw error;
    }
  },

  /**
   * POST request
   */
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      const response = await axiosInstance.post<ApiResponse<T>>(url, data, config);
      return response;
    } catch (error) {
      console.error(`POST ${url}:`, error);
      throw error;
    }
  },

  /**
   * PUT request
   */
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
      return response;
    } catch (error) {
      console.error(`PUT ${url}:`, error);
      throw error;
    }
  },

  /**
   * PATCH request
   */
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      const response = await axiosInstance.patch<ApiResponse<T>>(url, data, config);
      return response;
    } catch (error) {
      console.error(`PATCH ${url}:`, error);
      throw error;
    }
  },

  /**
   * DELETE request
   */
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<T>>> => {
    try {
      const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
      return response;
    } catch (error) {
      console.error(`DELETE ${url}:`, error);
      throw error;
    }
  },

  /**
   * Set authorization token
   */
  setToken: (token: string | null) => {
    if (token) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axiosInstance.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  },

  /**
   * Get current base URL
   */
  getBaseURL: () => API_BASE_URL,

  /**
   * Get axios instance for advanced usage
   */
  getInstance: () => axiosInstance,
};

export default api;
