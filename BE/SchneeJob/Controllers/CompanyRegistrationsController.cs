using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using SchneeJob.Interfaces;
using SchneeJob.Models;

namespace SchneeJob.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyRegistrationsController : ControllerBase
    {
        private readonly ICompanyRegistrationServices _registrationServices;
        public CompanyRegistrationsController(ICompanyRegistrationServices companyRegistrationServices)
        {
            _registrationServices = companyRegistrationServices;
        }
    [HttpPost]
        public async Task<IActionResult> SubmitRegistration([FromBody] CompanyRegistration request)
        {
            try
            {
                var submittedRequest = await _registrationServices.SubmitRegistrationAsync(request);
                return Ok(new { message = "Your registration request has been submitted successfully and is pending review." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAllRegistrations()
        {
            try
            {
                var registrations = await _registrationServices.GetAllRegistrationsAsync();
                return Ok(registrations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching registrations", error = ex.Message });
            }
        }
    }
}
