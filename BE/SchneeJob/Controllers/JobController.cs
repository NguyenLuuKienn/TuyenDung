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
