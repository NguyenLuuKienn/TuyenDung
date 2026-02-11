using SchneeJob.Models;

namespace SchneeJob.Interfaces
{
    public interface IEducationLevelServices
    {
        Task<IEnumerable<EducationLevel>> GetAllEducationLevelsAsync();
        Task<EducationLevel> GetEducationLevelByIdAsync(Guid levelId);
        Task<EducationLevel> CreateEducationLevelAsync(EducationLevel level);
        Task<EducationLevel> UpdateEducationLevelAsync(Guid levelId, EducationLevel level);
        Task DeleteEducationLevelAsync(Guid levelId);
    }
}
