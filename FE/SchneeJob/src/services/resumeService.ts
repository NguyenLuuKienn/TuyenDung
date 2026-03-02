/**
 * Resume Service
 * Handles resume/CV operations for job seekers
 */

import api from './api';

export interface Resume {
  id: string;
  resumeId?: string;
  userId?: string;
  title: string;
  fileURL?: string;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ResumeCreateRequest {
  title: string;
  fileURL?: string;
  isDefault?: boolean;
}

const resumeService = {
  /**
   * Get my resumes (JobSeeker only)
   */
  getMyResumes: async () => {
    try {
      const res = await api.get<Resume[]>('/resumes/my');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: [] };
      }
      console.error('Failed to fetch resumes:', error);
      throw error;
    }
  },

  /**
   * Get resume by ID
   */
  getById: async (resumeId: string) => {
    try {
      const res = await api.get<Resume>(`/resumes/${resumeId}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch resume ${resumeId}:`, error);
      throw error;
    }
  },

  /**
   * Create resume
   */
  create: async (resumeData: ResumeCreateRequest) => {
    try {
      const res = await api.post<Resume>('/resumes', resumeData);
      return res;
    } catch (error) {
      console.error('Failed to create resume:', error);
      throw error;
    }
  },

  /**
   * Update resume
   */
  update: async (resumeId: string, resumeData: ResumeCreateRequest) => {
    try {
      const res = await api.put<Resume>(`/resumes/${resumeId}`, resumeData);
      return res;
    } catch (error) {
      console.error(`Failed to update resume ${resumeId}:`, error);
      throw error;
    }
  },

  /**
   * Delete resume
   */
  delete: async (resumeId: string) => {
    try {
      const res = await api.delete(`/resumes/${resumeId}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete resume ${resumeId}:`, error);
      throw error;
    }
  },

  /**
   * Upload resume file
   */
  uploadFile: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<{ fileURL: string }>('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload resume file:', error);
      throw error;
    }
  },

  /**
   * Set default resume
   */
  setDefault: async (resumeId: string) => {
    try {
      const res = await api.put<Resume>(`/resumes/${resumeId}/set-default`);
      return res;
    } catch (error) {
      console.error(`Failed to set resume as default:`, error);
      throw error;
    }
  },

  /**
   * Get default resume
   */
  getDefault: async () => {
    try {
      const res = await api.get<Resume>('/resumes/default');
      return res;
    } catch (error) {
      return { data: null };
    }
  },
};

export default resumeService;
