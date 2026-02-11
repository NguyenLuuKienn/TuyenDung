using SchneeJob.DTOs;
using SchneeJob.Models;

namespace SchneeJob.Interfaces
{
    public interface IPostService
    {
        Task<IEnumerable<PostResponseDto>> GetAllPostsAsync();
        Task<IEnumerable<PostResponseDto>> GetCompanyPostsAsync(Guid companyId);
        Task<PostResponseDto?> GetPostByIdAsync(Guid postId);
        Task<PostResponseDto> CreatePostAsync(Guid companyId, CreatePostDto dto);
        Task<PostResponseDto?> UpdatePostAsync(Guid postId, Guid companyId, UpdatePostDto dto);
        Task<bool> DeletePostAsync(Guid postId, Guid companyId);
        Task<bool> IncrementViewAsync(Guid postId);
    }
}
