using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using System.Security.Claims;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyReviewsController : ControllerBase
    {
        private readonly ICompanyReviewServices _companyReviewServices;
        public CompanyReviewsController(ICompanyReviewServices companyReviewServices)
        {
            _companyReviewServices = companyReviewServices;
        }
        // GET: api/reviews/company/{companyId} 
        [HttpGet("company/{companyId}")]
        public async Task<IActionResult> GetReviewsForCompany(Guid companyId)
        {
            var reviews = await _companyReviewServices.GetReviewsForCompanyAsync(companyId);
            return Ok(reviews);
        }

        // POST: api/reviews 
        [HttpPost]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> CreateReview([FromBody] CompanyReview review)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var createdReview = await _companyReviewServices.CreateReviewAsync(review, userId);
                return Ok(createdReview);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/reviews/{reviewId} (
        [HttpDelete("{reviewId}")]
        [Authorize] 
        public async Task<IActionResult> DeleteReview(Guid reviewId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var success = await _companyReviewServices.DeleteReviewAsync(reviewId, userId);
                if (!success)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
        }
    }
}
