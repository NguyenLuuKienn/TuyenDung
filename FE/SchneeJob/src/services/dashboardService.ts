/**
 * Dashboard Service
 * Handles dashboard statistics and data
 */

import api from './api';

export interface AdminDashboardStats {
  totalUsers: number;
  totalCompanies: number;
  totalOpenJobs: number;
  totalApplications: number;
  topIndustries: Array<{
    industryName: string;
    jobCount: number;
  }>;
  topSkills: Array<{
    skillName: string;
    jobCount: number;
  }>;
}

export interface EmployerDashboardStats {
  totalJobsPosted: number;
  totalApplicationsReceived: number;
  activeJobs: number;
  inactiveJobs: number;
  averageApplicationsPerJob: number;
  recentApplications: Array<{
    applicationId: string;
    jobTitle: string;
    applicantName: string;
    appliedAt: string;
    status: string;
  }>;
  jobPerformance: Array<{
    jobId: string;
    jobTitle: string;
    applicantCount: number;
    views: number;
  }>;
}

export interface JobSeekerDashboardStats {
  totalApplications: number;
  pendingApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  savedJobs: number;
  followedCompanies: number;
  recentApplications: Array<{
    jobId: string;
    jobTitle: string;
    companyName: string;
    appliedAt: string;
    status: string;
  }>;
  recommendedJobs: Array<{
    jobId: string;
    jobTitle: string;
    companyName: string;
  }>;
}

const dashboardService = {
  /**
   * Get admin statistics (Admin only)
   */
  getAdminStats: async () => {
    try {
      const res = await api.get<AdminDashboardStats>('/dashboard/admin');
      return res;
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get employer statistics (Employer only)
   */
  getEmployerStats: async () => {
    try {
      const res = await api.get<EmployerDashboardStats>('/dashboard/employer');
      return res;
    } catch (error) {
      console.error('Failed to fetch employer dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get job seeker statistics (JobSeeker only)
   */
  getJobSeekerStats: async () => {
    try {
      const res = await api.get<JobSeekerDashboardStats>('/dashboard/jobseeker');
      return res;
    } catch (error) {
      console.error('Failed to fetch job seeker dashboard stats:', error);
      throw error;
    }
  },

  /**
   * Get general statistics
   */
  getGeneralStats: async () => {
    try {
      const res = await api.get('/dashboard/general');
      return res;
    } catch (error) {
      console.error('Failed to fetch general statistics:', error);
      throw error;
    }
  },
};

export default dashboardService;
