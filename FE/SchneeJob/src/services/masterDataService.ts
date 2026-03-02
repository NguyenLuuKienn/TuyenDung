/**
 * Master Data Service
 * Handles master data (skills, industries, education levels, etc.)
 */

import api from './api';

export interface Skill {
  id: string;
  skillId?: string;
  skillName?: string;
  name?: string;
}

export interface Industry {
  id: string;
  industryId?: string;
  industryName?: string;
  name?: string;
  description?: string;
}

export interface EducationLevel {
  id: string;
  educationLevelId?: string;
  educationLevelName?: string;
  name?: string;
  description?: string;
}

export const skillService = {
  /**
   * Get all skills
   */
  getAllSkills: async () => {
    try {
      const res = await api.get<Skill[]>('/skill');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      throw error;
    }
  },

  /**
   * Get skill by ID
   */
  getSkillById: async (id: string) => {
    try {
      const res = await api.get<Skill>(`/skill/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch skill ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create skill (Admin only)
   */
  createSkill: async (skillData: Skill) => {
    try {
      const res = await api.post<Skill>('/skill', skillData);
      return res;
    } catch (error) {
      console.error('Failed to create skill:', error);
      throw error;
    }
  },

  /**
   * Update skill (Admin only)
   */
  updateSkill: async (id: string, skillData: Skill) => {
    try {
      const res = await api.put<Skill>(`/skill/${id}`, skillData);
      return res;
    } catch (error) {
      console.error(`Failed to update skill ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete skill (Admin only)
   */
  deleteSkill: async (id: string) => {
    try {
      const res = await api.delete(`/skill/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete skill ${id}:`, error);
      throw error;
    }
  },
};

export const industriesService = {
  /**
   * Get all industries
   */
  getAllIndustries: async () => {
    try {
      const res = await api.get<Industry[]>('/industries');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to fetch industries:', error);
      throw error;
    }
  },

  /**
   * Get industry by ID
   */
  getIndustryById: async (id: string) => {
    try {
      const res = await api.get<Industry>(`/industries/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch industry ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create industry (Admin only)
   */
  createIndustry: async (industryData: Industry) => {
    try {
      const res = await api.post<Industry>('/industries', industryData);
      return res;
    } catch (error) {
      console.error('Failed to create industry:', error);
      throw error;
    }
  },

  /**
   * Update industry (Admin only)
   */
  updateIndustry: async (id: string, industryData: Industry) => {
    try {
      const res = await api.put<Industry>(`/industries/${id}`, industryData);
      return res;
    } catch (error) {
      console.error(`Failed to update industry ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete industry (Admin only)
   */
  deleteIndustry: async (id: string) => {
    try {
      const res = await api.delete(`/industries/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete industry ${id}:`, error);
      throw error;
    }
  },
};

export const educationLevelService = {
  /**
   * Get all education levels
   */
  getAllEducationLevels: async () => {
    try {
      const res = await api.get<EducationLevel[]>('/educationlevels');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to fetch education levels:', error);
      throw error;
    }
  },

  /**
   * Get education level by ID
   */
  getEducationLevelById: async (id: string) => {
    try {
      const res = await api.get<EducationLevel>(`/educationlevels/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch education level ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create education level (Admin only)
   */
  createEducationLevel: async (educationLevelData: EducationLevel) => {
    try {
      const res = await api.post<EducationLevel>('/educationlevels', educationLevelData);
      return res;
    } catch (error) {
      console.error('Failed to create education level:', error);
      throw error;
    }
  },

  /**
   * Update education level (Admin only)
   */
  updateEducationLevel: async (id: string, educationLevelData: EducationLevel) => {
    try {
      const res = await api.put<EducationLevel>(`/educationlevels/${id}`, educationLevelData);
      return res;
    } catch (error) {
      console.error(`Failed to update education level ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete education level (Admin only)
   */
  deleteEducationLevel: async (id: string) => {
    try {
      const res = await api.delete(`/educationlevels/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete education level ${id}:`, error);
      throw error;
    }
  },
};
