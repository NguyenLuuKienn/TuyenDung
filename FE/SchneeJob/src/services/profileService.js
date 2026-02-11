import api from './api';

/**
 * Profile Service
 * Handles job seeker profile operations
 */
const profileService = {
  /**
   * Get my profile (JobSeeker only)
   */
  getMyProfile: () => api.get('/api/profile/me'),

  /**
   * Create or update my profile (JobSeeker only)
   */
  createOrUpdate: (profileData) =>
    api.put('/api/profile/me', profileData),
};

export default profileService;
