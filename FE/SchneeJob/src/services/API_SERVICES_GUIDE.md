# SchneeJob API Services Guide

## Overview

This guide explains how to use the centralized API services layer for the SchneeJob Frontend application. All API calls go through a single API client (`api.ts`) that handles authentication, error handling, and request/response processing.

## Directory Structure

```
src/services/
├── api.ts                      # Central API client (axios instance)
├── authService.ts              # Authentication service
├── jobService.ts               # Job listings & management
├── companyService.ts           # Company information & management
├── applicationService.ts       # Job applications
├── savedJobService.ts          # Saved jobs
├── profileService.ts           # User profile
├── resumeService.ts            # Resume/CV management
├── postService.ts              # Social posts
├── messageService.ts           # Direct messaging
├── notificationService.ts      # Notifications
├── fileService.ts              # File uploads
├── dashboardService.ts         # Dashboard statistics
├── masterDataService.ts        # Skills, industries, education levels
└── index.ts                    # Central exports
```

## Setup

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

Replace `http://localhost:5000` with your actual ASP.NET Core backend URL.

### 2. API Client Configuration

The `api.ts` file provides a centralized axios instance with:

- **Automatic JWT token injection** in request headers
- **Global error handling** (401 redirects to login)
- **Request/response interceptors**
- **Type-safe responses**

## Usage Examples

### Authentication

```typescript
import { authService } from '@/services';

// Register as Job Seeker
const response = await authService.registerJobSeeker({
  email: 'user@example.com',
  fullName: 'John Doe',
  phoneNumber: '0123456789',
  passwordHash: 'hashedPassword'
});

const { token, user } = response.data;

// Login
const loginRes = await authService.login('user@example.com', 'password');
authService.login(loginRes.data.token); // Store token

// Logout
authService.logout(); // Clears token and localStorage
```

### Jobs

```typescript
import { jobService } from '@/services';

// Get all jobs
const jobs = await jobService.getAll();
console.log(jobs.data); // Array of Job objects

// Get single job
const job = await jobService.getById('job-id');

// Create job (Employer only)
const newJob = await jobService.create({
  jobTitle: 'Senior Developer',
  jobDescription: 'We are looking for...',
  jobRequirements: 'Requirements...',
  location: 'Ho Chi Minh City',
  salaryMin: 2000,
  salaryMax: 4000,
  currency: 'USD',
  jobLevel: 'Senior',
  employmentType: 'Full-time',
  workMode: 'Remote',
  deadline: '2024-12-31'
});

// Update job
const updated = await jobService.update('job-id', jobData);

// Delete job
await jobService.delete('job-id');
```

### Companies

```typescript
import { companyService } from '@/services';

// Get all companies
const companies = await companyService.getAll();

// Get company details
const company = await companyService.getById('company-id');

// Get my company (Employer only)
const myCompany = await companyService.getMyCompany();

// Update my company
const updated = await companyService.updateMyCompany({
  companyName: 'New Name',
  city: 'Ha Noi',
  companySize: '100-500',
  industryId: 'industry-id'
});

// Follow/Unfollow company
await companyService.follow('company-id');
await companyService.unfollow('company-id');
```

### Applications

```typescript
import { applicationService } from '@/services';

// Apply for job
const application = await applicationService.applyForJob(
  'job-id',
  'resume-id',
  'Here is my cover letter...'
);

// Get my applications
const myApps = await applicationService.getMyApplications();

// Get applications for job (Employer)
const appForJob = await applicationService.getForJob('job-id');

// Update application status
await applicationService.updateStatus('app-id', 'Shortlisted');
```

### Saved Jobs

```typescript
import { savedJobService } from '@/services';

// Get saved jobs
const saved = await savedJobService.getMySavedJobs();

// Save job
await savedJobService.save('job-id');

// Unsave job
await savedJobService.unsave('job-id');
```

### Master Data

```typescript
import { skillService, industriesService, educationLevelService } from '@/services';

// Get all skills
const skills = await skillService.getAllSkills();

// Get all industries
const industries = await industriesService.getAllIndustries();

// Get all education levels
const levels = await educationLevelService.getAllEducationLevels();
```

### Profile

```typescript
import { profileService } from '@/services';

// Get my profile
const profile = await profileService.getMyProfile();

// Update profile
const updated = await profileService.createOrUpdate({
  phoneNumber: '0123456789',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  bio: 'I am a developer...',
  yearsOfExperience: 5,
  expectedSalaryMin: 2000,
  expectedSalaryMax: 4000
});

// Upload profile picture
const fileRes = await profileService.uploadProfilePicture(file);
```

### Resumes

```typescript
import { resumeService } from '@/services';

// Get my resumes
const resumes = await resumeService.getMyResumes();

// Create resume
const resume = await resumeService.create({
  title: 'CV - John Doe',
  fileURL: 'https://...'
});

// Upload resume file
const uploaded = await resumeService.uploadFile(file);

// Set default resume
await resumeService.setDefault('resume-id');
```

### Posts

```typescript
import { postService } from '@/services';

// Get all posts
const posts = await postService.getAll();

// Get posts by company
const companyPosts = await postService.getByCompany('company-id');

// Create post
const post = await postService.create({
  content: 'Great news! We are hiring...',
  imageURL: 'https://...'
});

// Like/Unlike post
await postService.like('post-id');
await postService.unlike('post-id');

// Add comment
await postService.addComment('post-id', 'Great opportunity!');
```

### Messages

```typescript
import { messageService } from '@/services';

// Get conversations
const conversations = await messageService.getConversations();

// Get messages for conversation
const messages = await messageService.getMessages('conversation-id');

// Send message
await messageService.send('conversation-id', 'Hello!');

// Start new conversation
const conversation = await messageService.startConversation('user-id');

// Mark conversation as read
await messageService.markConversationAsRead('conversation-id');
```

### Notifications

```typescript
import { notificationService } from '@/services';

// Get my notifications
const notifications = await notificationService.getMyNotifications();

// Get unread count
const count = await notificationService.getUnreadCount();

// Mark as read
await notificationService.markAsRead('notification-id');

// Mark all as read
await notificationService.markAllAsRead();
```

### Files

```typescript
import { fileService } from '@/services';

// Upload file
const uploaded = await fileService.upload(file);

// Upload profile picture
const profile = await fileService.uploadProfilePicture(file);

// Upload resume
const resume = await fileService.uploadResume(file);

// Upload company logo
const logo = await fileService.uploadCompanyLogo(file);
```

### Dashboard

```typescript
import { dashboardService } from '@/services';

// Get admin stats
const stats = await dashboardService.getAdminStats();

// Get employer stats
const empStats = await dashboardService.getEmployerStats();

// Get job seeker stats
const jsStats = await dashboardService.getJobSeekerStats();
```

## Error Handling

All services include built-in error handling. Here's the recommended pattern:

```typescript
try {
  const response = await jobService.getAll();
  console.log(response.data);
} catch (error) {
  const axiosError = error as AxiosError;
  if (axiosError.response?.status === 401) {
    // Redirect to login
    window.location.href = '/login';
  } else if (axiosError.response?.status === 403) {
    // Access forbidden
    toast.error('You do not have permission to access this resource');
  } else {
    // Other errors
    toast.error('An error occurred. Please try again.');
  }
}
```

## Token Management

The API client automatically handles JWT tokens:

```typescript
// Set token (after login)
api.setToken(token);

// Clear token (on logout)
api.setToken(null);

// Token is automatically added to all requests in Authorization header
// Authorization: Bearer <token>
```

## Tips and Best Practices

1. **Import from index.ts**: Use the central export file instead of importing individual services

   ```typescript
   // ✅ Good
   import { jobService, companyService } from '@/services';

   // ❌ Avoid
   import jobService from '@/services/jobService';
   import companyService from '@/services/companyService';
   ```

2. **Use async/await**: All service methods return Promises for async operations

   ```typescript
   const handleLoad = async () => {
     try {
       const data = await jobService.getAll();
       setJobs(data.data);
     } catch (error) {
       setError('Failed to load jobs');
     }
   };
   ```

3. **Handle response structure**: Responses follow a pattern with `data` property

   ```typescript
   const response = await jobService.getById('id');
   const job = response.data; // The actual data is under .data
   ```

4. **Type safety**: Use TypeScript types exported from services

   ```typescript
   import { Job, Company, Application } from '@/services';

   const myJobs: Job[] = [];
   const company: Company | null = null;
   ```

5. **Error responses**: Backend errors are thrown as exceptions with response data

   ```typescript
   try {
     await jobService.create(badData);
   } catch (error) {
     const response = (error as AxiosError).response;
     console.log(response?.data?.errors); // Backend validation errors
   }
   ```

## Migration from Mock Data

Replace mock data calls with API services:

```typescript
// ❌ Before (using mock data)
import { MOCK_JOBS } from '@/data/mock';
const jobs = MOCK_JOBS;

// ✅ After (using API)
import { jobService } from '@/services';
const response = await jobService.getAll();
const jobs = response.data;
```

## Troubleshooting

### 401 Unauthorized

- Check if token exists in localStorage
- Verify token is being sent in Authorization header
- Token may have expired - implement refresh token logic

### 404 Not Found

- Verify the resource ID exists in the backend
- Check the API endpoint URL matches backend routes

### CORS Issues

- Configure CORS in ASP.NET Core backend
- Add localhost origin to allowed origins during development

### Connection Refused

- Verify backend server is running
- Check VITE_API_URL matches backend URL
- Check firewall settings

## Support

For more information, check the individual service files in `src/services/`

