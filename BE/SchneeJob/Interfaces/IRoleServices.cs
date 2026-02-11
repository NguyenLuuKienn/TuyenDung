using SchneeJob.Models;

namespace SchneeJob.Interfaces
{
    public interface IRoleServices
    {
        Task<IEnumerable<Role>> GetAllRoleAsync();
        Task<Role> GetRoleByIdAsync(Guid roleId);
        Task<Role> CreateRoleAsync(Role role);
        Task<Role> UpdateRoleAsync(Guid roleId, Role role);
        Task<bool> DeleteRoleAsync(Guid roleId);
    }
}
