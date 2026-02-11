namespace SchneeJob.Interfaces
{
    public interface IApplicationServices
    {
        Task<Application> ApplyForJobAsync(Guid userId, Guid jobId, Guid resumeId, string coverLetter);
        Task<IEnumerable<Application>> GetMyApplicationsAsync(Guid userId);
        Task<IEnumerable<Application>> GetApplicationsForJobAsync(Guid jobId, Guid employerId);
        Task<Application> UpdateApplicationStatusAsync(Guid applicationId, string newStatus, Guid employerId);
    }
}
