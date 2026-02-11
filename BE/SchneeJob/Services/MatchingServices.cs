using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class MatchingServices : IMatchingServices
    {
        private readonly SchneeJobDbContext _context;
        public MatchingServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Job>> GetJobSuggestionsAsync(Guid userId, int limit = 10)
        {
            var userSkills = await _context.JobSeekerSkills
                .Where(jss => jss.Profile.UserId == userId)
                .Select(jss => jss.SkillId)
                .ToListAsync();

            if (!userSkills.Any())
            {
                return Enumerable.Empty<Job>(); 
            }

            var suggestedJobs = await _context.Jobs
                .AsNoTracking()
                .Include(j => j.Company)
                .Include(j => j.JobSkills)
                .Where(j => j.Status == "Open" && j.JobSkills.Any(js => userSkills.Contains(js.SkillId)))
                .Select(j => new 
                {
                    Job = j,
                    // Tính điểm: số kỹ năng trùng khớp
                    MatchScore = j.JobSkills.Count(js => userSkills.Contains(js.SkillId))
                })
                .OrderByDescending(x => x.MatchScore) // Ưu tiên job có nhiều kỹ năng trùng nhất
                .ThenByDescending(x => x.Job.IsPriority)
                .ThenByDescending(x => x.Job.CreatedAt)
                .Take(limit)
                .Select(x => x.Job) 
                .ToListAsync();

            return suggestedJobs;
        }
    }
}
