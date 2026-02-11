using SchneeJob.Models;
namespace SchneeJob.Interfaces
{
    public interface ISkillServices
    {
        Task<IEnumerable<Skill>> GetAllSkillsAsync();
        Task<Skill> GetAllSkillAsync(Guid skillId);
        Task<Skill> CreateSkillAsync(Skill skill);
        Task<Skill> UpdateSkillAsync(Guid skillId, Skill skill);
        Task<bool> DeleteSkillAsync(Guid skillId);

    }
}
