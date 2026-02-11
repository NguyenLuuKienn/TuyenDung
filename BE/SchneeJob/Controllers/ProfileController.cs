using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "JobSeeker")]
    public class ProfileController : ControllerBase
    {
        private readonly IJobSeekerProfileServices _profileServices;
        public ProfileController(IJobSeekerProfileServices profileServices)
        {
            _profileServices = profileServices;
        }
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var profile = await _profileServices.GetProfileByUserIdAsync(userId);

            if (profile == null)
            {
                return NotFound("Profile not found. Please create one.");
            }

            return Ok(profile);
        }

        // PUT: api/profiles/me 
        [HttpPut("me")]
        public async Task<IActionResult> CreateOrUpdateMyProfile([FromBody] JobSeekerProfile profile)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            profile.UserId = Guid.Empty;
            profile.ProfileId = userId;

            var updatedProfile = await _profileServices.CreateOrUpdateProfileAsync(profile, userId);
            return Ok(updatedProfile);
        }
    }
}
