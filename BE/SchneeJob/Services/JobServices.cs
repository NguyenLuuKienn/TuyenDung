using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class JobServices : IJobServices
    {
        private readonly SchneeJobDbContext _context;
        private readonly INotificationServices _notificationService;
        public JobServices(SchneeJobDbContext context, INotificationServices notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
        public async Task<IEnumerable<Job>> GetAllJobsAsync()
        {
            return await _context.Jobs.AsNoTracking().ToListAsync();
        }
        public async Task<Job> GetJobByIdAsync(Guid jobId)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null)
            {
                throw new KeyNotFoundException("Job not found");
            }
            return job;
        }
        public async Task<Job> CreateJobAsync(Job job, Guid postByUserId)
        {
            job.PostedByUserId = postByUserId;
            job.CreatedAt = DateTime.UtcNow;
            job.UpdatedAt = DateTime.UtcNow;
            job.Status = "Open";
            var skillId = job.JobSkills?.Select(js => js.SkillId).ToList() ?? new List<Guid>();
            job.JobSkills = new List<JobSkill>();

            if (skillId.Any())
            {
                var skillsFromDb = await _context.Skills
                    .Where(s => skillId.Contains(s.SkillId))
                    .ToListAsync();

                foreach (var skill in skillsFromDb)
                {
                    job.JobSkills.Add(new JobSkill { Skill = skill });
                }
            }
            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            var followers = await _context.CompanyFollows.Where(f => f.CompanyId == job.CompanyId).Select(f => f.UserId).ToListAsync();

            foreach (var followerId in followers)
            {
                var message = $"Company '{job.Company.CompanyName}' has posted a new job: '{job.JobTitle}'.";
                var link = $"/jobs/{job.JobId}";
                await _notificationService.CreateNotificationAsync(followerId, "NewJobFromFollowedCompany", message, link);
            }
            return await GetJobByIdAsync(job.JobId);
        }
        public async Task<Job> UpdateJobAsync(Guid jobId, Job job, Guid currentUserId)
        {
            var existingJob = await _context.Jobs
                .Include(j => j.JobSkills)
                .FirstOrDefaultAsync(j => j.JobId == jobId);
            if (existingJob == null)
            {
                throw new KeyNotFoundException("Job not found");
            }
            if(existingJob.PostedByUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to update this job.");
            }
            existingJob.JobTitle = job.JobTitle;
            existingJob.JobDescription = job.JobDescription;
            existingJob.JobRequirements = job.JobRequirements;
            existingJob.Location = job.Location;
            existingJob.SalaryMin = job.SalaryMin;
            existingJob.SalaryMax = job.SalaryMax;
            existingJob.SalaryType = job.SalaryType;
            existingJob.JobLevel = job.JobLevel;
            existingJob.EmploymentType = job.EmploymentType;
            existingJob.Deadline = job.Deadline;
            existingJob.IsPriority = job.IsPriority;
            existingJob.CreatedAt = job.CreatedAt;
            existingJob.UpdatedAt = DateTime.UtcNow;
            existingJob.Status = job.Status;

            existingJob.JobSkills.Clear();
            var skillId = job.JobSkills?.Select(js => js.SkillId).ToList() ?? new List<Guid>();
            if (skillId.Any())
            {
                var skillsFromDb = await _context.Skills
                    .Where(s => skillId.Contains(s.SkillId))
                    .ToListAsync();

                foreach (var skill in skillsFromDb)
                {
                    existingJob.JobSkills.Add(new JobSkill { Skill = skill });
                }
            }
            await _context.SaveChangesAsync();
            return existingJob;
        }
        public async Task<bool> DeleteJobAsync(Guid jobId, Guid currentUserId)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null)
            {
                return false;
            }

            if (job.PostedByUserId != currentUserId)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this job.");
            }

            _context.Jobs.Remove(job);
            return await _context.SaveChangesAsync() > 0;
        }

    }
}
