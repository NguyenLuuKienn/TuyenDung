using Microsoft.EntityFrameworkCore;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class DashboardServices : IDashboardServices
    {
        private readonly SchneeJobDbContext _context;
        public DashboardServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<EmployerDashboardStats> GetEmployerDashboardAsync(Guid employerUserId)
        {
            var employer = await _context.Users.FindAsync(employerUserId);
            if (employer?.CompanyId == null)
            {
                throw new InvalidOperationException("Employer is not associated with any company.");
            }
            var companyId = employer.CompanyId.Value;

            // Lấy danh sách ID các job thuộc công ty
            var companyJobIds = await _context.Jobs
                .Where(j => j.CompanyId == companyId)
                .Select(j => j.JobId)
                .ToListAsync();

            // Thống kê
            var totalJobsPosted = companyJobIds.Count;
            var totalApplicationsReceived = await _context.Applications
                .CountAsync(a => companyJobIds.Contains(a.JobId));

            var recentApplications = await _context.Applications
                .Where(a => companyJobIds.Contains(a.JobId))
                .Include(a => a.User) // Lấy thông tin người ứng tuyển
                .Include(a => a.Job)  // Lấy tên job
                .OrderByDescending(a => a.AppliedDate)
                .Take(5)
                .ToListAsync();

            var jobPerformanceStats = await _context.Applications
                .Where(a => companyJobIds.Contains(a.JobId))
                .GroupBy(a => new { a.JobId, a.Job.JobTitle })
                .Select(g => new JobPerformanceStat
                {
                    JobId = g.Key.JobId,
                    JobTitle = g.Key.JobTitle,
                    ApplicationCount = g.Count()
                })
                .OrderByDescending(s => s.ApplicationCount)
                .ToListAsync();

            return new EmployerDashboardStats
            {
                TotalJobsPosted = totalJobsPosted,
                TotalApplicationsReceived = totalApplicationsReceived,
                RecentApplications = recentApplications,
                JobPerformanceStats = jobPerformanceStats
            };
        }

        public async Task<AdminDashboardStats> GetAdminDashboardAsync()
        {
            var totalUsers = await _context.Users.LongCountAsync();
            var totalCompanies = await _context.Companies.LongCountAsync();
            var totalOpenJobs = await _context.Jobs.LongCountAsync(j => j.Status == "Open");
            var totalApplications = await _context.Applications.LongCountAsync();

            var topIndustries = await _context.Jobs
                .Include(j => j.Company)
                .ThenInclude(c => c.Industry)
                .Where(j => j.Company != null && j.Company.Industry != null)
                .GroupBy(j => j.Company.Industry.IndustryName)
                .Select(g => new TopIndustryStat
                {
                    IndustryName = g.Key,
                    JobCount = g.Count()
                })
                .OrderByDescending(i => i.JobCount)
                .Take(5)
                .ToListAsync();

            var topSkills = await _context.JobSkills
                .Include(js => js.Skill)
                .Where(js => js.Skill != null)
                .GroupBy(js => js.Skill.SkillName)
                .Select(g => new TopSkillStat
                {
                    SkillName = g.Key,
                    JobCount = g.Count()
                })
                .OrderByDescending(s => s.JobCount)
                .Take(5)
                .ToListAsync();

            return new AdminDashboardStats
            {
                TotalUsers = totalUsers,
                TotalCompanies = totalCompanies,
                TotalOpenJobs = totalOpenJobs,
                TotalApplications = totalApplications,
                TopIndustries = topIndustries,
                TopSkills = topSkills
            };
        }
    }
}
