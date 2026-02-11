using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Services;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SavedJobController : ControllerBase
    {
        private readonly ISavedJobServices _savedJobServices;
        public SavedJobController(ISavedJobServices savedJobServices)
        {
            _savedJobServices = savedJobServices;
        }
        [HttpGet("saved-jobs")]
        public async Task<IActionResult> GetMySavedJobs()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("User ID not found in token");
            }
            return Ok(await _savedJobServices.GetMySavedJobsAsync(userId));
        }

        [HttpPost("saved-jobs/{jobId}")]
        public async Task<IActionResult> SaveJob(Guid jobId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                return Ok(await _savedJobServices.SaveJobAsync(userId, jobId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("saved-jobs/{jobId}")]
        public async Task<IActionResult> UnsaveJob(Guid jobId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (await _savedJobServices.UnsaveJobAsync(userId, jobId))
            {
                return NoContent();
            }
            return NotFound();
        }
    }
}
