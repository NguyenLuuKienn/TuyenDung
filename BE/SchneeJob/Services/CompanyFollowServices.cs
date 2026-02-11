using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class CompanyFollowServices : ICompanyFollowServices
    {
        private readonly SchneeJobDbContext _context;
        public CompanyFollowServices(SchneeJobDbContext context)
        {
            _context = context;
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
