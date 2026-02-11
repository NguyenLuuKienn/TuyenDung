using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class ApplicationServices : IApplicationServices
    {
        private readonly SchneeJobDbContext _context;
        private readonly INotificationServices _notificationServices;
        public ApplicationServices(SchneeJobDbContext context, INotificationServices notificationServices)
        {
            _context = context;
            _notificationServices = notificationServices;
        }
        public async Task<Application> ApplyForJobAsync(Guid userId, Guid jobId, Guid resumeId, string coverLetter)
        {
            var existingApplication = await _context.Applications
                .AnyAsync(a => a.UserId == userId && a.JobId == jobId);
            if (existingApplication)
            {
                throw new Exception("You have already applied for this job.");
            }

            var jobExists = await _context.Jobs.AnyAsync(j => j.JobId == jobId);
            var resumeExists = await _context.Resumes.AnyAsync(r => r.ResumeId == resumeId && r.UserId == userId);
            if (!jobExists) throw new KeyNotFoundException("Job not found.");
            if (!resumeExists) throw new KeyNotFoundException("Resume not found or does not belong to you.");

            var application = new Application
            {
                UserId = userId,
                JobId = jobId,
                ResumeId = resumeId,
                CoverLetter = coverLetter,
                AppliedDate = DateTime.UtcNow,
                Status = "Pending"
            };

            _context.Applications.Add(application);
            await _context.SaveChangesAsync();

            return application;
        }

        public async Task<IEnumerable<Application>> GetMyApplicationsAsync(Guid userId)
        {
            return await _context.Applications
                .Where(a => a.UserId == userId)
                .Include(a => a.Job)
                    .ThenInclude(j => j.Company)
                .OrderByDescending(a => a.AppliedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Application>> GetApplicationsForJobAsync(Guid jobId, Guid employerId)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            var employer = await _context.Users.FindAsync(employerId);
            if (job == null || employer == null || job.CompanyId != employer.CompanyId)
            {
                throw new UnauthorizedAccessException("You are not authorized to view applications for this job.");
            }

            return await _context.Applications
                .Where(a => a.JobId == jobId)
                .Include(a => a.User) 
                .Include(a => a.Resume)
                .OrderByDescending(a => a.AppliedDate)
                .ToListAsync();
        }
        public async Task<Application> UpdateApplicationStatusAsync(Guid applicationId, string newStatus, Guid employerId)
        {
            var application = await _context.Applications
                .Include(a => a.Job)
                .Include(a => a.User)
                .FirstOrDefaultAsync(a => a.ApplicationId == applicationId);

            if (application == null)
            {
                throw new KeyNotFoundException("Application not found.");
            }

            var employer = await _context.Users.FindAsync(employerId);
            if (employer == null || application.Job.CompanyId != employer.CompanyId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this application.");
            }

            var validStatuses = new[] { "Viewed", "Shortlisted", "Rejected", "Hired" };
            if (!validStatuses.Contains(newStatus))
            {
                throw new ArgumentException($"Invalid status: '{newStatus}'. Valid statuses are: {string.Join(", ", validStatuses)}");
            }

            application.Status = newStatus;
            

            await _context.SaveChangesAsync();
            var jobTitle = application.Job.JobTitle;
            var message = $"Your application for the position '{jobTitle}' has been updated to '{newStatus}'.";
            var link = $"/my-applications/{application.ApplicationId}";
            await _notificationServices.CreateNotificationAsync(application.UserId, "ApplicationStatusChange", message, link);
            return application;
        }
    }
}
