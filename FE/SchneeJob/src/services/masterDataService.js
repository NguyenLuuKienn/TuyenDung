import api from './api';

export const skillService = {
  getAllSkills: () => api.get('/api/skill'),
  getSkillById: (id) => api.get(`/api/skill/${id}`),
  createSkill: (skillData) => api.post('/api/skill', skillData),
  updateSkill: (id, skillData) => api.put(`/api/skill/${id}`, skillData),
  deleteSkill: (id) => api.delete(`/api/skill/${id}`),
};

export const industriesService = {
  getAllIndustries: () => api.get('/api/industries'),
  getIndustryById: (id) => api.get(`/api/industries/${id}`),
  createIndustry: (industryData) => api.post('/api/industries', industryData),
  updateIndustry: (id, industryData) => api.put(`/api/industries/${id}`, industryData),
  deleteIndustry: (id) => api.delete(`/api/industries/${id}`),
};

export const educationLevelService = {
  getAllEducationLevels: () => api.get('/api/educationlevels'),
  getEducationLevelById: (id) => api.get(`/api/educationlevels/${id}`),
  createEducationLevel: (levelData) => api.post('/api/educationlevels', levelData),
  updateEducationLevel: (id, levelData) => api.put(`/api/educationlevels/${id}`, levelData),
  deleteEducationLevel: (id) => api.delete(`/api/educationlevels/${id}`),
};
