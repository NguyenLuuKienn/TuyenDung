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
    public class CompaniesController : ControllerBase
    {
        private ICompanyServices _companyServices;
        public CompaniesController(ICompanyServices companyServices)
        {
            _companyServices = companyServices;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCompanies()
        {
            try
            {
                var companies = await _companyServices.GetAllCompaniesAsync();
                return Ok(companies);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCompanyById(Guid id)
        {
            try
            {
                var company = await _companyServices.GetCompanyByIdAsync(id);
                if (company == null)
                {
                    return NotFound(new { message = "Company not found" });
                }
                return Ok(company);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("my-company")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> GetMyCompany()
        {
            var employerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var company = await _companyServices.GetCompanyByEmployerIdAsync(employerId);
            if (company == null)
            {
                return NotFound("Company profile not found for your account.");
            }
            return Ok(company);
        }

        [HttpPut("my-company")]
        [Authorize(Roles = "Employer")]
        public async Task<IActionResult> UpdateMyCompany([FromBody] Company company)
        {
            try
            {
                var employerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
                var updatedCompany = await _companyServices.UpdateCompanyAsync(company, employerId);
                return Ok(updatedCompany);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCompany(Guid id)
        {
            try
            {
                var result = await _companyServices.DeleteCompanyAsync(id);
                if (!result)
                {
                    return NotFound(new { message = "Company not found" });
                }
                return Ok(new { message = "Company deleted successfully" });
            }
            catch (Exception ex)
            {
                // Log full exception to see inner details (e.g. FK constraint)
                Console.WriteLine(ex.ToString());
                return BadRequest(new { message = "Could not delete company. " + ex.Message });
            }
        }

        [HttpPut("{id}/verify")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerifyCompany(Guid id, [FromBody] bool isVerified)
        {
            try
            {
                var company = await _companyServices.UpdateVerificationAsync(id, isVerified);
                return Ok(company);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { message = "Company not found" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
