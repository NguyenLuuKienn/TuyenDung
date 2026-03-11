using Microsoft.EntityFrameworkCore;
using SchneeJob.Interfaces;

namespace SchneeJob.Services
{
    public class CompanyReviewServices : ICompanyReviewServices
    {
        private readonly SchneeJobDbContext _context;
        private readonly INotificationServices _notificationServices;
        public CompanyReviewServices(SchneeJobDbContext context, INotificationServices notificationServices)
        {
            _context = context;
            _notificationServices = notificationServices;
        }
        public async Task<IEnumerable<CompanyReview>> GetReviewsForCompanyAsync(Guid companyId)
        {
            return await _context.CompanyReviews
                .Where(r => r.CompanyId == companyId)
                .Include(r => r.User) 
                .Select(r => new CompanyReview 
                {
                    ReviewId = r.ReviewId,
                    Rating = r.Rating,
                    Title = r.Title,
                    ReviewContent = r.ReviewContent,
                    CreatedAt = r.CreatedAt,
                    IsAnonymous = r.IsAnonymous,
                    User = r.IsAnonymous ? null : new User { FullName = r.User.FullName, AvatarURL = r.User.AvatarURL }
                })
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<CompanyReview> CreateReviewAsync(CompanyReview review, Guid userId)
        {
            var hasReviewed = await _context.CompanyReviews
                .AnyAsync(r => r.CompanyId == review.CompanyId && r.UserId == userId);
            if (hasReviewed)
            {
                throw new InvalidOperationException("You have already reviewed this company.");
            }

            review.UserId = userId;
            review.CreatedAt = DateTime.UtcNow;
            review.ReviewId = Guid.NewGuid(); 

            _context.CompanyReviews.Add(review);
            await _context.SaveChangesAsync();

            // Notify company employer
            var employer = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.CompanyId == review.CompanyId && 
                    u.UserRoles.Any(ur => ur.Role.RoleName == "Employer"));
            if (employer != null)
            {
                var reviewer = await _context.Users.FindAsync(userId);
                var reviewerName = review.IsAnonymous ? "Một người dùng (Ẩn danh)" : (reviewer?.FullName ?? "Một người dùng");
                await _notificationServices.CreateNotificationAsync(
                    employer.UserId,
                    "NewCompanyReview",
                    $"{reviewerName} đã để lại đánh giá {review.Rating} sao cho công ty của bạn.",
                    $"/companies/{review.CompanyId}/reviews"
                );
            }

            return review;
        }

        public async Task<bool> DeleteReviewAsync(Guid reviewId, Guid userId)
        {
            var review = await _context.CompanyReviews.FindAsync(reviewId);
            if (review == null)
            {
                return false;
            }

            var user = await _context.Users.Include(u => u.UserRoles).ThenInclude(ur => ur.Role).FirstAsync(u => u.UserId == userId);
            var isAdmin = user.UserRoles.Any(ur => ur.Role.RoleName == "Admin");

            // Chỉ người viết hoặc Admin mới được xóa
            if (review.UserId != userId && !isAdmin)
            {
                throw new UnauthorizedAccessException("You are not authorized to delete this review.");
            }

            _context.CompanyReviews.Remove(review);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
