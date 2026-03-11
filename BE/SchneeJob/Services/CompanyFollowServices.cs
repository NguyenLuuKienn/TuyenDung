using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class CompanyFollowServices : ICompanyFollowServices
    {
        private readonly SchneeJobDbContext _context;
        private readonly INotificationServices _notificationServices;
        public CompanyFollowServices(SchneeJobDbContext context, INotificationServices notificationServices)
        {
            _context = context;
            _notificationServices = notificationServices;
        }

        public async Task<CompanyFollow> FollowCompanyAsync(Guid userId, Guid companyId)
        {
            var alreadyExists = await _context.CompanyFollows.AnyAsync(cf => cf.UserId == userId && cf.CompanyId == companyId);
            if (alreadyExists)
            {
                throw new InvalidOperationException("You are already following this company.");
            }

            var companyFollow = new CompanyFollow
            {
                UserId = userId,
                CompanyId = companyId,
                FollowedDate = DateTime.UtcNow,
            };

            _context.CompanyFollows.Add(companyFollow);
            await _context.SaveChangesAsync();

            // Notify company employer if possible
            var employer = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.CompanyId == companyId && 
                    u.UserRoles.Any(ur => ur.Role.RoleName == "Employer"));
            if (employer != null)
            {
                var follower = await _context.Users.FindAsync(userId);
                var followerName = follower?.FullName ?? "Một người dùng";
                await _notificationServices.CreateNotificationAsync(
                    employer.UserId,
                    "NewFollower",
                    $"{followerName} đã bắt đầu theo dõi công ty của bạn.",
                    $"/employer/followers"
                );
            }

            return companyFollow;
        }
        public async Task<bool> UnfollowCompanyAsync(Guid userId, Guid companyId)
        {
            var companyFollow = await _context.CompanyFollows.FirstOrDefaultAsync(cf => cf.UserId == userId && cf.CompanyId == companyId);
            if (companyFollow == null)
            {
                return false;
            }

            _context.CompanyFollows.Remove(companyFollow);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<IEnumerable<CompanyFollow>> GetMyFollowingCompaniesAsync(Guid userId)
        {
            return await _context.CompanyFollows
                .Where(cf => cf.UserId == userId)
                .Include(cf => cf.Company) 
                .OrderByDescending(cf => cf.FollowedDate)
                .ToListAsync();
        }
    }
}
