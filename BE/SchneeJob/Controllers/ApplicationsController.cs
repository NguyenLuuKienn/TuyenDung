using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Services;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationsController : ControllerBase
    {
        private readonly IApplicationServices _applicationServices;
        public ApplicationsController(IApplicationServices applicationServices)
        {
            _applicationServices = applicationServices;
        }
        public class ApplyRequest
        {
            public Guid JobId { get; set; }
            public Guid ResumeId { get; set; }
            public string CoverLetter { get; set; }
        }

        // POST: api/applications 
        [HttpPost]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> ApplyForJob([FromBody] ApplyRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var application = await _applicationServices.ApplyForJobAsync(userId, request.JobId, request.ResumeId, request.CoverLetter);
                return Ok(application);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/applications/my (Job Seeker xem lịch sử)
        [HttpGet("my")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> GetMyApplications()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }
            var applications = await _applicationServices.GetMyApplicationsAsync(userId);
            return Ok(applications);
        }

        // GET: api/applications/job/{jobId} (Employer xem ứng viên)
        [HttpGet("job/{jobId}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> GetApplicationsForJob(Guid jobId)
        {
            var employerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var applications = await _applicationServices.GetApplicationsForJobAsync(jobId, employerId);
                return Ok(applications);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }

        public class UpdateStatusRequest
        {
            public string NewStatus { get; set; }
        }

        [HttpPatch("{applicationId}/status")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateApplicationStatus(Guid applicationId, [FromBody] UpdateStatusRequest request)
        {
            if (string.IsNullOrEmpty(request.NewStatus))
            {
                return BadRequest("NewStatus is required.");
            }

            var employerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var updatedApplication = await _applicationServices.UpdateApplicationStatusAsync(applicationId, request.NewStatus, employerId);
                return Ok(updatedApplication);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
