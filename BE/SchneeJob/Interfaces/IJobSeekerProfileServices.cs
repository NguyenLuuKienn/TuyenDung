namespace SchneeJob.Interfaces
{
    public interface IJobSeekerProfileServices
    {
        Task<JobSeekerProfile> GetProfileByUserIdAsync(Guid userId);
        Task<JobSeekerProfile> CreateOrUpdateProfileAsync(JobSeekerProfile profile, Guid userId);
    }
}
