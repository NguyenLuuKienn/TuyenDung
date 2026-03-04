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
    public class JobController : ControllerBase
    {
        private readonly IJobServices _jobServices;
        public JobController(IJobServices jobServices)
        {
            _jobServices = jobServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllJobs()
        {
            var jobs = await _jobServices.GetAllJobsAsync();
            return Ok(jobs);
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            System.Diagnostics.Debug.WriteLine("[Health] Endpoint hit");
            return Ok(new { status = "ok", timestamp = DateTime.UtcNow });
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyJobs()
        {
            try
            {
                // Manual authorization check
                if (!User.Identity?.IsAuthenticated ?? true)
                {
                    System.Diagnostics.Debug.WriteLine("[GetMyJobs] User not authenticated");
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Check if user has Employer role
                if (!User.IsInRole("Employer"))
                {
                    System.Diagnostics.Debug.WriteLine("[GetMyJobs] User does not have Employer role");
                    return Forbid();
                }

                // Get the current user ID from JWT claims
                var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
                System.Diagnostics.Debug.WriteLine($"[GetMyJobs] User ID claim: {userIdClaim}");
                
                if (string.IsNullOrEmpty(userIdClaim))
                {
                    System.Diagnostics.Debug.WriteLine("[GetMyJobs] No user ID found in token");
                    return Unauthorized(new { message = "User ID not found in token" });
                }
                
                // Parse the user ID
                if (!Guid.TryParse(userIdClaim, out var currentUserId))
                {
                    System.Diagnostics.Debug.WriteLine($"[GetMyJobs] Failed to parse user ID: {userIdClaim}");
                    return BadRequest(new { message = "Invalid user ID format in token" });
                }
                
                System.Diagnostics.Debug.WriteLine($"[GetMyJobs] Fetching jobs for employer: {currentUserId}");
                
                // Fetch the jobs
                var jobs = await _jobServices.GetEmployerJobsAsync(currentUserId);
                
                System.Diagnostics.Debug.WriteLine($"[GetMyJobs] Found {(jobs?.Count() ?? 0)} jobs");
                return Ok(jobs ?? new List<Job>());
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"[GetMyJobs] Exception: {ex.GetType().Name}: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"[GetMyJobs] Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
            }
        }

        [HttpGet("debug/test")]
        [Authorize(Roles = "Employer")]
        public IActionResult DebugTest()
        {
            System.Diagnostics.Debug.WriteLine("[DebugTest] Endpoint hit successfully");
            return Ok(new { message = "Authorization working", timestamp = DateTime.UtcNow });
        }

        [HttpGet("{jobId}")]
        public async Task<IActionResult> GetJobById(Guid jobId)
        {
            var job = await _jobServices.GetJobByIdAsync(jobId);
            return Ok(job);
        }

        [HttpPost]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> CreateJob([FromBody] Job job)
        {
            var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var createJob = await _jobServices.CreateJobAsync(job, currentUserId);
            return CreatedAtAction(nameof(GetJobById), new { jobId = createJob.JobId }, createJob);
        }

        [HttpPut("{jobId}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateJob(Guid jobId, [FromBody] Job job)
        {
            var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var updatedJob = await _jobServices.UpdateJobAsync(jobId, job, currentUserId);
            return Ok(updatedJob);
        }

        [HttpDelete("{jobId}")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> DeleteJob(Guid jobId)
        {
            var currentUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            await _jobServices.DeleteJobAsync(jobId, currentUserId);
            return NoContent();
        }

    }
}
