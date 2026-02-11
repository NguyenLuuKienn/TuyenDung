namespace SchneeJob.Interfaces
{
    public interface ISavedJobServices
    {
        Task<SavedJob> SaveJobAsync(Guid userId, Guid jobId);
        Task<bool> UnsaveJobAsync(Guid userId, Guid jobId);
        Task<IEnumerable<SavedJob>> GetMySavedJobsAsync(Guid userId);
    }
}
