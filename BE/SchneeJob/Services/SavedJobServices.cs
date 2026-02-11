using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class SavedJobServices : ISavedJobServices
    {
        private readonly SchneeJobDbContext _context;
        public SavedJobServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<SavedJob> SaveJobAsync(Guid userId, Guid jobId)
        {
            var alreadyExists = await _context.SavedJobs.AnyAsync(sj => sj.UserId == userId && sj.JobId == jobId);
            if (alreadyExists)
            {
                throw new InvalidOperationException("You have already saved this job.");
            }

            var savedJob = new SavedJob
            {
                UserId = userId,
                JobId = jobId,
                SavedDate = DateTime.UtcNow
            };

            _context.SavedJobs.Add(savedJob);
            await _context.SaveChangesAsync();
            return savedJob;
        }

        public async Task<bool> UnsaveJobAsync(Guid userId, Guid jobId)
        {
            var savedJob = await _context.SavedJobs.FirstOrDefaultAsync(sj => sj.UserId == userId && sj.JobId == jobId);
            if (savedJob == null)
            {
                return false;
            }

            _context.SavedJobs.Remove(savedJob);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<SavedJob>> GetMySavedJobsAsync(Guid userId)
        {
            return await _context.SavedJobs
                .Where(sj => sj.UserId == userId)
                .Include(sj => sj.Job) // Tải thông tin Job liên quan
                    .ThenInclude(j => j.Company) // Tải cả thông tin Công ty
                .OrderByDescending(sj => sj.SavedDate)
                .ToListAsync();
        }
    }
}
