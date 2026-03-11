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
    public class ResumesController : ControllerBase
    {
        private readonly IResumeServices _resumeServices;
        public ResumesController(IResumeServices resumeServices)
        {
            _resumeServices = resumeServices;
        }
        // GET: api/resumes
        [HttpGet]
        public async Task<IActionResult> GetMyResumes()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var resumes = await _resumeServices.GetResumesByUserIdAsync(userId);
            return Ok(resumes);
        }

        // GET: api/resumes/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetResume(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var resume = await _resumeServices.GetResumeByIdAsync(id, userId);
            if (resume == null)
            {
                return NotFound("Resume not found");
            }
            return Ok(resume);
        }

        // POST: api/resumes

        public class AddResumeRequest
        {
            public string Title { get; set; }
            public string FileName { get; set; }
            public string FileURL { get; set; }
            public string FileType { get; set; }
        }

        public class UpdateResumeRequest
        {
            public string Title { get; set; }
            public string FileName { get; set; }
            public string FileType { get; set; }
        }

        [HttpPost]
        public async Task<IActionResult> AddResume([FromBody] AddResumeRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var newResumeInfo = new Resume
            {
                Title = request.Title,
                FileName = request.FileName,
                FileURL = request.FileURL,
                FileType = request.FileType
            };

            var createdResume = await _resumeServices.AddResumeAsync(newResumeInfo, userId);
            return Ok(createdResume);
        }

        // PUT: api/resumes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResume(Guid id, [FromBody] UpdateResumeRequest request)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Resume title is required");
            }

            try
            {
                var updatedResume = await _resumeServices.UpdateResumeAsync(id, request.Title, request.FileName, request.FileType, userId);
                if (updatedResume == null)
                {
                    return NotFound("Resume not found");
                }
                return Ok(updatedResume);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // DELETE: api/resumes/{resumeId}
        [HttpDelete("{resumeId}")]
        public async Task<IActionResult> DeleteResume(Guid resumeId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            try
            {
                var success = await _resumeServices.DeleteResumeAsync(resumeId, userId);
                if (!success)
                {
                    return NotFound();
                }
                return NoContent();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PATCH: api/resumes/{resumeId}/set-default
        [HttpPatch("{resumeId}/set-default")]
        public async Task<IActionResult> SetDefault(Guid resumeId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var success = await _resumeServices.SetDefaultResumeAsync(resumeId, userId);
            if (!success)
            {
                return NotFound();
            }
            return Ok(new { message = "Default resume has been updated." });
        }
    }
}
