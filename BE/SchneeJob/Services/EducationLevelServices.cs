using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class EducationLevelServices : IEducationLevelServices
    {
        private readonly SchneeJobDbContext _context;

        public EducationLevelServices(SchneeJobDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EducationLevel>> GetAllEducationLevelsAsync()
        {
            return await _context.EducationLevels.AsNoTracking().ToListAsync();
        }

        public async Task<EducationLevel> GetEducationLevelByIdAsync(Guid levelId)
        {
            var level = await _context.EducationLevels.FindAsync(levelId);
            if (level == null)
            {
                throw new KeyNotFoundException("Education level not found");
            }
            return level;
        }

        public async Task<EducationLevel> CreateEducationLevelAsync(EducationLevel level)
        {
            var existingLevel = await _context.EducationLevels
                .FirstOrDefaultAsync(e => e.LevelName.ToLower() == level.LevelName.ToLower());
            if (existingLevel != null)
            {
                throw new InvalidOperationException("Education level with the same name already exists");
            }
            _context.EducationLevels.Add(level);
            await _context.SaveChangesAsync();
            return level;
        }

        public async Task<EducationLevel> UpdateEducationLevelAsync(Guid levelId, EducationLevel level)
        {
            var existingLevel = await _context.EducationLevels.FindAsync(levelId);
            if (existingLevel == null)
            {
                throw new KeyNotFoundException("Education level not found");
            }
            existingLevel.LevelName = level.LevelName;
            await _context.SaveChangesAsync();
            return existingLevel;
        }

        public async Task DeleteEducationLevelAsync(Guid levelId)
        {
            var level = await _context.EducationLevels.FindAsync(levelId);
            if (level == null)
            {
                throw new KeyNotFoundException("Education level not found");
            }
            _context.EducationLevels.Remove(level);
            await _context.SaveChangesAsync();
        }
    }
}
