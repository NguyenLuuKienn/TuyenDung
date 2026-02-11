import api from './api';

/**
 * Application Service
 * Handles job applications
 */
const applicationService = {
  /**
   * Apply for a job (JobSeeker only)
   */
  applyForJob: (jobId, resumeId, coverLetter) =>
    // Send PascalCase keys to match backend request DTO
    api.post('/api/applications', {
      JobId: jobId,
      ResumeId: resumeId,
      CoverLetter: coverLetter,
    }),

  /**
   * Get my applications (JobSeeker only)
   */
  getMyApplications: () => api.get('/api/applications/my'),

  /**
   * Get applications for a job (Employer only)
   */
  getForJob: (jobId) => api.get(`/api/applications/job/${jobId}`),

  /**
   * Update application status (Employer only)
   */
  updateStatus: (applicationId, newStatus) => {
    const formatted = typeof newStatus === 'string' && newStatus.length > 0
      ? newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      : newStatus;
    return api.patch(`/api/applications/${applicationId}/status`, {
      NewStatus: formatted,
    });
  },
};

export default applicationService;
