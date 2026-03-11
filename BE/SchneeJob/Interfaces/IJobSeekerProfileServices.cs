namespace SchneeJob.Interfaces
{
    public interface IJobSeekerProfileServices
    {
        Task<JobSeekerProfile> GetProfileByUserIdAsync(Guid userId);
        Task<JobSeekerProfile> CreateOrUpdateProfileAsync(JobSeekerProfile profile, Guid userId, string phoneNumber = null);
        
        // Experience methods
        Task<Experience> AddExperienceAsync(Experience experience, Guid userId);
        Task<Experience> UpdateExperienceAsync(Guid id, Experience experience, Guid userId);
        Task<bool> DeleteExperienceAsync(Guid id, Guid userId);
        
        // Education methods
        Task<Education> AddEducationAsync(Education education, Guid userId);
        Task<Education> UpdateEducationAsync(Guid id, Education education, Guid userId);
        Task<bool> DeleteEducationAsync(Guid id, Guid userId);

        // Skill methods
        Task<bool> AddSkillToProfileAsync(Guid skillId, Guid userId);
        Task<bool> RemoveSkillFromProfileAsync(Guid skillId, Guid userId);
    }
}
