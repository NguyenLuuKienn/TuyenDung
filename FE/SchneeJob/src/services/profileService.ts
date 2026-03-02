/**
 * Profile Service
 * Handles job seeker profile operations
 */

import api from './api';

export interface JobSeekerProfile {
  id?: string;
  userId?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  country?: string;
  bio?: string;
  profilePictureURL?: string;
  websiteURL?: string;
  facebookLink?: string;
  linkedinLink?: string;
  twitterLink?: string;
  githubLink?: string;
  currentJobTitle?: string;
  currentCompany?: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  currency?: string;
  preferredWorkMode?: string;
  preferredLocations?: string[];
  preferredIndustries?: string[];
  preferredSkills?: string[];
  yearsOfExperience?: number;
  profileCompletion?: number;
  [key: string]: any;
}

const profileService = {
  /**
   * Get my profile (JobSeeker only)
   */
  getMyProfile: async () => {
    try {
      const res = await api.get<JobSeekerProfile>('/profile/me');
      return res;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: null };
      }
      console.error('Failed to fetch profile:', error);
      throw error;
    }
  },

  /**
   * Create or update my profile (JobSeeker only)
   */
  createOrUpdate: async (profileData: JobSeekerProfile) => {
    try {
      const res = await api.put<JobSeekerProfile>('/profile/me', profileData);
      return res;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  },

  /**
   * Get profile by user ID
   */
  getByUserId: async (userId: string) => {
    try {
      const res = await api.get<JobSeekerProfile>(`/profile/user/${userId}`);
      return res;
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return { data: null };
      }
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

      const res = await api.post<{ url: string }>('/profile/upload-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res;
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      throw error;
    }
  },

  /**
   * Get profile completion percentage
   */
  getProfileCompletion: async () => {
    try {
      const res = await api.get<number>('/profile/completion');
      return res;
    } catch (error) {
      return { data: 0 };
    }
  },
};

export default profileService;
