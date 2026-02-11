using Microsoft.EntityFrameworkCore;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Services
{
    public class PostService : IPostService
    {
        private readonly SchneeJobDbContext _context;

        public PostService(SchneeJobDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PostResponseDto>> GetAllPostsAsync()
        {
            var posts = await _context.Posts
                .Include(p => p.Company)
                .Include(p => p.Job)
                .Where(p => p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(MapToDto);
        }

        public async Task<IEnumerable<PostResponseDto>> GetCompanyPostsAsync(Guid companyId)
        {
            var posts = await _context.Posts
                .Include(p => p.Company)
                .Include(p => p.Job)
                .Where(p => p.CompanyId == companyId && p.IsActive)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return posts.Select(MapToDto);
        }

        public async Task<PostResponseDto?> GetPostByIdAsync(Guid postId)
        {
            var post = await _context.Posts
                .Include(p => p.Company)
                .Include(p => p.Job)
                .FirstOrDefaultAsync(p => p.PostId == postId && p.IsActive);

            return post == null ? null : MapToDto(post);
        }

        public async Task<PostResponseDto> CreatePostAsync(Guid companyId, CreatePostDto dto)
        {
            var post = new Post
            {
                CompanyId = companyId,
                JobId = dto.JobId,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            // Reload with includes
            var created = await _context.Posts
                .Include(p => p.Company)
                .Include(p => p.Job)
                .FirstAsync(p => p.PostId == post.PostId);

            return MapToDto(created);
        }

        public async Task<PostResponseDto?> UpdatePostAsync(Guid postId, Guid companyId, UpdatePostDto dto)
        {
            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.PostId == postId && p.CompanyId == companyId);

            if (post == null) return null;

            post.Content = dto.Content;
            post.ImageUrl = dto.ImageUrl;
            post.JobId = dto.JobId;
            post.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload with includes
            var updated = await _context.Posts
                .Include(p => p.Company)
                .Include(p => p.Job)
                .FirstAsync(p => p.PostId == post.PostId);

            return MapToDto(updated);
        }

        public async Task<bool> DeletePostAsync(Guid postId, Guid companyId)
        {
            var post = await _context.Posts
                .FirstOrDefaultAsync(p => p.PostId == postId && p.CompanyId == companyId);

            if (post == null) return false;

            post.IsActive = false;
            post.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IncrementViewAsync(Guid postId)
        {
            var post = await _context.Posts.FindAsync(postId);
            if (post == null) return false;

            post.Views++;
            await _context.SaveChangesAsync();
            return true;
        }

        private PostResponseDto MapToDto(Post post)
        {
            return new PostResponseDto
            {
                PostId = post.PostId,
                CompanyId = post.CompanyId,
                CompanyName = post.Company?.CompanyName ?? "",
                CompanyLogo = post.Company?.LogoURL,
                JobId = post.JobId,
                Job = post.Job != null ? new JobSummaryDto
                {
                    JobId = (Guid)(object)post.Job.JobId, // Cast Guid to int for DTO
                    Title = post.Job.JobTitle,
                    Location = post.Job.Location,
                    SalaryMin = post.Job.SalaryMin,
                    SalaryMax = post.Job.SalaryMax
                } : null,
                Content = post.Content,
                ImageUrl = post.ImageUrl,
                Likes = post.Likes,
                Comments = post.Comments,
                Shares = post.Shares,
                Views = post.Views,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt
            };
        }
    }
}
