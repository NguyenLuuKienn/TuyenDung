namespace SchneeJob.Interfaces
{
    public interface IJobServices
    {
        Task<IEnumerable<Job>> GetAllJobsAsync();
        Task<Job> GetJobByIdAsync(Guid jobId);
        Task<IEnumerable<Job>> GetEmployerJobsAsync(Guid employerId);
        Task<Job> CreateJobAsync(Job job, Guid postByUserId);
        Task<Job> UpdateJobAsync(Guid jobId, Job job, Guid currentUserId);
        Task<bool> DeleteJobAsync(Guid jobId, Guid currentUserId);

    }
}
