import { createContext, useContext, useState, useEffect } from 'react';
import jobService from '../services/jobService';
import savedJobService from '../services/savedJobService';
import applicationService from '../services/applicationService';
import companyService from '../services/companyService';
import { educationLevelService } from '../services/masterDataService';
import { useAuth } from './AuthContext';

const JobContext = createContext(null);

export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

// Alias for backwards compatibility
export const useJob = useJobs;

export const JobProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [allJobs, setAllJobs] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]);
  const [educationLevels, setEducationLevels] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [compareJobs, setCompareJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load jobs, companies and education levels on mount and normalize data
  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);
        const [jobsRes, companiesRes, levelsRes] = await Promise.all([
          jobService.getAll(),
          companyService.getAll(),
          educationLevelService.getAllEducationLevels().catch(() => ({ data: [] }))
        ]);

        const companies = companiesRes?.data || [];
        const levels = levelsRes?.data || [];

        setAllCompanies(companies);
        setEducationLevels(levels);

        // Post-process jobs to ensure fields expected by UI are present
        const jobs = (jobsRes?.data || []).map((j) => {
          const job = { ...j };

          // Ensure company object exists by finding in companies list
          if (!job.company && job.companyId) {
            const found = companies.find(c => c.id === job.companyId || c.companyId === job.companyId || c.CompanyId === job.companyId);
            job.company = found || null;
          }

          // Normalize salary to the expected object {min,max,negotiable}
          const min = job.salaryMin != null ? Number(job.salaryMin) : null;
          const max = job.salaryMax != null ? Number(job.salaryMax) : null;
          const negotiable = (min == null && max == null) || (job.salaryType && job.salaryType.toLowerCase() === 'negotiable');
          job.salary = { min, max, negotiable };

          // Resolve education level id to label if possible
          const levelId = job.level || job.jobLevel;
          if (levelId && levels && levels.length > 0) {
            const lvl = levels.find(l => l.educationLevelId === levelId || l.educationLevelId === (levelId) || l.id === levelId || l.EducationLevelId === levelId || l.LevelName === levelId || l.levelName === levelId);
            if (lvl) {
              job.level = lvl.levelName || lvl.LevelName || lvl.LevelName || lvl.name || lvl.label || job.level;
            }
          }

          // Ensure skills is an array
          job.skills = Array.isArray(job.skills) ? job.skills : (job.skills || []);

          return job;
        });

        setAllJobs(jobs);
      } catch (err) {
        setError(err.message || 'Failed to load jobs data');
        console.error('Failed to load jobs/companies/levels:', err);
        setAllCompanies([]);
        setEducationLevels([]);
        setAllJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  // Load saved jobs if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadSavedJobs = async () => {
      try {
        const response = await savedJobService.getMySavedJobs();
        setSavedJobs(response.data || []);
      } catch (err) {
        console.warn('Failed to load saved jobs (may not be available for this user):', err.message);
        setSavedJobs([]);
      }
    };

    loadSavedJobs();
  }, [isAuthenticated, user]);

  // Load user applications if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadApplications = async () => {
      try {
        const response = await applicationService.getMyApplications();
        setUserApplications(response.data || []);
      } catch (err) {
        console.warn('Failed to load applications (may not be available for this user):', err.message);
        setUserApplications([]);
      }
    };

    loadApplications();
  }, [isAuthenticated, user]);

  // Get job with company info
  const getJobWithCompany = (jobId) => {
    const job = allJobs.find((j) => j.id === jobId);
    return job || null;
  };

  // Get all jobs with filters
  const getJobsWithCompany = (filters = {}) => {
    let filteredJobs = [...allJobs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (j) =>
          j.title?.toLowerCase().includes(searchLower) ||
          j.skills?.some((s) => s.toLowerCase().includes(searchLower))
      );
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter((j) => j.location === filters.location);
    }

    if (filters.level) {
      filteredJobs = filteredJobs.filter((j) => j.level === filters.level);
    }

    if (filters.type) {
      filteredJobs = filteredJobs.filter((j) => j.type === filters.type);
    }

    if (filters.workMode) {
      filteredJobs = filteredJobs.filter((j) => j.workMode === filters.workMode);
    }

    if (filters.salaryMin) {
      filteredJobs = filteredJobs.filter(
        (j) => j.salaryMax >= parseInt(filters.salaryMin)
      );
    }

    if (filters.salaryMax) {
      filteredJobs = filteredJobs.filter(
        (j) => j.salaryMin <= parseInt(filters.salaryMax)
      );
    }

    if (filters.skills && filters.skills.length > 0) {
      filteredJobs = filteredJobs.filter((j) =>
        filters.skills.some((skill) =>
          j.skills?.map((s) => s.toLowerCase()).includes(skill.toLowerCase())
        )
      );
    }

    if (filters.companyId) {
      filteredJobs = filteredJobs.filter((j) => j.companyId === filters.companyId);
    }

    // Sort
    if (filters.sortBy === 'newest') {
      filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'salary-high') {
      filteredJobs.sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
    } else if (filters.sortBy === 'salary-low') {
      filteredJobs.sort((a, b) => (a.salaryMin || 0) - (b.salaryMin || 0));
    } else {
      // Default: newest first
      filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filteredJobs;
  };

  // Get recommended jobs (simple: just return recent jobs)
  const getRecommendedJobs = (limit = 6) => {
    return allJobs.slice(0, limit);
  };

  // Apply for job
  // Accepts (jobId, resumeId, coverLetter)
  const applyForJob = async (jobId, resumeId, coverLetter = '') => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để ứng tuyển');
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await applicationService.applyForJob(jobId, resumeId, coverLetter);
      // API returns application on success
      if (response && (response.status === 200 || response.status === 201)) {
        // Reload user applications
        const appResponse = await applicationService.getMyApplications();
        setUserApplications(appResponse.data || []);
        return { success: true };
      }
      return { success: false, error: 'Failed to apply' };
    } catch (err) {
      setError(err.message);
      console.error('Failed to apply for job:', err, err?.response?.data);
      // If server returned validation errors, include them
      const serverError = err?.response?.data?.errors || err?.response?.data || err.message;
      return { success: false, error: serverError };
    }
  };

  // Update application status (for employers)
  const updateApplicationStatus = async (applicationId, newStatus, note = '') => {
    try {
      const response = await applicationService.updateStatus(applicationId, newStatus, note);
      if (response && (response.status === 200 || response.status === 201 || response.status === 204)) {
        // Reload user applications (jobseeker) and leave employer views to refresh their lists
        const appResponse = await applicationService.getMyApplications();
        setUserApplications(appResponse.data || []);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Get user's applications
  const getUserApplications = () => {
    return (userApplications || []).map((app) => {
      const statusRaw = app.status || app.Status || 'Pending';
      const status = (typeof statusRaw === 'string') ? statusRaw.toLowerCase() : statusRaw;
      const appliedAt = app.appliedAt || app.appliedDate || app.AppliedDate;
      const updatedAt = app.updatedAt || app.updatedAt || app.UpdatedAt || null;

      // Resolve job from state or from app
      // If app.job exists (from backend Include), it is raw (JobTitle, SalaryMin).
      // If fallback to getJobWithCompany, it is normalized (title, salary).
      let rawJob = app.job || getJobWithCompany(app.jobId || app.JobId);

      let job = null;
      let company = null;

      if (rawJob) {
        // Check if it is already normalized (has .title) or raw (has .JobTitle)
        const title = rawJob.title || rawJob.JobTitle || rawJob.jobTitle;
        const salaryMin = rawJob.salary?.min ?? rawJob.SalaryMin ?? rawJob.salaryMin;
        const salaryMax = rawJob.salary?.max ?? rawJob.SalaryMax ?? rawJob.salaryMax;
        const salaryType = rawJob.salaryType || rawJob.SalaryType; // Note: salary.negotiable might be boolean in normalized

        // Construct normalized salary object
        const isNegotiable = (rawJob.salary && rawJob.salary.negotiable) ||
          (salaryType && salaryType.toLowerCase() === 'negotiable') ||
          (salaryMin == null && salaryMax == null);

        job = {
          ...rawJob,
          id: rawJob.id || rawJob.JobId || rawJob.jobId,
          title: title,
          location: rawJob.location || rawJob.Location,
          salary: {
            min: typeof salaryMin === 'number' ? salaryMin : Number(salaryMin),
            max: typeof salaryMax === 'number' ? salaryMax : Number(salaryMax),
            currency: rawJob.salary?.currency || 'VND', // Default
            negotiable: isNegotiable
          },
          company: rawJob.company || rawJob.Company || null
        };
        company = job.company;
      }

      return {
        id: app.applicationId || app.ApplicationId || app.id,
        jobId: app.jobId || app.JobId,
        userId: app.userId || app.UserId,
        resumeId: app.resumeId || app.ResumeId,
        coverLetter: app.coverLetter || app.CoverLetter || '',
        appliedAt,
        updatedAt,
        status,
        matchScore: app.matchScore || app.MatchScore || null,
        job,
        company,
        applicant: app.user || app.User || null,
      };
    });
  };

  // Get applications for a job (for employers)
  const getJobApplications = async (jobId) => {
    try {
      const response = await applicationService.getForJob(jobId);
      return response.data || [];
    } catch (err) {
      console.error('Failed to load job applications:', err);
      return [];
    }
  };

  // Save/unsave job
  const toggleSaveJob = async (jobId) => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để lưu công việc');
      return false;
    }

    try {
      const isCurrentlySaved = savedJobs.some((j) => j.id === jobId || j === jobId || j.jobId === jobId);

      if (isCurrentlySaved) {
        await savedJobService.unsave(jobId);
        setSavedJobs(savedJobs.filter((j) => j.id !== jobId && j !== jobId));
      } else {
        await savedJobService.save(jobId);
        // Reload saved jobs to get complete data
        const response = await savedJobService.getMySavedJobs();
        setSavedJobs(response.data || []);
      }
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Failed to toggle save job:', err);
      return false;
    }
  };

  // Get saved jobs
  const getSavedJobs = () => {
    return savedJobs
      .map((saved) => {
        // Try to identify the job ID
        const savedJobId = saved.jobId || saved.JobId || (typeof saved === 'string' ? saved : null);

        // 1. Try to get fully populated job from saved object (if backend Included it)
        let rawJob = saved.job || saved.Job;

        // 2. If not in saved object, try finding in allJobs
        if (!rawJob && savedJobId) {
          rawJob = allJobs.find(j => j.id === savedJobId);
        }

        if (!rawJob) return null;

        // Normalize if necessary (if came from saved.job, it might be raw)
        // Check if normalized (has .title) or raw (.JobTitle)
        const title = rawJob.title || rawJob.JobTitle || rawJob.jobTitle;
        const salaryMin = rawJob.salary?.min ?? rawJob.SalaryMin ?? rawJob.salaryMin;
        const salaryMax = rawJob.salary?.max ?? rawJob.SalaryMax ?? rawJob.salaryMax;
        const salaryType = rawJob.salaryType || rawJob.SalaryType;

        const isNegotiable = (rawJob.salary && rawJob.salary.negotiable) ||
          (salaryType && salaryType.toLowerCase() === 'negotiable') ||
          (salaryMin == null && salaryMax == null);

        return {
          ...rawJob,
          id: rawJob.id || rawJob.JobId || rawJob.jobId,
          title: title,
          location: rawJob.location || rawJob.Location,
          salary: {
            min: typeof salaryMin === 'number' ? salaryMin : Number(salaryMin),
            max: typeof salaryMax === 'number' ? salaryMax : Number(salaryMax),
            currency: rawJob.salary?.currency || 'VND',
            negotiable: isNegotiable
          },
          company: rawJob.company || rawJob.Company || null
        };
      })
      .filter(Boolean);
  };

  // Compare jobs
  const toggleCompareJob = (jobId) => {
    if (compareJobs.includes(jobId)) {
      setCompareJobs(compareJobs.filter((id) => id !== jobId));
    } else if (compareJobs.length < 3) {
      setCompareJobs([...compareJobs, jobId]);
    }
  };

  // Create new job (for employers)
  const createJob = async (jobData) => {
    try {
      const response = await jobService.create(jobData);
      if (response.success || response.data) {
        // Reload jobs
        const jobsResponse = await jobService.getAll();
        setAllJobs(jobsResponse.data || []);
        return true;
      }
      return false;
    } catch (err) {
      // Log detailed server validation errors when present
      console.error('Create job error response:', err?.response?.data || err);
      if (err?.response?.data?.errors) {
        console.error('Validation errors:', err.response.data.errors);
      }
      setError(err.message || 'Failed to create job');
      return false;
    }
  };

  // Update job
  const updateJob = async (jobId, jobData) => {
    try {
      const response = await jobService.update(jobId, jobData);
      if (response.success || response.data) {
        // Reload jobs
        const jobsResponse = await jobService.getAll();
        setAllJobs(jobsResponse.data || []);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Delete job
  const deleteJob = async (jobId) => {
    try {
      const response = await jobService.delete(jobId);
      if (response.success) {
        // Reload jobs
        const jobsResponse = await jobService.getAll();
        setAllJobs(jobsResponse.data || []);
        return true;
      }
      return false;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Get employer's jobs
  const getEmployerJobs = (companyId) => {
    return allJobs.filter((j) => j.companyId === companyId);
  };

  const value = {
    allJobs,
    allCompanies,
    userApplications,
    savedJobs,
    compareJobs,
    isLoading,
    error,
    getJobWithCompany,
    getJobsWithCompany,
    getRecommendedJobs,
    applyForJob,
    updateApplicationStatus,
    getUserApplications,
    getJobApplications,
    toggleSaveJob,
    getSavedJobs,
    toggleCompareJob,
    createJob,
    updateJob,
    deleteJob,
    getEmployerJobs,
    setCompareJobs
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};
