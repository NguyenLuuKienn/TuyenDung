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
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminServices _adminServices;
        public AdminController(IAdminServices adminServices)
        {
            _adminServices = adminServices;
        }
        // GET: api/admin/users?searchTerm=test&page=1&size=10
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            try
            {
                var qs = Request.Query;
                string searchTerm = qs.ContainsKey("searchTerm") ? qs["searchTerm"].ToString() : null;
                int pageNumber = 1;
                int pageSize = 10;
                if (qs.ContainsKey("page") && int.TryParse(qs["page"], out var p)) pageNumber = p;
                if (qs.ContainsKey("size") && int.TryParse(qs["size"], out var s)) pageSize = s;

                var users = await _adminServices.GetUsersAsync(searchTerm, pageNumber, pageSize);
                return Ok(users);
            }
            catch (Exception ex)
            {
                // Return detailed error for debugging client-side validation issues
                var inner = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"Error in GetUsers: {ex.Message}\nInner: {inner}");
                return BadRequest(new { message = "Failed to parse query or load users", error = ex.Message, innerException = inner });
            }
        }

        // GET: api/admin/jobs?searchTerm=dev&page=1&size=10
        [HttpGet("jobs")]
        public async Task<IActionResult> GetAllJobs([FromQuery] string searchTerm, [FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var jobs = await _adminServices.GetAllJobsAsync(searchTerm, page, size);
            return Ok(jobs); 
        }

        [HttpGet("reviews")]
        public async Task<IActionResult> GetAllReviews([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var reviews = await _adminServices.GetAllCompanyReviewsAsync(page, size);
            return Ok(reviews); 
        }
        [HttpGet("users/{userId}")]
        public async Task<IActionResult> GetUserDetail(Guid userId)
        {
            var user = await _adminServices.GetUserDetailAsync(userId);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPatch("users/{userId}/status")]
        public async Task<IActionResult> SetUserStatus(Guid userId, [FromBody] bool isActive)
        {
            var success = await _adminServices.SetUserActiveStatusAsync(userId, isActive);
            if (!success) return NotFound();
            return Ok(new { message = $"User status updated to {(isActive ? "Active" : "Inactive")}." });
        }
        [HttpDelete("jobs/{jobId}")]
        public async Task<IActionResult> RemoveJob(Guid jobId)
        {
            var success = await _adminServices.RemoveJobAsync(jobId);
            if (!success) return NotFound();
            return NoContent();
        }
        [HttpDelete("reviews/{reviewId}")]
        public async Task<IActionResult> RemoveReview(Guid reviewId)
        {
            var success = await _adminServices.RemoveCompanyReviewAsync(reviewId);
            if (!success) return NotFound();
            return NoContent();
        }

        public class RoleAssignmentRequest
        {
            public Guid RoleId { get; set; }
        }

        [HttpPost("users/{userId}/roles")]
        public async Task<IActionResult> AssignRole(Guid userId, [FromBody] RoleAssignmentRequest request)
        {
            var success = await _adminServices.AssignRoleToUserAsync(userId, request.RoleId);
            if (!success) return BadRequest("Failed to assign role. User or Role not found.");
            return Ok(new { message = "Role assigned successfully." });
        }

        [HttpDelete("users/{userId}/roles/{roleId}")]
        public async Task<IActionResult> RemoveRole(Guid userId, Guid roleId)
        {
            var success = await _adminServices.RemoveRoleFromUserAsync(userId, roleId);
            if (!success) return NotFound("User role assignment not found.");
            return NoContent();
        }
        [HttpGet("registrations/pending")]
        public async Task<IActionResult> GetPendingRegistrations()
        {
            return Ok(await _adminServices.GetPendingRegistrationsAsync());
        }

        [HttpPost("registrations/{requestId}/approve")]
        public async Task<IActionResult> ApproveRegistration(Guid requestId)
        {
            var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                if (await _adminServices.ApproveRegistrationAsync(requestId, adminId))
                {
                    return Ok(new { message = "Registration approved successfully." });
                }
                return BadRequest("Failed to approve registration.");
            }
            catch (Exception ex)
            {
                // Log full exception details for debugging
                var innerMsg = ex.InnerException?.Message ?? ex.Message;
                Console.WriteLine($"Error approving registration: {ex.Message}\nInner: {innerMsg}");
                return BadRequest(new { message = ex.Message, innerException = innerMsg });
            }
        }

        public class RejectRequest { public string Notes { get; set; } }

        [HttpPost("registrations/{requestId}/reject")]
        public async Task<IActionResult> RejectRegistration(Guid requestId, [FromBody] RejectRequest payload)
        {
            var adminId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            if (await _adminServices.RejectRegistrationAsync(requestId, adminId, payload.Notes))
            {
                return Ok(new { message = "Registration rejected." });
            }
            return NotFound();
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(Guid userId)
        {
            var success = await _adminServices.RemoveUserAsync(userId);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
