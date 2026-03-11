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

        public async Task<Resume> GetResumeByIdAsync(Guid resumeId, Guid userId)
        {
            return await _context.Resumes
                .FirstOrDefaultAsync(r => r.ResumeId == resumeId && r.UserId == userId);
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

        public async Task<Resume> UpdateResumeAsync(Guid resumeId, string title, string fileName, string fileType, Guid userId)
        {
            var resume = await _context.Resumes
                .FirstOrDefaultAsync(r => r.ResumeId == resumeId && r.UserId == userId);

            if (resume == null)
            {
                return null;
            }

            resume.Title = title;
            if (!string.IsNullOrWhiteSpace(fileName))
                resume.FileName = fileName;
            if (!string.IsNullOrWhiteSpace(fileType))
                resume.FileType = fileType;

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
                
                throw new InvalidOperationException("Không thể xóa CV này vì nó đã được sử dụng trong ứng tuyển.");
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
