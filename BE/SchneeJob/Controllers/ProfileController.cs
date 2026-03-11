using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.DTOs;
using SchneeJob.Interfaces;
using SchneeJob.Models;
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
        public async Task<IActionResult> CreateOrUpdateMyProfile([FromBody] UpdateProfileRequestDto request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var profile = new JobSeekerProfile
            {
                ProfileId = userId,
                UserId = userId,
                Headline = request.Headline,
                Summary = request.Summary,
                DateOfBirth = request.DateOfBirth,
                Gender = request.Gender,
                Address = request.Address,
                IsPublic = request.IsPublic,
                // Set collections to null so the service knows not to update them
                Educations = null,
                Experiences = null,
                JobSeekerSkills = null
            };

            var updatedProfile = await _profileServices.CreateOrUpdateProfileAsync(profile, userId, request.PhoneNumber);
            return Ok(updatedProfile);
        }

        // POST: api/profile/experiences
        [HttpPost("experiences")]
        public async Task<IActionResult> AddExperience([FromBody] Experience experience)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            if (string.IsNullOrWhiteSpace(experience.JobTitle) || string.IsNullOrWhiteSpace(experience.CompanyName))
            {
                return BadRequest("Job title and company name are required");
            }

            var result = await _profileServices.AddExperienceAsync(experience, userId);
            if (result == null)
            {
                return BadRequest("Failed to add experience");
            }

            return Ok(result);
        }

        // PUT: api/profile/experiences/{id}
        [HttpPut("experiences/{id}")]
        public async Task<IActionResult> UpdateExperience(Guid id, [FromBody] Experience experience)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (string.IsNullOrWhiteSpace(experience.JobTitle) || string.IsNullOrWhiteSpace(experience.CompanyName))
            {
                return BadRequest("Job title and company name are required");
            }

            var result = await _profileServices.UpdateExperienceAsync(id, experience, userId);
            if (result == null)
            {
                return BadRequest("Failed to update experience");
            }

            return Ok(result);
        }

        // DELETE: api/profile/experiences/{id}
        [HttpDelete("experiences/{id}")]
        public async Task<IActionResult> DeleteExperience(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var result = await _profileServices.DeleteExperienceAsync(id, userId);
            if (!result)
            {
                return BadRequest("Failed to delete experience");
            }

            return NoContent();
        }

        // POST: api/profile/educations
        [HttpPost("educations")]
        public async Task<IActionResult> AddEducation([FromBody] Education education)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (string.IsNullOrWhiteSpace(education.Degree) || string.IsNullOrWhiteSpace(education.SchoolName))
            {
                return BadRequest("Degree and school name are required");
            }

            var result = await _profileServices.AddEducationAsync(education, userId);
            if (result == null)
            {
                return BadRequest("Failed to add education");
            }

            return Ok(result);
        }

        // PUT: api/profile/educations/{id}
        [HttpPut("educations/{id}")]
        public async Task<IActionResult> UpdateEducation(Guid id, [FromBody] Education education)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (string.IsNullOrWhiteSpace(education.Degree) || string.IsNullOrWhiteSpace(education.SchoolName))
            {
                return BadRequest("Degree and school name are required");
            }

            var result = await _profileServices.UpdateEducationAsync(id, education, userId);
            if (result == null)
            {
                return BadRequest("Failed to update education");
            }

            return Ok(result);
        }

        // DELETE: api/profile/educations/{id}
        [HttpDelete("educations/{id}")]
        public async Task<IActionResult> DeleteEducation(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var result = await _profileServices.DeleteEducationAsync(id, userId);
            if (!result)
            {
                return BadRequest("Failed to delete education");
            }

            return NoContent();
        }

        // POST: api/profile/skills/{skillId}
        [HttpPost("skills/{skillId}")]
        public async Task<IActionResult> AddSkillToProfile(Guid skillId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var result = await _profileServices.AddSkillToProfileAsync(skillId, userId);
            if (!result)
            {
                return BadRequest("Failed to add skill to profile");
            }

            // Return updated profile with skills
            var profile = await _profileServices.GetProfileByUserIdAsync(userId);
            return Ok(profile);
        }

        // DELETE: api/profile/skills/{skillId}
        [HttpDelete("skills/{skillId}")]
        public async Task<IActionResult> RemoveSkillFromProfile(Guid skillId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var result = await _profileServices.RemoveSkillFromProfileAsync(skillId, userId);
            if (!result)
            {
                return BadRequest("Failed to remove skill from profile");
            }

            // Return updated profile with skills
            var profile = await _profileServices.GetProfileByUserIdAsync(userId);
            return Ok(profile);
        }
    }
}
