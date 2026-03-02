/**
 * File Service
 * Handles file uploads and downloads
 */

import api from './api';

export interface FileUploadResponse {
  fileURL: string;
  fileName: string;
  fileSize: number;
  fileType: string;
}

const fileService = {
  /**
   * Upload file (generic)
   */
  upload: async (file: File, fileType?: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (fileType) formData.append('fileType', fileType);

      const res = await api.post<FileUploadResponse>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  },

  /**
   * Upload profile picture
   */
  uploadProfilePicture: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<FileUploadResponse>('/files/upload-profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  },

  /**
   * Upload resume/CV
   */
  uploadResume: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<FileUploadResponse>('/files/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload resume:', error);
      throw error;
    }
  },

  /**
   * Upload company logo
   */
  uploadCompanyLogo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<FileUploadResponse>('/files/upload-company-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload company logo:', error);
      throw error;
    }
  },

  /**
   * Upload company cover image
   */
  uploadCompanyCover: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<FileUploadResponse>('/files/upload-company-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload company cover image:', error);
      throw error;
    }
  },

  /**
   * Upload post image
   */
  uploadPostImage: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post<FileUploadResponse>('/files/upload-post-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload post image:', error);
      throw error;
    }
  },

  /**
   * Delete file
   */
  delete: async (fileURL: string) => {
    try {
      const res = await api.delete('/files', {
        params: { fileURL },
      });
      return res;
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  },

  /**
   * Get file info
   */
  getInfo: async (fileURL: string) => {
    try {
      const res = await api.get('/files/info', {
        params: { fileURL },
      });
      return res;
    } catch (error) {
      console.error('Failed to get file info:', error);
      throw error;
    }
  },
};

export default fileService;
