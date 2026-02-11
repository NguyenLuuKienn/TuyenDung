import api from './api';

/**
 * Saved Job Service
 * Handles saved job operations
 */
const savedJobService = {
  /**
   * Get my saved jobs
   */
  getMySavedJobs: () => api.get('/api/savedjob/saved-jobs'),

  /**
   * Save a job
   */
  save: (jobId) => api.post(`/api/savedjob/saved-jobs/${jobId}`),

  /**
   * Unsave a job
   */
  unsave: (jobId) => api.delete(`/api/savedjob/saved-jobs/${jobId}`),
};

export default savedJobService;
