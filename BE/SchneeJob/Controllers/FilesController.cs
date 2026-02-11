using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FilesController : ControllerBase
    {
        private readonly IFileStorageServices _fileStorageServices;
        public FilesController(IFileStorageServices fileStorageServices)
        {
            _fileStorageServices = fileStorageServices;
        }
        [HttpPost("upload-resume")]
        [Authorize(Roles = "JobSeeker")]
        public async Task<IActionResult> UploadResume(IFormFile file)
        {
            try
            {
                var fileUrl = await _fileStorageServices.UploadFileAsync(file, "resumes");
                return Ok(new { url = fileUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while uploading the file.");
            }
        }

        [HttpPost("upload-logo")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UploadLogo(IFormFile file)
        {
            var fileUrl = await _fileStorageServices.UploadFileAsync(file, "logos");
            return Ok(new { url = fileUrl });
        }

        [HttpPost("upload-image")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            try
            {
                var fileUrl = await _fileStorageServices.UploadFileAsync(file, "posts");
                return Ok(new { url = fileUrl });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while uploading the file." });
            }
        }
    }
}
