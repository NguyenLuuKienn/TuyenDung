using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class AdminServices : IAdminServices
    {
        private readonly SchneeJobDbContext _context;
        public AdminServices(SchneeJobDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<User>> GetUsersAsync(string searchTerm, int pageNumber, int pageSize)
        {
            var query = _context.Users
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(u => u.Email.Contains(searchTerm) || u.FullName.Contains(searchTerm));
            }

            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            users.ForEach(u => u.PasswordHash = null);

            return users; 
        }

        public async Task<User> GetUserDetailAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.Company)
                .Include(u => u.UserRoles).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user != null) user.PasswordHash = null;
            return user;
        }
        public async Task<bool> RemoveUserAsync(Guid userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Soft-delete: mark as inactive to preserve relations and avoid FK complications
            user.IsActive = false;
            _context.Users.Update(user);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> SetUserActiveStatusAsync(Guid userId, bool isActive)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            user.IsActive = isActive;
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> RemoveJobAsync(Guid jobId)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null) return false;

            _context.Jobs.Remove(job);
            return await _context.SaveChangesAsync() > 0;
        }

        // --- Job Management ---
        public async Task<IEnumerable<Job>> GetAllJobsAsync(string searchTerm, int pageNumber, int pageSize)
        {
            var query = _context.Jobs.Include(j => j.Company).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(j => j.JobTitle.Contains(searchTerm) || j.Company.CompanyName.Contains(searchTerm));
            }

            // Chỉ phân trang và trả về
            var jobs = await query
                .OrderByDescending(j => j.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return jobs; 
        }

        public async Task<IEnumerable<CompanyReview>> GetAllCompanyReviewsAsync(int pageNumber, int pageSize)
        {
            var query = _context.CompanyReviews
                .Include(r => r.User)
                .Include(r => r.Company)
                .AsNoTracking();

            var reviews = await query
                .OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            reviews.ForEach(r => r.User.PasswordHash = null);

            return reviews; 
        }
        public async Task<bool> RemoveCompanyReviewAsync(Guid reviewId)
        {
            var review = await _context.CompanyReviews.FindAsync(reviewId);
            if (review == null) return false;

            _context.CompanyReviews.Remove(review);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<bool> AssignRoleToUserAsync(Guid userId, Guid roleId)
        {
            var user = await _context.Users.FindAsync(userId);
            var role = await _context.Roles.FindAsync(roleId);
            if (user == null || role == null) return false;

            var alreadyHasRole = await _context.UserRoles.AnyAsync(ur => ur.UserID == userId && ur.RoleID == roleId);
            if (alreadyHasRole) return true; 

            _context.UserRoles.Add(new UserRole { UserID = userId, RoleID = roleId });
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> RemoveRoleFromUserAsync(Guid userId, Guid roleId)
        {
            var userRole = await _context.UserRoles
                .FirstOrDefaultAsync(ur => ur.UserID == userId && ur.RoleID == roleId);

            if (userRole == null) return false; // Không tìm thấy để xóa

            _context.UserRoles.Remove(userRole);
            return await _context.SaveChangesAsync() > 0;
        }
        public async Task<IEnumerable<CompanyRegistration>> GetPendingRegistrationsAsync()
        {
            return await _context.CompanyRegistrations
                .Where(r => r.Status == "Pending")
                .OrderBy(r => r.RequestedAt)
                .ToListAsync();
        }

        public async Task<bool> ApproveRegistrationAsync(Guid requestId, Guid adminId)
        {
            var request = await _context.CompanyRegistrations.FindAsync(requestId);
            if (request == null || request.Status.ToLower() != "pending")
            {
                throw new InvalidOperationException("Registration request not found or has already been processed.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Verify IndustryId exists
                var industryExists = await _context.Industry.AnyAsync(i => i.IndustryId == request.IndustryId);
                if (!industryExists)
                {
                    throw new InvalidOperationException($"Industry with ID {request.IndustryId} not found.");
                }

                var newCompany = new Company
                {
                    CompanyName = request.CompanyName,
                    Website = request.Website ?? "",
                    PhoneNumber = request.CompanyPhoneNumber ?? "",
                    Address = request.Address ?? "",
                    IndustryId = request.IndustryId,
                    IsVerified = true, // Admin duyệt nên mặc định là đã xác thực
                    City = "",
                    CompanyDescription = "",
                    CompanyEmail = request.ContactPersonEmail ?? "",
                    CompanySize = "",
                    Country = "",
                    CoverImageURL = request.CoverImageURL ?? string.Empty,
                    LogoURL = request.LogoURL ?? string.Empty
                };
                _context.Companies.Add(newCompany);
                await _context.SaveChangesAsync();

                // Check if user already exists with this email
                var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.ContactPersonEmail);
                
                if (existingUser != null)
                {
                    // Update existing user with company ID
                    existingUser.CompanyId = newCompany.CompanyId;
                    _context.Users.Update(existingUser);
                }
                else
                {
                    // Create new user only if doesn't exist
                    var tempPassword = GenerateRandomPassword();
                    var newUser = new User
                    {
                        Email = request.ContactPersonEmail,
                        FullName = request.ContactPersonName,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(tempPassword),
                        CompanyId = newCompany.CompanyId,
                    };

                    var employerRole = await _context.Roles.FirstAsync(r => r.RoleName == "Employer");
                    newUser.UserRoles.Add(new UserRole { Role = employerRole });
                    _context.Users.Add(newUser);
                }
                
                await _context.SaveChangesAsync();

                request.Status = "Approved";
                request.ReviewedByAdminId = adminId;
                request.ReviewedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                // 4. Gửi email thông báo cho người đăng ký kèm mật khẩu tạm thời
                // TODO: Implement email sending logic
                // SendEmail(request.ContactPersonEmail, "Your Company Registration is Approved", $"Your username is {newUser.Email} and temporary password is {tempPassword}");

                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> RejectRegistrationAsync(Guid requestId, Guid adminId, string notes)
        {
            var request = await _context.CompanyRegistrations.FindAsync(requestId);
            if (request == null || request.Status.ToLower() != "pending") return false;

            request.Status = "Rejected";
            request.ReviewedByAdminId = adminId;
            request.ReviewedAt = DateTime.UtcNow;
            request.AdminNotes = notes;

            // TODO: Gửi email thông báo từ chối
            return await _context.SaveChangesAsync() > 0;
        }
        private string GenerateRandomPassword() => "TempPassword123!";
    }
}
