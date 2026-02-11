namespace SchneeJob.Interfaces
{
    public interface IResumeServices
    {
        Task<IEnumerable<Resume>> GetResumesByUserIdAsync(Guid userId);

        Task<Resume> AddResumeAsync(Resume resume, Guid userId);

        Task<bool> DeleteResumeAsync(Guid resumeId, Guid userId);

        Task<bool> SetDefaultResumeAsync(Guid resumeId, Guid userId);
    }
}
