import api from './api';

/**
 * Auth Service
 * Handles user authentication (login, register, logout)
 */
const authService = {
  /**
   * Register as Job Seeker
   */
  registerJobSeeker: (data) => {
    console.log('[authService] Registering job seeker:', data.email);
    return api.post('/api/auth/register-jobseeker', {
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      passwordHash: data.password,
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
  registerEmployer: (data) => {
    console.log('[authService] Registering employer:', data.email);
    return api.post('/api/auth/register-employer', {
      email: data.email,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      passwordHash: data.password,
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
  login: (email, password) => {
    console.log('[authService] Sending login request for:', email);
    return api.post('/api/auth/login', {
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
  },
};

export default authService;
