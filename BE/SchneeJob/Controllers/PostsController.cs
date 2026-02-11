using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;
using SchneeJob.Models;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostsController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly SchneeJobDbContext _context;

        public PostsController(IPostService postService, SchneeJobDbContext context)
        {
            _postService = postService;
            _context = context;
        }

        // GET: api/posts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PostResponseDto>>> GetAllPosts()
        {
            var posts = await _postService.GetAllPostsAsync();
            return Ok(posts);
        }

        // GET: api/posts/company/{companyId}
        [HttpGet("company/{companyId}")]
        public async Task<ActionResult<IEnumerable<PostResponseDto>>> GetCompanyPosts(Guid companyId)
        {
            var posts = await _postService.GetCompanyPostsAsync(companyId);
            return Ok(posts);
        }

        // GET: api/posts/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<PostResponseDto>> GetPost(Guid id)
        {
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null)
                return NotFound(new { message = "Bài viết không tồn tại" });

            return Ok(post);
        }

        // POST: api/posts
        [Authorize(Roles = "Employer")]
        [HttpPost]
        public async Task<ActionResult<PostResponseDto>> CreatePost([FromBody] CreatePostDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            // Get user's company ID from database
            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.CompanyId == null)
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin công ty" });
            }

            var post = await _postService.CreatePostAsync(user.CompanyId.Value, dto);
            return CreatedAtAction(nameof(GetPost), new { id = post.PostId }, post);
        }

        // PUT: api/posts/{id}
        [Authorize(Roles = "Employer")]
        [HttpPut("{id}")]
        public async Task<ActionResult<PostResponseDto>> UpdatePost(Guid id, [FromBody] UpdatePostDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.CompanyId == null)
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin công ty" });
            }

            var post = await _postService.UpdatePostAsync(id, user.CompanyId.Value, dto);
            if (post == null)
                return NotFound(new { message = "Bài viết không tồn tại hoặc bạn không có quyền chỉnh sửa" });

            return Ok(post);
        }

        // DELETE: api/posts/{id}
        [Authorize(Roles = "Employer")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePost(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.CompanyId == null)
            {
                return Unauthorized(new { message = "Không tìm thấy thông tin công ty" });
            }

            var result = await _postService.DeletePostAsync(id, user.CompanyId.Value);
            if (!result)
                return NotFound(new { message = "Bài viết không tồn tại hoặc bạn không có quyền xóa" });

            return Ok(new { message = "Xóa bài viết thành công" });
        }

        // POST: api/posts/{id}/view
        [HttpPost("{id}/view")]
        public async Task<IActionResult> IncrementView(Guid id)
        {
            await _postService.IncrementViewAsync(id);
            return Ok();
        }

        // GET: api/posts/{id}/isliked
        [Authorize]
        [HttpGet("{id}/isliked")]
        public async Task<IActionResult> IsLiked(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Ok(new { isLiked = false });
            }

            var isLiked = await _context.PostLikes
                .AnyAsync(pl => pl.PostId == id && pl.UserId == userId);

            return Ok(new { isLiked });
        }

        // POST: api/posts/{id}/like
        [Authorize]
        [HttpPost("{id}/like")]
        public async Task<IActionResult> LikePost(Guid id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var existingLike = await _context.PostLikes
                .FirstOrDefaultAsync(pl => pl.PostId == id && pl.UserId == userId);

            if (existingLike != null)
            {
                // Unlike
                _context.PostLikes.Remove(existingLike);
                var post = await _context.Posts.FindAsync(id);
                if (post != null) post.Likes = Math.Max(0, post.Likes - 1);
            }
            else
            {
                // Like
                _context.PostLikes.Add(new PostLike { PostId = id, UserId = userId });
                var post = await _context.Posts.FindAsync(id);
                if (post != null) post.Likes++;
            }

            await _context.SaveChangesAsync();
            var updatedPost = await _context.Posts.FindAsync(id);
            return Ok(new { likes = updatedPost?.Likes ?? 0, isLiked = existingLike == null });
        }

        // GET: api/posts/{id}/comments
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetComments(Guid id)
        {
            var comments = await _context.PostComments
                .Include(pc => pc.User)
                .Where(pc => pc.PostId == id)
                .OrderByDescending(pc => pc.CreatedAt)
                .Select(pc => new
                {
                    id = pc.PostCommentId,
                    userId = pc.UserId,
                    userName = pc.User!.FullName,
                    userAvatar = pc.User.AvatarURL,
                    content = pc.Content,
                    createdAt = pc.CreatedAt
                })
                .ToListAsync();

            return Ok(comments);
        }

        // POST: api/posts/{id}/comment
        [Authorize]
        [HttpPost("{id}/comment")]
        public async Task<IActionResult> CommentPost(Guid id, [FromBody] CommentDto dto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var comment = new PostComment
            {
                PostId = id,
                UserId = userId,
                Content = dto.Content
            };

            _context.PostComments.Add(comment);
            
            var post = await _context.Posts.FindAsync(id);
            if (post != null) post.Comments++;

            await _context.SaveChangesAsync();

            var user = await _context.Users.FindAsync(userId);
            return Ok(new
            {
                id = comment.PostCommentId,
                userId = userId,
                userName = user?.FullName,
                userAvatar = user?.AvatarURL,
                content = comment.Content,
                createdAt = comment.CreatedAt
            });
        }

        // POST: api/posts/{id}/share
        [Authorize]
        [HttpPost("{id}/share")]
        public async Task<IActionResult> SharePost(Guid id)
        {
            var post = await _context.Posts.FindAsync(id);
            if (post == null) return NotFound();

            post.Shares++;
            await _context.SaveChangesAsync();

            return Ok(new { shares = post.Shares });
        }

        // DELETE: api/posts/comments/{commentId}
        [Authorize(Roles = "Employer")]
        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(int commentId)
        {
            var comment = await _context.PostComments
                .Include(c => c.Post)
                .FirstOrDefaultAsync(c => c.PostCommentId == commentId);

            if (comment == null)
                return NotFound(new { message = "Bình luận không tồn tại" });

            // Check if user owns the post
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null || user.CompanyId == null || comment.Post?.CompanyId != user.CompanyId)
            {
                return Forbid();
            }

            _context.PostComments.Remove(comment);
            if (comment.Post != null) comment.Post.Comments = Math.Max(0, comment.Post.Comments - 1);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Đã xóa bình luận" });
        }
    }

    public class CommentDto
    {
        public string Content { get; set; } = string.Empty;
    }
}
