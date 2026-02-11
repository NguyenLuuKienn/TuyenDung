using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserServices _userService;

        public AuthController(IUserServices userService)
        {
            _userService = userService;
        }


        [HttpPost("register-jobseeker")]
        public async Task<IActionResult> RegisterJobSeeker([FromBody] RegisterUserRequestDto request)
        {
            try
            {
                var user = new User
                {
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash),
                    FullName = request.FullName,
                    AvatarURL = "https://example.com/default-avatar.png",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                };

                var createdUserInfo = await _userService.RegisterAsync(user, "JobSeeker");
                return Ok(createdUserInfo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("register-employer")]
        public async Task<IActionResult> RegisterEmployer([FromBody] RegisterUserRequestDto request)
        {
            try
            {
                var user = new User
                {
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash),
                    FullName = request.FullName,
                    AvatarURL = "https://example.com/default-avatar.png",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                };

                var createdUserInfo = await _userService.RegisterAsync(user, "Employer");
                return Ok(createdUserInfo);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        public class LoginRequest
        {
            public string Email { get; set; }
            public string PasswordHash { get; set; }
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var response = await _userService.LoginAsync(request.Email, request.PasswordHash);

            if (!response.Success)
            {
                // If service indicates account is disabled, return 403 Forbidden with a JSON message
                if (response.Message == "AccountDisabled")
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new { message = "Account is disabled. Contact administrator." });
                }
                return Unauthorized(new { message = response.Message });
            }

            return Ok(response);
        }
    }
}
