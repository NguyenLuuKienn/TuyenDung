using SchneeJob.Models;

namespace SchneeJob.Interfaces
{
    public interface ICompanyRegistrationServices
    {
        Task<CompanyRegistration> SubmitRegistrationAsync(CompanyRegistration request);
        Task<List<CompanyRegistration>> GetAllRegistrationsAsync();
        Task<List<CompanyRegistration>> GetRegistrationsByEmailAsync(string email);
    }
}
