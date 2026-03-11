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
            return await _context.JobSeekerProfiles.Include(p => p.User)
                .Include(p => p.Educations)
                .Include(p => p.Experiences)
                .Include(p => p.JobSeekerSkills).ThenInclude(jss => jss.Skill).FirstOrDefaultAsync(p => p.UserId == userId);
        }
        public async Task<JobSeekerProfile> CreateOrUpdateProfileAsync(JobSeekerProfile profileFromClient, Guid userId, string phoneNumber = null)
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
                // Update only scalar fields - don't touch collections unless explicitly provided
                existingProfile.Headline = profileFromClient.Headline;
                existingProfile.Summary = profileFromClient.Summary;
                existingProfile.DateOfBirth = profileFromClient.DateOfBirth;
                existingProfile.Gender = profileFromClient.Gender;
                existingProfile.Address = profileFromClient.Address;
                existingProfile.IsPublic = profileFromClient.IsPublic;
                existingProfile.UpdatedAt = DateTime.UtcNow;

                // Only update collections if they were explicitly provided in the request (not null)
                if (profileFromClient.Educations != null)
                {
                    existingProfile.Educations.Clear();
                    foreach (var edu in profileFromClient.Educations) existingProfile.Educations.Add(edu);
                }

                if (profileFromClient.Experiences != null)
                {
                    existingProfile.Experiences.Clear();
                    foreach (var exp in profileFromClient.Experiences) existingProfile.Experiences.Add(exp);
                }

                if (profileFromClient.JobSeekerSkills != null)
                {
                    existingProfile.JobSeekerSkills.Clear();
                    foreach (var skill in profileFromClient.JobSeekerSkills) existingProfile.JobSeekerSkills.Add(skill);
                }
            }

            // Update phone number if provided
            if (!string.IsNullOrWhiteSpace(phoneNumber))
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
                if (user != null)
                {
                    user.PhoneNumber = phoneNumber;
                }
            }

            await _context.SaveChangesAsync();
            return await GetProfileByUserIdAsync(userId);
        }

        // Experience methods
        public async Task<Experience> AddExperienceAsync(Experience experience, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                throw new InvalidOperationException("Profile not found");
            }

            experience.ExperienceId = Guid.NewGuid();
            experience.ProfileId = profile.ProfileId;
            
            _context.Experiences.Add(experience);
            await _context.SaveChangesAsync();

            return experience;
        }

        public async Task<Experience> UpdateExperienceAsync(Guid id, Experience experience, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                throw new InvalidOperationException("Profile not found");
            }

            var existingExp = await _context.Experiences
                .FirstOrDefaultAsync(e => e.ExperienceId == id && e.ProfileId == profile.ProfileId);
            
            if (existingExp == null)
            {
                throw new InvalidOperationException("Experience not found");
            }

            existingExp.JobTitle = experience.JobTitle;
            existingExp.CompanyName = experience.CompanyName;
            existingExp.Location = experience.Location;
            existingExp.StartDate = experience.StartDate;
            existingExp.EndDate = experience.EndDate;
            existingExp.Description = experience.Description;

            _context.Experiences.Update(existingExp);
            await _context.SaveChangesAsync();
            return existingExp;
        }

        public async Task<bool> DeleteExperienceAsync(Guid id, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return false;
            }

            var experience = await _context.Experiences
                .FirstOrDefaultAsync(e => e.ExperienceId == id && e.ProfileId == profile.ProfileId);
            
            if (experience == null)
            {
                return false;
            }

            _context.Experiences.Remove(experience);
            await _context.SaveChangesAsync();
            return true;
        }

        // Education methods
        public async Task<Education> AddEducationAsync(Education education, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                throw new InvalidOperationException("Profile not found");
            }

            education.EducationId = Guid.NewGuid();
            education.ProfileId = profile.ProfileId;
            
            _context.Educations.Add(education);
            await _context.SaveChangesAsync();

            return education;
        }

        public async Task<Education> UpdateEducationAsync(Guid id, Education education, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                throw new InvalidOperationException("Profile not found");
            }

            var existingEdu = await _context.Educations
                .FirstOrDefaultAsync(e => e.EducationId == id && e.ProfileId == profile.ProfileId);
            
            if (existingEdu == null)
            {
                throw new InvalidOperationException("Education not found");
            }

            existingEdu.Degree = education.Degree;
            existingEdu.SchoolName = education.SchoolName;
            existingEdu.FieldOfStudy = education.FieldOfStudy;
            existingEdu.StartDate = education.StartDate;
            existingEdu.EndDate = education.EndDate;
            existingEdu.Description = education.Description;

            _context.Educations.Update(existingEdu);
            await _context.SaveChangesAsync();
            return existingEdu;
        }

        public async Task<bool> DeleteEducationAsync(Guid id, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return false;
            }

            var education = await _context.Educations
                .FirstOrDefaultAsync(e => e.EducationId == id && e.ProfileId == profile.ProfileId);
            
            if (education == null)
            {
                return false;
            }

            _context.Educations.Remove(education);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> AddSkillToProfileAsync(Guid skillId, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return false;
            }

            // Check if skill already exists in user's profile
            var existingSkill = await _context.JobSeekerSkills
                .FirstOrDefaultAsync(jss => jss.ProfileId == profile.ProfileId && jss.SkillId == skillId);

            if (existingSkill != null)
            {
                return false; // Already added
            }

            var jobSeekerSkill = new JobSeekerSkill
            {
                ProfileId = profile.ProfileId,
                SkillId = skillId
            };

            _context.JobSeekerSkills.Add(jobSeekerSkill);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveSkillFromProfileAsync(Guid skillId, Guid userId)
        {
            var profile = await _context.JobSeekerProfiles
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (profile == null)
            {
                return false;
            }

            var jobSeekerSkill = await _context.JobSeekerSkills
                .FirstOrDefaultAsync(jss => jss.ProfileId == profile.ProfileId && jss.SkillId == skillId);

            if (jobSeekerSkill == null)
            {
                return false;
            }

            _context.JobSeekerSkills.Remove(jobSeekerSkill);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
