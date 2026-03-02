/**
 * Saved Job Service
 * Handles saved job operations
 */

import api from './api';

export interface SavedJob {
  id: string;
  savedJobId?: string;
  userId: string;
  jobId: string;
  savedAt: string;
  job?: {
    id: string;
    title: string;
    company?: {
      name: string;
    };
  };
  [key: string]: any;
}

const savedJobService = {
  /**
   * Get my saved jobs (JobSeeker only)
   */
  getMySavedJobs: async () => {
    try {
      const res = await api.get<SavedJob[]>('/savedjob/saved-jobs');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: [] };
      }
      console.error('Failed to fetch saved jobs:', error);
      throw error;
    }
  },

  /**
   * Save a job (JobSeeker only)
   */
  save: async (jobId: string) => {
    try {
      const res = await api.post<SavedJob>(`/savedjob/saved-jobs/${jobId}`);
      return res;
    } catch (error) {
      console.error(`Failed to save job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Unsave a job (JobSeeker only)
   */
  unsave: async (jobId: string) => {
    try {
      const res = await api.delete(`/savedjob/saved-jobs/${jobId}`);
      return res;
    } catch (error) {
      console.error(`Failed to unsave job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Check if job is saved
   */
  isJobSaved: async (jobId: string) => {
    try {
      const res = await api.get<boolean>(`/savedjob/saved-jobs/${jobId}/check`);
      return res;
    } catch (error) {
      return { data: false };
    }
  },
};

export default savedJobService;
