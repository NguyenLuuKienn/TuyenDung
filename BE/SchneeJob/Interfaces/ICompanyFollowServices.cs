namespace SchneeJob.Interfaces
{
    public interface ICompanyFollowServices
    {
        Task<CompanyFollow> FollowCompanyAsync(Guid userId, Guid companyId);
        Task<bool> UnfollowCompanyAsync(Guid userId, Guid companyId);
        Task<IEnumerable<CompanyFollow>> GetMyFollowingCompaniesAsync(Guid userId);
    }
}
