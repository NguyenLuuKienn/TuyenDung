namespace SchneeJob.Interfaces
{
    public interface IMatchingServices
    {
        Task<IEnumerable<Job>> GetJobSuggestionsAsync(Guid userId, int limit = 10);
    }
}
