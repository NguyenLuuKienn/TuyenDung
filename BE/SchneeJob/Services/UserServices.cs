using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SchneeJob.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SchneeJob.Services
{
    public class UserServices : IUserServices
    {
        private readonly SchneeJobDbContext _context;
        private readonly IConfiguration _configuration;
        public UserServices(SchneeJobDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration; 
        }
        public async Task<AuthenticatedUserInfo> RegisterAsync(User user, string roleName)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
            {
                throw new Exception("Email already exists.");
            }

            user.UserId = Guid.NewGuid();

            var role = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == roleName);
            if (role == null)
            {
                throw new Exception($"Role '{roleName}' not found.");
            }

            user.UserRoles.Add(new UserRole { Role = role });

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return new AuthenticatedUserInfo
            {
                UserID = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                AvatarURL = user.AvatarURL,
                Roles = new List<string> { role.RoleName },
                CompanyId = user.CompanyId,
                CompanyVerified = user.Company?.IsVerified ?? false
            };
        }
        public async Task<LoginResponse> LoginAsync(string email, string password)
        {
            var user = await _context.Users
                .Include(u => u.UserRoles)
                    .ThenInclude(ur => ur.Role)
                .Include(u => u.Company)
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
            {
                return new LoginResponse { Success = false, Message = "Invalid email or password." };
            }

            bool passwordMatches;

            if (!string.IsNullOrEmpty(user.PasswordHash) &&
                (user.PasswordHash.StartsWith("$2a$") || user.PasswordHash.StartsWith("$2b$")))
            {
                passwordMatches = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            }
            else
            {
                passwordMatches = password == user.PasswordHash;

                if (passwordMatches)
                {
                    user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(password);
                    await _context.SaveChangesAsync();
                }
            }

            if (!passwordMatches)
            {
                return new LoginResponse { Success = false, Message = "Invalid email or password." };
            }

            // Reject login if account is deactivated
            if (user.IsActive == false)
            {
                return new LoginResponse { Success = false, Message = "AccountDisabled" };
            }

            var token = GenerateJwtToken(user);

            var userInfo = new AuthenticatedUserInfo
            {
                UserID = user.UserId,
                Email = user.Email,
                FullName = user.FullName,
                AvatarURL = user.AvatarURL,
                Roles = user.UserRoles.Select(ur => ur.Role.RoleName).ToList(),
                CompanyId = user.CompanyId,
                CompanyVerified = user.Company?.IsVerified ?? false
            };

            return new LoginResponse { Success = true, Token = token, UserInfo = userInfo };
        }

        public async Task<User> GetUserByIdAsync(Guid userId) 
        {
            return await _context.Users.FindAsync(userId);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]);
            
            // Get expiration time from config (in minutes), default to 120 if not specified
            int expireMinutes = 120;
            if (int.TryParse(jwtSettings["ExpireMinutes"], out var configuredMinutes))
            {
                expireMinutes = configuredMinutes;
            }
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("name", user.FullName), // Add name claim for token reconstruction
            };

            foreach (var userRole in user.UserRoles)
            {
                claims.Add(new Claim(ClaimTypes.Role, userRole.Role.RoleName));
            }

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expireMinutes), // Use configurable expiration
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"]
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
