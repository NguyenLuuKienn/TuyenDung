/**
 * QUICK START - API Services
 * Copy & paste examples for common use cases (Pure TypeScript - No JSX)
 */

// ============================================
// CENTRALIZED IMPORTS
// ============================================
import {
  jobService,
  authService,
  api,
  applicationService,
  savedJobService,
  companyService,
  resumeService,
  skillService,
  industriesService,
  educationLevelService,
  dashboardService,
  messageService,
  fileService,
  profileService,
} from '@/services';

import type {
  JobCreateRequest,
  Application,
  JobSeekerProfile,
} from '@/services';

import type { AxiosError } from 'axios';

// ============================================
// 1. LOAD JOBS
// ============================================

async function example1_LoadJobs() {
  try {
    const response = await jobService.getAll();
    const jobs = response.data || [];
    console.log('Jobs loaded:', jobs);
    return jobs;
  } catch (error) {
    console.error('Failed to load jobs:', error);
    throw error;
  }
}

// ============================================
// 2. HANDLE LOGIN & STORE TOKEN
// ============================================

async function example2_Login(email: string, password: string) {
  try {
    const response = await authService.login(email, password);
    const { token, user } = response.data;

    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Update API client with token
    api.setToken(token);

    console.log('Login successful:', user);
    return user;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

// ============================================
// 3. APPLY FOR JOB
// ============================================

async function example3_ApplyForJob(jobId: string, resumeId: string, coverLetter: string) {
  try {
    const response = await applicationService.applyForJob(jobId, resumeId, coverLetter);
    console.log('Application submitted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Application failed:', error);
    throw error;
  }
}

// ============================================
// 4. SAVE/UNSAVE JOB
// ============================================

async function example4_ToggleSaveJob(jobId: string, isSaved: boolean) {
  try {
    if (isSaved) {
      await savedJobService.unsave(jobId);
      console.log('Job unsaved');
    } else {
      await savedJobService.save(jobId);
      console.log('Job saved');
    }
    return true;
  } catch (error) {
    console.error('Failed to toggle save job:', error);
    throw error;
  }
}

// ============================================
// 5. CREATE JOB (EMPLOYER)
// ============================================

async function example5_CreateJob(jobData: JobCreateRequest) {
  try {
    const response = await jobService.create(jobData);
    console.log('Job created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to create job:', error);
    throw error;
  }
}

// ============================================
// 6. LOAD COMPANY DETAILS
// ============================================

async function example6_LoadCompany(companyId: string) {
  try {
    const response = await companyService.getById(companyId);
    const company = response.data;
    if (!company) {
      console.log('Company not found');
      return null;
    }
    console.log('Company loaded:', company);
    return company;
  } catch (error) {
    console.error('Failed to load company:', error);
    throw error;
  }
}

// ============================================
// 7. GET MY APPLICATIONS (JOB SEEKER)
// ============================================

async function example7_GetMyApplications() {
  try {
    const response = await applicationService.getMyApplications();
    const applications = response.data as Application[];
    console.log('My applications:', applications);
    return applications;
  } catch (error) {
    console.error('Failed to load applications:', error);
    return [];
  }
}

// ============================================
// 8. UPLOAD RESUME
// ============================================

async function example8_UploadResume(file: File, title: string) {
  try {
    // First upload the file
    const uploadRes = await resumeService.uploadFile(file);
    const fileURL = uploadRes.data.fileURL;

    // Then create resume record
    const createRes = await resumeService.create({
      title,
      fileURL,
    });

    console.log('Resume uploaded:', createRes.data);
    return createRes.data;
  } catch (error) {
    console.error('Failed to upload resume:', error);
    throw error;
  }
}

// ============================================
// 9. GET MASTER DATA (SKILLS, INDUSTRIES)
// ============================================

async function example9_LoadMasterData() {
  try {
    const [skillsRes, industriesRes, educationRes] = await Promise.all([
      skillService.getAllSkills(),
      industriesService.getAllIndustries(),
      educationLevelService.getAllEducationLevels(),
    ]);

    const result = {
      skills: skillsRes.data || [],
      industries: industriesRes.data || [],
      educationLevels: educationRes.data || [],
    };

    console.log('Master data loaded:', result);
    return result;
  } catch (error) {
    console.error('Failed to load master data:', error);
    return { skills: [], industries: [], educationLevels: [] };
  }
}

// ============================================
// 10. HANDLE ERRORS GLOBALLY
// ============================================

function example10_HandleApiError(error: any): string {
  const axiosError = error as AxiosError;

  switch (axiosError.response?.status) {
    case 401:
      localStorage.removeItem('token');
      globalThis.location.href = '/login';
      return 'Session expired. Please login again.';

    case 403:
      return 'You do not have permission to perform this action.';

    case 404:
      return 'The requested resource was not found.';

    case 500:
      return 'Server error. Please try again later.';

    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

// ============================================
// 11. FOLLOW/UNFOLLOW COMPANY
// ============================================

async function example11_ToggleFollowCompany(companyId: string, isFollowing: boolean) {
  try {
    if (isFollowing) {
      await companyService.unfollow(companyId);
      console.log('Company unfollowed');
    } else {
      await companyService.follow(companyId);
      console.log('Company followed');
    }
    return true;
  } catch (error) {
    console.error('Failed to toggle company follow:', error);
    throw error;
  }
}

// ============================================
// 12. GET DASHBOARD STATS
// ============================================

async function example12_GetEmployerDashboardStats() {
  try {
    const response = await dashboardService.getEmployerStats();
    console.log('Dashboard stats:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to load dashboard stats:', error);
    return null;
  }
}

// ============================================
// 13. CREATE & SEND MESSAGE
// ============================================

async function example13_SendMessage(conversationId: string, content: string) {
  try {
    const response = await messageService.send(conversationId, content);
    console.log('Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

// ============================================
// 14. UPLOAD PROFILE PICTURE
// ============================================

async function example14_UploadProfilePicture(file: File) {
  try {
    const response = await fileService.uploadProfilePicture(file);
    const fileURL = response.data.fileURL;
    console.log('Profile picture uploaded:', fileURL);
    return fileURL;
  } catch (error) {
    console.error('Failed to upload profile picture:', error);
    throw error;
  }
}

// ============================================
// 15. UPDATE PROFILE
// ============================================

async function example15_UpdateMyProfile(profileData: Partial<JobSeekerProfile>) {
  try {
    const response = await profileService.createOrUpdate(profileData);
    console.log('Profile updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

// ============================================
// EXPORT ALL EXAMPLES FOR EASY ACCESS
// ============================================
export {
  example1_LoadJobs,
  example2_Login,
  example3_ApplyForJob,
  example4_ToggleSaveJob,
  example5_CreateJob,
  example6_LoadCompany,
  example7_GetMyApplications,
  example8_UploadResume,
  example9_LoadMasterData,
  example10_HandleApiError,
  example11_ToggleFollowCompany,
  example12_GetEmployerDashboardStats,
  example13_SendMessage,
  example14_UploadProfilePicture,
  example15_UpdateMyProfile,
};

