/**
 * Authentication Service
 * Handles user authentication (login, register, logout)
 */

import api from './api';

export interface LoginRequest {
  email: string;
  passwordHash: string;
}

export interface RegisterJobSeekerRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  passwordHash: string;
}

export interface RegisterEmployerRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  passwordHash: string;
  companyName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string | null;
  token: string;
  userInfo?: {
    userID?: string;
    id?: string;
    email?: string;
    name?: string;
    fullName?: string;
    avatar?: string;
    role?: string;
    [key: string]: any;
  };
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const authService = {
  /**
   * Register as Job Seeker
   */
  registerJobSeeker: (data: RegisterJobSeekerRequest) => {
    console.log('[authService] Registering job seeker:', data.email);
    return api.post<AuthResponse>('/auth/register-jobseeker', {
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      passwordHash: data.passwordHash,
    }).then(response => {
      console.log('[authService] Job seeker registration response:', response.status, response.data);
      return response;
    }).catch(error => {
      console.error('[authService] Job seeker registration failed:', error.response?.status, error.response?.data || error.message);
      throw error;
    });
  },

  /**
   * Register as Employer
   */
  registerEmployer: (data: RegisterEmployerRequest) => {
    console.log('[authService] Registering employer:', data.email);
    return api.post<AuthResponse>('/auth/register-employer', {
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      passwordHash: data.passwordHash,
      companyName: data.companyName,
    }).then(response => {
      console.log('[authService] Employer registration response:', response.status, response.data);
      return response;
    }).catch(error => {
      console.error('[authService] Employer registration failed:', error.response?.status, error.response?.data || error.message);
      throw error;
    });
  },

  /**
   * Login
   */
  login: (email: string, password: string) => {
    console.log('[authService] Sending login request for:', email);
    return api.post<AuthResponse>('/auth/login', {
      email,
      passwordHash: password,
    }).then(response => {
      console.log('[authService] Login response received:', response.status, response.data);
      return response;
    }).catch(error => {
      console.error('[authService] Login request failed:', error.response?.status, error.response?.data || error.message);
      throw error;
    });
  },

  /**
   * Logout
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.setToken(null);
  },

  /**
   * Refresh token
   */
  refreshToken: () => api.post('/auth/refresh'),

  /**
   * Verify email
   */
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),

  /**
   * Request password reset
   */
  requestPasswordReset: (email: string) => api.post('/auth/forgot-password', { email }),

  /**
   * Reset password
   */
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
};

export default authService;
