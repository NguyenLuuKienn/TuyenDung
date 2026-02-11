using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Services;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyFollowController : ControllerBase
    {
        private readonly ICompanyFollowServices _companyFollowServices;
        public CompanyFollowController(ICompanyFollowServices companyFollowServices)
        {
            _companyFollowServices = companyFollowServices;
        }
        [HttpGet("company-follow")]
        public async Task<IActionResult> GetMyCompanyFollow()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            return Ok(await _companyFollowServices.GetMyFollowingCompaniesAsync(userId));
        }

        [HttpPost("company-follow/{companyId}")]
        public async Task<IActionResult> CompanyFollow(Guid companyId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                return Ok(await _companyFollowServices.FollowCompanyAsync(userId, companyId));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("company-follow/{companyId}")]
        public async Task<IActionResult> UnsaveJob(Guid companyId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (await _companyFollowServices.UnfollowCompanyAsync(userId, companyId))
            {
                return NoContent();
            }
            return NotFound();
        }
    }
}
