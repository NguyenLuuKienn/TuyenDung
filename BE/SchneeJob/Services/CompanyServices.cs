using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class CompanyServices : ICompanyServices
    {
        private readonly SchneeJobDbContext _context;
        public CompanyServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Company>> GetAllCompaniesAsync()
        {
            return await _context.Companies.ToListAsync();
        }

        public async Task<Company?> GetCompanyByIdAsync(Guid id)
        {
            var company = await _context.Companies
                .Include(c => c.Industry)
                .Include(c => c.Employers)
                .FirstOrDefaultAsync(c => c.CompanyId == id);

            if (company != null)
            {
                company.ContactUserId = company.Employers.FirstOrDefault()?.UserId;

                // Fallback: If Include failed or collection is empty, try manual query
                if (company.ContactUserId == null)
                {
                    var employer = await _context.Users
                        .Where(u => u.CompanyId == id)
                        .FirstOrDefaultAsync();
                    
                    if (employer != null)
                    {
                        company.ContactUserId = employer.UserId;
                        // Optional: we could also add to company.Employers but mapped properties are cleaner
                    }
                }
            }

            return company;
        }
        public async Task<Company?> GetCompanyByEmployerIdAsync(Guid employerId)
        {
            var employer = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == employerId);

            if (employer?.CompanyId == null)
            {
                return null;
            }

            return await _context.Companies
                .Include(c => c.Industry) 
                .FirstOrDefaultAsync(c => c.CompanyId == employer.CompanyId);
        }

        public async Task<Company> UpdateCompanyAsync(Company companyFromClient, Guid employerId)
        {
            var employer = await _context.Users.FindAsync(employerId);
            if (employer?.CompanyId == null)
            {
                throw new UnauthorizedAccessException("You are not associated with any company.");
            }

            var existingCompany = await _context.Companies.FindAsync(employer.CompanyId);
            if (existingCompany == null)
            {
                throw new KeyNotFoundException("Company not found.");
            }

            existingCompany.CompanyName = companyFromClient.CompanyName;
            existingCompany.CompanyEmail = companyFromClient.CompanyEmail;
            existingCompany.PhoneNumber = companyFromClient.PhoneNumber;
            existingCompany.Website = companyFromClient.Website;
            existingCompany.LogoURL = companyFromClient.LogoURL;
            existingCompany.CoverImageURL = companyFromClient.CoverImageURL;
            existingCompany.CompanyDescription = companyFromClient.CompanyDescription;
            existingCompany.IndustryId = companyFromClient.IndustryId;
            existingCompany.CompanySize = companyFromClient.CompanySize;
            existingCompany.Address = companyFromClient.Address;
            existingCompany.City = companyFromClient.City;
            existingCompany.Country = companyFromClient.Country;


            await _context.SaveChangesAsync();
            return existingCompany;
        }

        public async Task<bool> DeleteCompanyAsync(Guid id)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null) return false;

            // Optional: Handle related data cleanup if cascade delete is not set or needed manually
            // But EF Core Cascade Delete (if configured) handles it.
            // If you have `OnModelCreating` configuration with `DeleteBehavior.NoAction`, 
            // you might need to manually delete dependent records here or change behavior.
            
            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<Company> UpdateVerificationAsync(Guid id, bool isVerified)
        {
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                throw new KeyNotFoundException("Company not found");
            }

            company.IsVerified = isVerified;
            await _context.SaveChangesAsync();
            return company;
        }
    }
}
