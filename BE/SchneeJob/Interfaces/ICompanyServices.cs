namespace SchneeJob.Interfaces
{
    public interface ICompanyServices
    {
        Task<IEnumerable<Company>> GetAllCompaniesAsync();
        Task<Company?> GetCompanyByIdAsync(Guid id);
        Task<Company> GetCompanyByEmployerIdAsync(Guid employerId);
        Task<Company> UpdateCompanyAsync(Company companyFromClient, Guid employerId);
        Task<bool> DeleteCompanyAsync(Guid id);
        Task<Company> UpdateVerificationAsync(Guid id, bool isVerified);
    }
}
