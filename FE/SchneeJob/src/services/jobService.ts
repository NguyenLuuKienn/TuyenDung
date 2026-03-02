/**
 * Job Service
 * Handles job-related operations (get, create, update, delete)
 */

import api from './api';

export interface JobCreateRequest {
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  jobLevel: string;
  employmentType: string;
  workMode: string;
  deadline: string;
  benefits?: string[];
  jobSkills?: string[];
}

export interface JobUpdateRequest extends JobCreateRequest {
  jobId?: string;
}

export interface Job {
  id?: string;
  jobId: string;
  title?: string;
  jobTitle: string;
  description?: string;
  jobDescription: string;
  requirements?: string;
  jobRequirements: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  salaryType?: string;
  currency?: string;
  jobLevel?: string;
  employmentType: string;
  workMode?: string;
  deadline?: string;
  status: string;
  companyId: string;
  isPriority?: boolean;
  views?: number;
  company?: {
    id: string;
    name: string;
    logo?: string;
  };
  jobSkills?: string[];
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Helper to map backend Job to frontend shape
const mapJob = (j: any): Job | null => {
  if (!j) return null;
  const company = j.company || j.Company || null;
  const jobSkills = j.jobSkills || j.JobSkills || [];

  return {
    jobId: j.jobId || j.JobId || j.id || '',
    jobTitle: j.jobTitle || j.JobTitle || j.title || '',
    jobDescription: j.jobDescription || j.JobDescription || j.description || '',
    jobRequirements: j.jobRequirements || j.JobRequirements || j.requirements || '',
    location: j.location || j.Location || '',
    salaryMin: j.salaryMin ?? j.SalaryMin ?? 0,
    salaryMax: j.salaryMax ?? j.SalaryMax ?? 0,
    salaryType: j.salaryType || j.SalaryType || 'Range',
    currency: j.currency ?? j.Currency ?? 'VND',
    jobLevel: j.jobLevel || j.JobLevel || '',
    employmentType: j.employmentType || j.EmploymentType || '',
    workMode: j.workMode || j.WorkMode || '',
    deadline: j.deadline || j.Deadline || '',
    status: j.status || j.Status || 'Open',
    companyId: j.companyId || j.CompanyId || '',
    isPriority: j.isPriority || j.IsPriority || false,
    views: j.views || j.Views || 0,
    company: company
      ? {
          id: company.id || company.companyId || company.CompanyId,
          name: company.name || company.companyName || company.CompanyName,
          logo: company.logoURL || company.LogoURL || company.logo || company.Logo,
        }
      : undefined,
    jobSkills:
      jobSkills && Array.isArray(jobSkills)
        ? jobSkills.map((js: any) => js.skill?.skillName || js.Skill?.SkillName || js.SkillName || js.name || js)
        : [],
    createdAt: j.createdAt || j.CreatedAt || new Date().toISOString(),
    updatedAt: j.updatedAt || j.UpdatedAt || new Date().toISOString(),
  };
};

const jobService = {
  /**
   * Get all jobs
   */
  getAll: async () => {
    try {
      const res = await api.get<Job[]>('/job');
      const data = res.data?.data || res.data || [];
      const mapped = Array.isArray(data) ? data.map(mapJob).filter(Boolean) : [];
      return { ...res, data: mapped };
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      throw error;
    }
  },

  /**
   * Get job by ID
   */
  getById: async (jobId: string) => {
    try {
      const res = await api.get<Job>(`/job/${jobId}`);
      const data = res.data?.data || res.data;
      const mapped = mapJob(data);
      return { ...res, data: mapped };
    } catch (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 404) {
        return { data: null };
      }
      throw error;
    }
  },

  /**
   * Get jobs for a company
   */
  getByCompanyId: async (companyId: string) => {
    try {
      // Backend doesn't have /job/company/{id} endpoint,
      // so we fetch all jobs and filter on frontend
      const res = await api.get<Job[]>('/job');
      const data = res.data?.data || res.data || [];
      const allJobs = Array.isArray(data) ? data.map(mapJob).filter(Boolean) : [];
      
      // Filter jobs by company ID
      const companyJobs = allJobs.filter(job => 
        job.companyId === companyId || 
        (job.raw?.companyId === companyId) || 
        (job.raw?.CompanyId === companyId)
      );
      
      return { ...res, data: companyJobs };
    } catch (error) {
      console.error(`Failed to fetch jobs for company ${companyId}:`, error);
      throw error;
    }
  },

  /**
   * Create a new job (Employer only)
   */
  create: async (jobData: JobCreateRequest) => {
    try {
      const res = await api.post<Job>('/job', jobData);
      const data = res.data?.data || res.data;
      const mapped = mapJob(data);
      return { ...res, data: mapped };
    } catch (error) {
      console.error('Failed to create job:', error);
      throw error;
    }
  },

  /**
   * Update job (Employer only)
   */
  update: async (jobId: string, jobData: JobUpdateRequest) => {
    try {
      const res = await api.put<Job>(`/job/${jobId}`, jobData);
      const data = res.data?.data || res.data;
      const mapped = mapJob(data);
      return { ...res, data: mapped };
    } catch (error) {
      console.error(`Failed to update job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Delete job (Employer only)
   */
  delete: async (jobId: string) => {
    try {
      const res = await api.delete(`/job/${jobId}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete job ${jobId}:`, error);
      throw error;
    }
  },

  /**
   * Search jobs
   */
  search: async (query: string, filters?: Record<string, any>) => {
    try {
      const res = await api.get<Job[]>('/job/search', { params: { q: query, ...filters } });
      const data = res.data?.data || res.data || [];
      const mapped = Array.isArray(data) ? data.map(mapJob).filter(Boolean) : [];
      return { ...res, data: mapped };
    } catch (error) {
      console.error('Failed to search jobs:', error);
      throw error;
    }
  },
};

export default jobService;
