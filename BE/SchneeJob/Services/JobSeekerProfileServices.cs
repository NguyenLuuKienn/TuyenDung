using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class JobSeekerProfileServices : IJobSeekerProfileServices
    {
        private readonly SchneeJobDbContext _context;
        public JobSeekerProfileServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<JobSeekerProfile> GetProfileByUserIdAsync(Guid userId)
        {
            return await _context.JobSeekerProfiles.Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.JobSeekerSkills).ThenInclude(jss => jss.Skill).FirstOrDefaultAsync(p => p.UserId == userId);
        }
        public async Task<JobSeekerProfile> CreateOrUpdateProfileAsync(JobSeekerProfile profileFromClient, Guid userId)
        {
            var existingProfile = await _context.JobSeekerProfiles
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.JobSeekerSkills)
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (existingProfile == null)
            {
                profileFromClient.UserId = userId;
                _context.JobSeekerProfiles.Add(profileFromClient);
            }
            else
            {
         
                existingProfile.Headline = profileFromClient.Headline;
                existingProfile.Summary = profileFromClient.Summary;
                existingProfile.DateOfBirth = profileFromClient.DateOfBirth;
                existingProfile.Gender = profileFromClient.Gender;
                existingProfile.Address = profileFromClient.Address;
                existingProfile.IsPublic = profileFromClient.IsPublic;
                existingProfile.UpdatedAt = DateTime.UtcNow;

            
                existingProfile.Educations.Clear();
                existingProfile.Experiences.Clear();
                existingProfile.JobSeekerSkills.Clear();

                if (profileFromClient.Educations != null)
                    foreach (var edu in profileFromClient.Educations) existingProfile.Educations.Add(edu);

                if (profileFromClient.Experiences != null)
                    foreach (var exp in profileFromClient.Experiences) existingProfile.Experiences.Add(exp);

                if (profileFromClient.JobSeekerSkills != null)
                    foreach (var skill in profileFromClient.JobSeekerSkills) existingProfile.JobSeekerSkills.Add(skill);
            }

            await _context.SaveChangesAsync();
            return await GetProfileByUserIdAsync(userId);
        }
    }
}
