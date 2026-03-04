/**
 * Application Service
 * Handles job applications
 */

import api from './api';

export interface ApplicationCreateRequest {
  JobId: string;
  ResumeId: string;
  CoverLetter: string;
}

export interface Application {
  id: string;
  applicationId?: string;
  userId: string;
  jobId: string;
  resumeId: string;
  coverLetter: string;
  status: string;
  appliedDate: string; // From backend API
  AppliedDate?: string; // Fallback for older responses
  updatedAt?: string;
  user?: {
    id?: string;
    userId?: string;
    fullName?: string;
    email?: string;
    avatarURL?: string;
    avatar?: string;
    phoneNumber?: string;
  };
  job?: {
    id?: string;
    jobId?: string;
    title?: string;
    jobTitle?: string; // Main property from backend
    jobDescription?: string;
    company?: {
      id?: string;
      companyId?: string;
      name?: string;
      companyName?: string; // Main property from backend
    };
  };
  resume?: {
    id: string;
    resumeId?: string;
    title?: string;
    resumeTitle?: string;
  };
  [key: string]: any;
}

const applicationService = {
  /**
   * Apply for a job (JobSeeker only)
   */
  applyForJob: async (jobId: string, resumeId: string, coverLetter: string) => {
    try {
      const res = await api.post<Application>('/applications', {
        JobId: jobId,
        ResumeId: resumeId,
        CoverLetter: coverLetter,
      });
      return res;
    } catch (error) {
      console.error('Failed to apply for job:', error);
      throw error;
    }
  },

  /**
   * Get my applications (JobSeeker only)
   */
  getMyApplications: async () => {
    try {
      const res = await api.get<Application[]>('/applications/my');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        console.warn('Applications endpoint not found, returning empty array');
        return { data: [] };
      }
      console.error('Failed to fetch my applications:', error);
      throw error;
    }
  },

  /**
   * Get all applications for employer's jobs (Employer only)
   */
  getMyEmployerApplications: async () => {
    try {
      const res = await api.get<Application[]>('/applications/employer');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        console.warn('Employer applications endpoint not found, returning empty array');
        return { data: [] };
      }
      console.error('Failed to fetch employer applications:', error);
      throw error;
    }
  },

  /**
   * Get applications for a job (Employer only)
   */
  getForJob: async (jobId: string) => {
    try {
      const res = await api.get<Application[]>(`/applications/job/${jobId}`);
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: [] };
      }
      console.error(`Failed to fetch applications for job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Update application status (Employer only)
   */
  updateStatus: async (applicationId: string, newStatus: string) => {
    try {
      const formatted =
        typeof newStatus === 'string' && newStatus.length > 0
          ? newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
          : newStatus;

      const res = await api.patch<Application>(
        `/applications/${applicationId}/status`,
        { newStatus: formatted }
      );
      return res;
    } catch (error) {
      console.error(`Failed to update application status:`, error);
      throw error;
    }
  },

  /**
   * Get application by ID
   */
  getById: async (applicationId: string) => {
    try {
      const res = await api.get<Application>(`/applications/${applicationId}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch application ${applicationId}:`, error);
      throw error;
    }
  },

  /**
   * Withdraw application (JobSeeker only)
   */
  withdraw: async (applicationId: string) => {
    try {
      const res = await api.delete(`/applications/${applicationId}`);
      return res;
    } catch (error) {
      console.error(`Failed to withdraw application ${applicationId}:`, error);
      throw error;
    }
  },
};

export default applicationService;
