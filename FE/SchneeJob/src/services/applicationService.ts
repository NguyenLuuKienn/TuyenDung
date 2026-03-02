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
  appliedAt: string;
  updatedAt: string;
  job?: {
    id: string;
    title: string;
    company?: {
      name: string;
    };
  };
  resume?: {
    id: string;
    title: string;
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
      console.error('Failed to fetch my applications:', error);
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
