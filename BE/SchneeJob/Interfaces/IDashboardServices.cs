using SchneeJob.DTOs;

namespace SchneeJob.Interfaces
{
    public interface IDashboardServices
    {
        Task<EmployerDashboardStats> GetEmployerDashboardAsync(Guid employerUserId);

        Task<AdminDashboardStats> GetAdminDashboardAsync();
    }
}
