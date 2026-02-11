import api from './api';

/**
 * Resume Service
 * Handles resume operations (JobSeeker only)
 */
const resumeService = {
  /**
   * Get my resumes
   */
  getMyResumes: () => api.get('/api/resumes'),

  /**
   * Add a new resume
   */
  add: async (resumeData) => {
    const payload = {
      FileName: resumeData.fileName || resumeData.FileName,
      FileURL: resumeData.fileURL || resumeData.FileURL,
      FileType: resumeData.fileType || resumeData.FileType,
    };
    console.log('[ResumeService] POST /api/resumes payload:', payload);
    try {
      const res = await api.post('/api/resumes', payload);
      console.log('[ResumeService] POST /api/resumes response:', res.data);
      return res;
    } catch (err) {
      console.error('[ResumeService] POST /api/resumes error:', err.response?.data || err.message);
      throw err;
    }
  },

  /**
   * Delete a resume
   */
  delete: (resumeId) => api.delete(`/api/resumes/${resumeId}`),

  /**
   * Set default resume
   */
  setDefault: (resumeId) =>
    api.patch(`/api/resumes/${resumeId}/set-default`),
};

export default resumeService;
