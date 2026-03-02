/**
 * Services Index
 * Central export file for all API services
 */

// API Client
export { default as api } from './api';

// Auth
export { default as authService } from './authService';
export type { LoginRequest, RegisterJobSeekerRequest, RegisterEmployerRequest, AuthResponse } from './authService';

// Jobs
export { default as jobService } from './jobService';
export type { Job, JobCreateRequest, JobUpdateRequest } from './jobService';

// Companies
export { default as companyService } from './companyService';
export type { Company, CompanyFollow, CompanyUpdateRequest } from './companyService';

// Applications
export { default as applicationService } from './applicationService';
export type { Application, ApplicationCreateRequest } from './applicationService';

// Saved Jobs
export { default as savedJobService } from './savedJobService';
export type { SavedJob } from './savedJobService';

// Master Data (Skills, Industries, Education Levels)
export { skillService, industriesService, educationLevelService } from './masterDataService';
export type { Skill, Industry, EducationLevel } from './masterDataService';

// Profile
export { default as profileService } from './profileService';
export type { JobSeekerProfile } from './profileService';

// Posts
export { default as postService } from './postService';
export type { Post, PostCreateRequest, PostUpdateRequest, PostComment } from './postService';

// Dashboard
export { default as dashboardService } from './dashboardService';
export type { AdminDashboardStats, EmployerDashboardStats, JobSeekerDashboardStats } from './dashboardService';

// Resumes
export { default as resumeService } from './resumeService';
export type { Resume, ResumeCreateRequest } from './resumeService';

// Notifications
export { default as notificationService } from './notificationService';
export type { Notification, NotificationCreateRequest } from './notificationService';

// Messages
export { default as messageService } from './messageService';
export type { Message, Conversation, MessageCreateRequest } from './messageService';

// Files
export { default as fileService } from './fileService';
export type { FileUploadResponse } from './fileService';
