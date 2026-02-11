using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace SchneeJob.Interfaces
{
    public class AuthenticatedUserInfo
    {
        public Guid UserID { get; set; } 
        public string Email { get; set; }
        public string FullName { get; set; }
        public string AvatarURL { get; set; }
        // Company info for employer accounts
        public Guid? CompanyId { get; set; }
        public bool CompanyVerified { get; set; }
        public List<string> Roles { get; set; }
    }
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public string Token { get; set; }
        public AuthenticatedUserInfo UserInfo { get; set; }
    }
    public interface IUserServices
    {
        Task<AuthenticatedUserInfo> RegisterAsync(User user, string roleName);
        Task<LoginResponse> LoginAsync(string email, string password);
        Task<User> GetUserByIdAsync(Guid userId);
    }
}
