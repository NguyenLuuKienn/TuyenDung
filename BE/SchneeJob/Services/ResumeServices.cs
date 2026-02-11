using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class ResumeServices : IResumeServices
    {
        private readonly SchneeJobDbContext _context;
        public ResumeServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Resume>> GetResumesByUserIdAsync(Guid userId)
        {
            return await _context.Resumes
                .Where(r => r.UserId == userId)
                .OrderByDescending(r => r.UploadDate)
                .ToListAsync();
        }

        public async Task<Resume> AddResumeAsync(Resume resume, Guid userId)
        {
            resume.UserId = userId;
            resume.UploadDate = DateTime.UtcNow;
            resume.ResumeId = Guid.NewGuid(); 

            _context.Resumes.Add(resume);
            await _context.SaveChangesAsync();
            return resume;
        }

        public async Task<bool> DeleteResumeAsync(Guid resumeId, Guid userId)
        {
            var resume = await _context.Resumes.FirstOrDefaultAsync(r => r.ResumeId == resumeId && r.UserId == userId);
            if (resume == null)
            {
                return false;
            }

            var isInUse = await _context.Applications.AnyAsync(a => a.ResumeId == resumeId);
            if (isInUse)
            {
                
                throw new InvalidOperationException("Cannot delete this resume because it has been used in an application.");
            }

            _context.Resumes.Remove(resume);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SetDefaultResumeAsync(Guid resumeId, Guid userId)
        {
            var otherResumes = await _context.Resumes
                .Where(r => r.UserId == userId && r.IsDefault)
                .ToListAsync();

            foreach (var res in otherResumes)
            {
                res.IsDefault = false;
            }

            var targetResume = await _context.Resumes.FirstOrDefaultAsync(r => r.ResumeId == resumeId && r.UserId == userId);
            if (targetResume == null)
            {
                return false;
            }
            targetResume.IsDefault = true;

            return await _context.SaveChangesAsync() > 0;
        }
    }
}
