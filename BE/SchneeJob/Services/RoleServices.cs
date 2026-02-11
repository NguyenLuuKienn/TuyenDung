using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class RoleServices : IRoleServices
    {
        private readonly SchneeJobDbContext _context;
        public RoleServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Role>> GetAllRoleAsync()
        {
            return await _context.Roles.AsNoTracking().ToListAsync();
        }

        public async Task<Role> GetRoleByIdAsync(Guid roleId)
        {
            return await _context.Roles.FindAsync(roleId);
        }

        public async Task<Role> CreateRoleAsync(Role role)
        {
            role.RoleId = new Guid();
            _context.Roles.Add(role);
            await _context.SaveChangesAsync();
            return role;
        }

        public async Task<Role> UpdateRoleAsync(Guid roleId, Role role)
        {
            var existingRole = await _context.Roles.FindAsync(roleId);
            if (existingRole == null) return null;

            existingRole.RoleName = role.RoleName;
            await _context.SaveChangesAsync();
            return existingRole;
        }

        public async Task<bool> DeleteRoleAsync(Guid roleId)
        {
            var role = await _context.Roles.FindAsync(roleId);
            if (role == null) return false;

            var isRoleInUse = await _context.UserRoles.AnyAsync(ur => ur.RoleID == roleId);
            if (isRoleInUse)
            {
                throw new InvalidOperationException("Cannot delete this role because it is currently assigned to one or more users.");
            }

            _context.Roles.Remove(role);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
