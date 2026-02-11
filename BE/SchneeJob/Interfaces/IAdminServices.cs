using SchneeJob.Models;

namespace SchneeJob.Interfaces
{
    public interface IAdminServices
    {
        Task<IEnumerable<User>> GetUsersAsync(string searchTerm, int pageNumber, int pageSize);
        Task<User> GetUserDetailAsync(Guid userId);
        Task<bool> RemoveUserAsync(Guid userId);
        Task<bool> SetUserActiveStatusAsync(Guid userId, bool isActive);
        Task<IEnumerable<Job>> GetAllJobsAsync(string searchTerm, int pageNumber, int pageSize);
        Task<bool> RemoveJobAsync(Guid jobId);
        Task<IEnumerable<CompanyReview>> GetAllCompanyReviewsAsync(int pageNumber, int pageSize);
        Task<bool> RemoveCompanyReviewAsync(Guid reviewId);
        Task<bool> AssignRoleToUserAsync(Guid userId, Guid roleId);
        Task<bool> RemoveRoleFromUserAsync(Guid userId, Guid roleId);
        Task<IEnumerable<CompanyRegistration>> GetPendingRegistrationsAsync();
        Task<bool> ApproveRegistrationAsync(Guid requestId, Guid adminId);
        Task<bool> RejectRegistrationAsync(Guid requestId, Guid adminId, string notes);
    }
}
