using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class CompanyRegistrationServices : ICompanyRegistrationServices
    {
        private readonly SchneeJobDbContext _context;
        public CompanyRegistrationServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<CompanyRegistration> SubmitRegistrationAsync(CompanyRegistration request)
        {
            // Check if company already has pending or approved registration
            if (await _context.CompanyRegistrations.AnyAsync(r => r.CompanyName == request.CompanyName && r.Status.ToLower() != "rejected"))
            {
                throw new InvalidOperationException("A registration for this company is already pending or has been approved.");
            }

            request.RequestId = Guid.NewGuid();
            request.Status = "Pending";
            request.RequestedAt = DateTime.UtcNow;

            _context.CompanyRegistrations.Add(request);
            await _context.SaveChangesAsync();

            // TODO: Gửi email cho Admin thông báo có đơn mới
            return request;
        }

        public async Task<List<CompanyRegistration>> GetAllRegistrationsAsync()
        {
            return await _context.CompanyRegistrations
                .OrderByDescending(r => r.RequestedAt)
                .ToListAsync();
        }
    }
}
