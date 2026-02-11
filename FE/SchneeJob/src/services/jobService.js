import api from './api';

// Helper to map backend Job to frontend shape
const mapJob = (j) => {
  if (!j) return null;
  const company = j.company || j.Company || null;
  const jobSkills = j.jobSkills || j.JobSkills || j.JobSkills || [];

  return {
    id: j.id || j.jobId || j.JobId || j.JobId,
    title: j.title || j.jobTitle || j.JobTitle || j.JobTitle,
    description: j.description || j.jobDescription || j.JobDescription,
    requirements: j.requirements || j.jobRequirements || j.JobRequirements,
    salaryMin: j.salaryMin ?? j.SalaryMin ?? j.SalaryMin,
    salaryMax: j.salaryMax ?? j.SalaryMax ?? j.SalaryMax,
    salaryType: j.salaryType || j.SalaryType || j.SalaryType,
    salary: (() => {
      const min = j.salaryMin ?? j.SalaryMin;
      const max = j.salaryMax ?? j.SalaryMax;
      if (min != null && max != null) return `${min} - ${max}`;
      if (min != null) return `${min}`;
      if (max != null) return `${max}`;
      return 'Thương lượng';
    })(),
    location: j.location || j.Location || j.Location,
    level: j.level || j.jobLevel || j.JobLevel,
    type: j.type || j.employmentType || j.EmploymentType || j.EmploymentType,
    status: j.status || j.Status || j.Status,
    deadline: j.deadline || j.Deadline,
    postedAt: j.postedAt || j.createdAt || j.CreatedAt,
    updatedAt: j.updatedAt || j.UpdatedAt,
    isTop: j.isTop || j.isPriority || j.IsPriority || false,
    isHidden: j.isHidden || j.IsHidden || false,
    views: j.views || j.Views || 0,
    applicants: j.applicants || j.Applicants || 0,
    companyId: j.companyId || j.CompanyId || j.CompanyId,
    company: company
      ? {
          id: company.id || company.companyId || company.CompanyId,
          name: company.name || company.companyName || company.CompanyName,
          logo: company.logoURL || company.LogoURL || company.logo || company.LogoURL,
          cover: company.coverImageURL || company.CoverImageURL || company.cover,
        }
      : null,
    skills:
      jobSkills && Array.isArray(jobSkills)
        ? jobSkills.map((js) => js.skill?.skillName || js.Skill?.SkillName || js.SkillName || js.name || js)
        : [],
    raw: j,
  };
};

/**
 * Job Service
 * Handles job-related operations
 */
const jobService = {
  /**
   * Get all jobs
   */
  getAll: async () => {
    const res = await api.get('/api/job');
    const data = res.data || [];
    const mapped = Array.isArray(data) ? data.map(mapJob) : data;
    res.data = mapped;
    return res;
  },

  /**
   * Get job by ID
   */
  getById: async (jobId) => {
    const res = await api.get(`/api/job/${jobId}`);
    res.data = mapJob(res.data);
    return res;
  },

  /**
   * Create a new job (Employer only)
   */
  create: (jobData) => api.post('/api/job', jobData),

  /**
   * Update job (Employer only)
   */
  update: (jobId, jobData) => api.put(`/api/job/${jobId}`, jobData),

  /**
   * Delete job (Employer only)
   */
  delete: (jobId) => api.delete(`/api/job/${jobId}`),
};

export default jobService;
