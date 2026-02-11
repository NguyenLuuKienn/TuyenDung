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
    [Authorize(Roles = "JobSeeker")]
    public class MatchingController : ControllerBase
    {
        private readonly IMatchingServices _matchingServices;
        public MatchingController(IMatchingServices matchingServices)
        {
            _matchingServices = matchingServices;
        }
        // GET: api/matching/job-suggestions
        [HttpGet("job-suggestions")]
        public async Task<IActionResult> GetJobSuggestions()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var jobs = await _matchingServices.GetJobSuggestionsAsync(userId);
            return Ok(jobs);
        }
    }
}
