using SchneeJob.Models;

namespace SchneeJob.Interfaces
{
    public interface IIndustriesServices
    {
        Task<IEnumerable<Industries>> GetAllIndustriesAsync();
        Task<Industries> GetIndustryByIdAsync(Guid industryId);
        Task<Industries> CreateIndustryAsync(Industries industry);
        Task<Industries> UpdateIndustryAsync(Guid industryId, Industries industry);
        Task DeleteIndustryAsync(Guid industryId);
    }
}
