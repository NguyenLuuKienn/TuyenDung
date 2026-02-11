using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class SkillServices : ISkillServices
    {
        private readonly SchneeJobDbContext _context;
        public SkillServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Skill>> GetAllSkillsAsync()
        {
            return await _context.Skills.AsNoTracking().ToListAsync();
        }
        public async Task<Skill> GetAllSkillAsync(Guid skillId)
        {
            var skill = await _context.Skills.FindAsync(skillId);
            if (skill == null)
            {
                throw new KeyNotFoundException("Skill not found");
            }
            return skill;
        }
        public async Task<Skill> CreateSkillAsync(Skill skill)
        {
            var existingSkill = await _context.Skills
                .FirstOrDefaultAsync(s => s.SkillName.ToLower() == skill.SkillName.ToLower());
            if (existingSkill != null)
            {
                throw new InvalidOperationException("Skill with the same name already exists");
            }
            _context.Skills.Add(skill);
            await _context.SaveChangesAsync();
            return skill;
        }
        public async Task<Skill> UpdateSkillAsync(Guid skillId, Skill skill)
        {
            var existingSkill = await _context.Skills.FindAsync(skillId);
            if (existingSkill == null)
            {
                throw new KeyNotFoundException("Skill not found");
            }
            existingSkill.SkillName = skill.SkillName;
            await _context.SaveChangesAsync();
            return existingSkill;
        }
        public async Task<bool> DeleteSkillAsync(Guid skillId)
        {
            var skillDelete = await _context.Skills.FindAsync(skillId);
            if (skillDelete == null)
            {
                throw new KeyNotFoundException("Skill not found");
            }
            _context.Skills.Remove(skillDelete);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
