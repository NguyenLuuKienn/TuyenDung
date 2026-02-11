using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class IndustriesServices : IIndustriesServices
    {
        private readonly SchneeJobDbContext _context;

        public IndustriesServices(SchneeJobDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Industries>> GetAllIndustriesAsync()
        {
            return await _context.Industry.AsNoTracking().ToListAsync();
        }

        public async Task<Industries> GetIndustryByIdAsync(Guid industryId)
        {
            var industry = await _context.Industry.FindAsync(industryId);
            if (industry == null)
            {
                throw new KeyNotFoundException("Industry not found");
            }
            return industry;
        }

        public async Task<Industries> CreateIndustryAsync(Industries industry)
        {
            var existingIndustry = await _context.Industry
                .FirstOrDefaultAsync(i => i.IndustryName.ToLower() == industry.IndustryName.ToLower());
            if (existingIndustry != null)
            {
                throw new InvalidOperationException("Industry with the same name already exists");
            }
            _context.Industry.Add(industry);
            await _context.SaveChangesAsync();
            return industry;
        }

        public async Task<Industries> UpdateIndustryAsync(Guid industryId, Industries industry)
        {
            var existingIndustry = await _context.Industry.FindAsync(industryId);
            if (existingIndustry == null)
            {
                throw new KeyNotFoundException("Industry not found");
            }
            existingIndustry.IndustryName = industry.IndustryName;
            await _context.SaveChangesAsync();
            return existingIndustry;
        }

        public async Task DeleteIndustryAsync(Guid industryId)
        {
            var industry = await _context.Industry.FindAsync(industryId);
            if (industry == null)
            {
                throw new KeyNotFoundException("Industry not found");
            }
            _context.Industry.Remove(industry);
            await _context.SaveChangesAsync();
        }
    }
}
